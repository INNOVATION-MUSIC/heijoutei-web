import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { buildContactCustomerMail, buildContactStoreMail, type ContactPayload } from "@/app/lib/contactMail";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** SMTP トランスポートを env から生成（未設定なら null）。テイクアウトと同じ SMTP_* を共用 */
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

  const result = validate(body);
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: 400 });
  const contact = result.value;

  const transporter = createTransport();
  if (!transporter) {
    return NextResponse.json(
      { error: "メール送信の設定が未完了です。サーバーの環境変数（SMTP_*）を設定してください。" },
      { status: 500 }
    );
  }

  const from = process.env.MAIL_FROM || process.env.SMTP_USER!;
  const notifyTo = process.env.CONTACT_NOTIFY_TO || process.env.ORDER_NOTIFY_TO;

  try {
    // 店舗・管理者通知（宛先未設定ならスキップ）
    if (notifyTo) {
      const store = buildContactStoreMail(contact);
      await transporter.sendMail({ from, to: notifyTo, replyTo: contact.email, subject: store.subject, text: store.text, html: store.html });
    }
    // お客様控え（自動返信）
    const cust = buildContactCustomerMail(contact);
    await transporter.sendMail({ from, to: contact.email, subject: cust.subject, text: cust.text, html: cust.html });

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[contact] mail send failed:", e);
    return NextResponse.json({ error: "メールの送信に失敗しました。時間をおいて再度お試しください。" }, { status: 502 });
  }
}
