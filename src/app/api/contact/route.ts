import { NextResponse } from "next/server";
import { buildContactCustomerMail, buildContactStoreMail, type ContactPayload } from "@/app/lib/contactMail";
import { sendEmail } from "@/app/lib/email";
import { verifyTurnstile } from "@/app/lib/turnstile";
import { adminSupabase } from "@/lib/supabase/admin";
import { CONTACT_STORES, INQUIRY_TYPES } from "@/app/lib/contactData";
import { getStoreDetail } from "@/app/lib/storeDetailData";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// 各項目の最大長（DB / メールへ流す前の上限）
const MAX_NAME = 100;
const MAX_KANA = 100;
const MAX_EMAIL = 200;
const MAX_PHONE = 30;
const MAX_MESSAGE = 2000;

// クライアントから受け取る最小ペイロード（storeTel は送らせずサーバーで解決する）
type ContactRequest = {
  name: string;
  kana: string;
  email: string;
  phone: string;
  inquiryType: string;
  store: string; // 店舗名（許可リスト照合＋tel はサーバーで解決）
  message: string;
};

type Fail = { ok: false; error: string };
const fail = (error: string): Fail => ({ ok: false, error });
const str = (v: unknown) => (typeof v === "string" ? v : "");

/** ペイロードの形・長さ・許可リストを検証（store の正当性＝tel 解決は後段で確定する） */
function parseRequest(data: unknown): Fail | { ok: true; value: ContactRequest } {
  if (typeof data !== "object" || data === null) return fail("不正なリクエストです。");
  const o = data as Record<string, unknown>;

  const name = str(o.name).trim();
  const kana = str(o.kana).trim();
  const email = str(o.email).trim();
  const phone = str(o.phone).trim();
  const inquiryType = str(o.inquiryType).trim();
  const store = str(o.store).trim();
  const message = str(o.message);

  if (!name || !kana) return fail("お名前・フリガナを入力してください。");
  if (!email || !EMAIL_RE.test(email)) return fail("メールアドレスが正しくありません。");
  if (!inquiryType || !store) return fail("お問い合わせ種別・ご利用予定店舗を選択してください。");

  if (name.length > MAX_NAME || kana.length > MAX_KANA || email.length > MAX_EMAIL) {
    return fail("入力が長すぎます。");
  }
  if (phone.length > MAX_PHONE || message.length > MAX_MESSAGE) return fail("入力が長すぎます。");

  // お問い合わせ種別は許可リスト（enum）のみ
  if (!(INQUIRY_TYPES as readonly string[]).includes(inquiryType)) {
    return fail("お問い合わせ種別が不正です。");
  }

  return { ok: true, value: { name, kana, email, phone, inquiryType, store, message } };
}

/**
 * 店舗名を許可リストで解決し、電話番号をサーバー側で確定する（クライアントの storeTel は信用しない）。
 * DB（stores・active）優先、空時のみ静的 CONTACT_STORES にフォールバック（フロントの挙動と一致）。
 */
async function resolveStore(name: string): Promise<{ name: string; tel: string; hours: string; closedDays: string } | null> {
  const { data } = await adminSupabase
    .from("stores")
    .select("name, phone, business_hours, closed_days")
    .eq("is_active", true);
  const rows = (data ?? []) as { name: string; phone: string | null; business_hours: string | null; closed_days: string | null }[];
  if (rows.length > 0) {
    const hit = rows.find((r) => r.name === name);
    return hit ? { name: hit.name, tel: hit.phone ?? "", hours: hit.business_hours ?? "", closedDays: hit.closed_days ?? "" } : null;
  }
  const s = CONTACT_STORES.find((s) => s.name === name);
  if (!s) return null;
  const detail = getStoreDetail(s.id);
  return { name: s.name, tel: s.tel, hours: detail?.hours.join("\n") ?? "", closedDays: detail?.closed ?? "" };
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "リクエストの解析に失敗しました。" }, { status: 400 });
  }

  // Turnstile 検証（鍵未設定なら素通り）
  const token = (body as { turnstileToken?: string })?.turnstileToken;
  const ip = request.headers.get("cf-connecting-ip") ?? request.headers.get("x-forwarded-for");
  if (!(await verifyTurnstile(token, ip))) {
    return NextResponse.json({ error: "認証に失敗しました。ページを再読み込みして再度お試しください。" }, { status: 400 });
  }

  const parsed = parseRequest(body);
  if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 });
  const req = parsed.value;

  // 店舗を許可リストで解決（tel はここで確定＝クライアント値は使わない）
  const store = await resolveStore(req.store);
  if (!store) return NextResponse.json({ error: "ご利用予定店舗が不正です。" }, { status: 400 });

  // 検証を通った正規データだけで以後を構築
  const contact: ContactPayload = {
    name: req.name,
    kana: req.kana,
    email: req.email,
    phone: req.phone,
    inquiryType: req.inquiryType,
    store: store.name,
    storeTel: store.tel,
    storeHours: store.hours,
    storeClosedDays: store.closedDays,
    message: req.message,
  };

  // DB へ保存（管理画面「お問い合わせ管理」に届く）。メール未設定でも受付は成立させる。
  const { error: dbError } = await adminSupabase.from("contact_messages").insert({
    name: contact.name,
    kana: contact.kana,
    email: contact.email,
    phone: contact.phone || null,
    subject: `${contact.inquiryType}（${contact.store}）`,
    message: contact.message || "",
  });
  if (dbError) {
    console.error("[contact] db insert failed:", dbError);
    return NextResponse.json({ error: "送信に失敗しました。時間をおいて再度お試しください。" }, { status: 500 });
  }

  // メール送信（Brevo HTTP API・best-effort）。本文生成/送信が失敗しても受付は保存済みなので ok を返す。
  try {
    const notifyTo = process.env.CONTACT_NOTIFY_TO || process.env.ORDER_NOTIFY_TO;
    if (notifyTo) {
      const storeMail = buildContactStoreMail(contact);
      await sendEmail({ to: notifyTo, replyTo: contact.email, subject: storeMail.subject, text: storeMail.text, html: storeMail.html });
    }
    const cust = buildContactCustomerMail(contact);
    await sendEmail({ to: contact.email, subject: cust.subject, text: cust.text, html: cust.html });
  } catch (e) {
    console.error("[contact] mail send failed (受付は保存済み):", e);
  }

  return NextResponse.json({ ok: true });
}
