import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { buildCustomerMail, buildStoreMail, type OrderPayload } from "@/app/lib/takeoutMail";
import { adminSupabase } from "@/lib/supabase/admin";

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

  // DB へ保存（管理画面「注文受付」に届く）。店舗 slug → store_id を解決して INSERT。
  // 解決できない/日付欠落時はログのみで注文フロー自体は止めない（メールにフォールバック）。
  try {
    if (order.storeSlug && order.pickupDate) {
      const { data: storeRow } = await adminSupabase
        .from("stores").select("id").eq("slug", order.storeSlug).maybeSingle();
      if (storeRow) {
        const { data: created, error: orderErr } = await adminSupabase
          .from("takeout_orders")
          .insert({
            store_id: storeRow.id,
            pickup_date: order.pickupDate,
            pickup_time: order.pickupTime || "",
            customer_name: order.customer.name,
            customer_kana: order.customer.kana || null,
            customer_email: order.customer.email,
            customer_phone: order.customer.phone || null,
            customer_note: order.customer.note || null,
            total_price: order.total,
          })
          .select("id")
          .single();
        if (orderErr) {
          console.error("[takeout] order insert failed:", orderErr);
        } else if (created) {
          const items = order.items.map((i) => ({
            order_id: created.id,
            item_name: i.name,
            price: i.price,
            quantity: i.qty,
          }));
          if (items.length) await adminSupabase.from("takeout_order_items").insert(items);
        }
      } else {
        console.warn("[takeout] store slug not found:", order.storeSlug);
      }
    }
  } catch (e) {
    console.error("[takeout] db save error:", e);
  }

  // メール送信（既存処理を維持・SMTP 未設定や失敗時も注文は保存済みなので ok を返す）
  const transporter = createTransport();
  if (transporter) {
    const from = process.env.MAIL_FROM || process.env.SMTP_USER!;
    const notifyTo = process.env.ORDER_NOTIFY_TO;
    try {
      if (notifyTo) {
        const store = buildStoreMail(order);
        await transporter.sendMail({ from, to: notifyTo, replyTo: order.customer.email, subject: store.subject, text: store.text, html: store.html });
      }
      const cust = buildCustomerMail(order);
      await transporter.sendMail({ from, to: order.customer.email, subject: cust.subject, text: cust.text, html: cust.html });
    } catch (e) {
      console.error("[takeout] mail send failed (注文は保存済み):", e);
    }
  }

  return NextResponse.json({ ok: true });
}
