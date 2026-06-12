import { NextResponse } from "next/server";
import { buildContactCustomerMail, buildContactStoreMail, type ContactPayload } from "@/app/lib/contactMail";
import { sendEmail } from "@/app/lib/email";
import { verifyTurnstile } from "@/app/lib/turnstile";
import { adminSupabase } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** 受け取ったお問い合わせペイロードを検証 */
function validate(data: unknown): { ok: true; value: ContactPayload } | { ok: false; error: string } {
  if (typeof data !== "object" || data === null) return { ok: false, error: "不正なリクエストです。" };
  const o = data as Partial<ContactPayload>;
  if (!o.name?.trim() || !o.kana?.trim()) return { ok: false, error: "お名前・フリガナを入力してください。" };
  if (!o.email?.trim() || !EMAIL_RE.test(o.email)) return { ok: false, error: "メールアドレスが正しくありません。" };
  if (!o.inquiryType || !o.store) return { ok: false, error: "お問い合わせ種別・ご利用予定店舗を選択してください。" };
  return { ok: true, value: o as ContactPayload };
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

  const result = validate(body);
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: 400 });
  const contact = result.value;

  // DB へ保存（管理画面「お問い合わせ管理」に届く）。メール未設定でも受付は成立させる。
  const { error: dbError } = await adminSupabase.from("contact_messages").insert({
    name: contact.name,
    kana: contact.kana,
    email: contact.email,
    phone: contact.phone || null,
    subject: contact.store ? `${contact.inquiryType}（${contact.store}）` : contact.inquiryType,
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
      const store = buildContactStoreMail(contact);
      await sendEmail({ to: notifyTo, replyTo: contact.email, subject: store.subject, text: store.text, html: store.html });
    }
    const cust = buildContactCustomerMail(contact);
    await sendEmail({ to: contact.email, subject: cust.subject, text: cust.text, html: cust.html });
  } catch (e) {
    console.error("[contact] mail send failed (受付は保存済み):", e);
  }

  return NextResponse.json({ ok: true });
}
