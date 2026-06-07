import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { buildCustomerMail, buildStoreMail, type OrderPayload } from "@/app/lib/takeoutMail";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** SMTP トランスポートを env から生成（未設定なら null） */
function createTransport() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!host || !user || !pass) return null;
  return nodemailer.createTransport({
    host,
    port,
    secure: process.env.SMTP_SECURE === "true" || port === 465, // 465=SSL, 587=STARTTLS
    auth: { user, pass },
  });
}

/** 受け取った注文ペイロードを検証 */
function validate(data: unknown): { ok: true; value: OrderPayload } | { ok: false; error: string } {
  if (typeof data !== "object" || data === null) return { ok: false, error: "不正なリクエストです。" };
  const o = data as Partial<OrderPayload>;
  if (!o.store || !o.dateLabel) return { ok: false, error: "受取店舗・受取日時を選択してください。" };
  if (!Array.isArray(o.items) || o.items.length === 0) return { ok: false, error: "商品が選択されていません。" };
  if (typeof o.total !== "number") return { ok: false, error: "合計金額が不正です。" };
  const c = o.customer;
  if (!c || !c.name?.trim() || !c.kana?.trim()) return { ok: false, error: "お名前・フリガナを入力してください。" };
  if (!c.email?.trim() || !EMAIL_RE.test(c.email)) return { ok: false, error: "メールアドレスが正しくありません。" };
  return { ok: true, value: o as OrderPayload };
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "リクエストの解析に失敗しました。" }, { status: 400 });
  }

  const result = validate(body);
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: 400 });
  const order = result.value;

  const transporter = createTransport();
  if (!transporter) {
    return NextResponse.json(
      { error: "メール送信の設定が未完了です。サーバーの環境変数（SMTP_*）を設定してください。" },
      { status: 500 }
    );
  }

  const from = process.env.MAIL_FROM || process.env.SMTP_USER!;
  const notifyTo = process.env.ORDER_NOTIFY_TO;

  try {
    // 店舗通知（宛先未設定ならスキップ）
    if (notifyTo) {
      const store = buildStoreMail(order);
      await transporter.sendMail({ from, to: notifyTo, replyTo: order.customer.email, subject: store.subject, text: store.text, html: store.html });
    }
    // お客様控え
    const cust = buildCustomerMail(order);
    await transporter.sendMail({ from, to: order.customer.email, subject: cust.subject, text: cust.text, html: cust.html });

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[takeout] mail send failed:", e);
    return NextResponse.json({ error: "メールの送信に失敗しました。時間をおいて再度お試しください。" }, { status: 502 });
  }
}
