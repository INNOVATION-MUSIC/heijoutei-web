import { NextResponse } from "next/server";
import { buildCustomerMail, buildStoreMail, type OrderItem, type OrderPayload } from "@/app/lib/takeoutMail";
import { sendEmail } from "@/app/lib/email";
import { verifyTurnstile } from "@/app/lib/turnstile";
import { adminSupabase } from "@/lib/supabase/admin";
import { TAKEOUT_MENU, TAKEOUT_STORES, TAKEOUT_TIME_SLOTS, formatJpDate } from "@/app/lib/takeoutData";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const PICKUP_WINDOW_DAYS = 31; // buildCalendar と同じ「本日〜31日先」までを受け付ける
const MAX_QTY = 99;

const pad = (n: number) => String(n).padStart(2, "0");
const isoUTC = (dt: Date) => `${dt.getUTCFullYear()}-${pad(dt.getUTCMonth() + 1)}-${pad(dt.getUTCDate())}`;
const normTime = (s: string) => s.replace(/\s/g, ""); // "11 : 30" / "11:30" を "1130" 比較用に揃える

// クライアントから受け取る最小ペイロード（価格・合計・商品名は送らせない）
type OrderRequest = {
  storeSlug: string;
  pickupDate: string; // "YYYY-MM-DD"
  pickupTime: string; // "11:30"
  items: { id: string; qty: number }[];
  customer: { name: string; kana: string; email: string; phone: string; note: string };
};

type Fail = { ok: false; error: string };
const fail = (error: string): Fail => ({ ok: false, error });

/** ペイロードの形だけを検証（中身の正当性=価格/在庫/枠は後段の DB 照合で確定する） */
function parseRequest(data: unknown): Fail | { ok: true; value: OrderRequest } {
  if (typeof data !== "object" || data === null) return fail("不正なリクエストです。");
  const o = data as Partial<OrderRequest>;
  if (typeof o.storeSlug !== "string" || !o.storeSlug.trim()) return fail("受取店舗を選択してください。");
  if (typeof o.pickupDate !== "string" || !DATE_RE.test(o.pickupDate)) return fail("受取日を選択してください。");
  if (typeof o.pickupTime !== "string" || !normTime(o.pickupTime)) return fail("受取時間を選択してください。");
  if (!Array.isArray(o.items) || o.items.length === 0) return fail("商品が選択されていません。");
  if (o.items.length > 100) return fail("商品の点数が多すぎます。");
  const items: { id: string; qty: number }[] = [];
  for (const raw of o.items) {
    if (typeof raw !== "object" || raw === null) return fail("商品が不正です。");
    const id = (raw as { id?: unknown }).id;
    const qty = (raw as { qty?: unknown }).qty;
    if (typeof id !== "string" || !id) return fail("商品が不正です。");
    if (typeof qty !== "number" || !Number.isInteger(qty) || qty < 1 || qty > MAX_QTY) {
      return fail("数量が不正です。");
    }
    items.push({ id, qty });
  }
  const c = o.customer;
  if (typeof c !== "object" || c === null) return fail("お客様情報が不正です。");
  if (!c.name?.trim() || !c.kana?.trim()) return fail("お名前・フリガナを入力してください。");
  if (!c.email?.trim() || !EMAIL_RE.test(c.email)) return fail("メールアドレスが正しくありません。");
  if ((c.name?.length ?? 0) > 100 || (c.kana?.length ?? 0) > 100 || (c.email?.length ?? 0) > 200) {
    return fail("入力が長すぎます。");
  }
  if ((c.phone?.length ?? 0) > 30 || (c.note?.length ?? 0) > 2000) return fail("入力が長すぎます。");
  return {
    ok: true,
    value: {
      storeSlug: o.storeSlug,
      pickupDate: o.pickupDate,
      pickupTime: o.pickupTime,
      items,
      customer: { name: c.name, kana: c.kana, email: c.email, phone: c.phone ?? "", note: c.note ?? "" },
    },
  };
}

/** 店舗を解決（DB優先・DB空時のみ静的フォールバック）。id は DB のときのみ INSERT に使える。 */
async function resolveStore(slug: string): Promise<{ id: string | null; name: string; tel: string } | null> {
  const { data } = await adminSupabase
    .from("stores")
    .select("id, name, phone")
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();
  if (data) return { id: data.id, name: data.name, tel: data.phone ?? "" };
  const s = TAKEOUT_STORES.find((s) => s.id === slug);
  return s ? { id: null, name: s.name, tel: s.tel } : null;
}

/** 店舗のテイクアウトメニュー（id → {name, price}）。DBに無ければ静的メニューにフォールバック（クライアント挙動と一致）。 */
async function resolveMenu(storeId: string | null): Promise<Map<string, { name: string; price: number }>> {
  const map = new Map<string, { name: string; price: number }>();
  if (storeId) {
    const { data } = await adminSupabase
      .from("store_takeout_menus")
      .select("id, name, price, store_takeout_menu_stores!inner(store_id)")
      .eq("is_active", true)
      .eq("store_takeout_menu_stores.store_id", storeId);
    for (const r of (data ?? []) as { id: string; name: string; price: number }[]) {
      map.set(r.id, { name: r.name, price: r.price });
    }
  }
  if (map.size === 0) {
    for (const m of TAKEOUT_MENU) map.set(m.id, { name: m.name, price: m.price });
  }
  return map;
}

/**
 * 受取日の受付可能な時間枠（正規化済み）を返す。空配列＝その日は受付不可。
 * DBに枠がある日はDB（休止/受付・時間枠）を優先し、無い日は既定（火曜定休・他は全枠）にフォールバック。
 * buildCalendar と同じ判定をサーバー側で再現する。
 */
async function resolveAvailableTimes(storeId: string | null, pickupDate: string): Promise<Set<string>> {
  const defaultTimes = (): Set<string> => {
    const [y, m, d] = pickupDate.split("-").map(Number);
    const weekday = new Date(Date.UTC(y, m - 1, d)).getUTCDay();
    if (weekday === 2) return new Set(); // 火曜定休（既定）
    return new Set(TAKEOUT_TIME_SLOTS.map(normTime));
  };

  if (!storeId) return defaultTimes();

  const { data: slot } = await adminSupabase
    .from("takeout_slots")
    .select("id, is_closed")
    .eq("store_id", storeId)
    .eq("available_date", pickupDate)
    .maybeSingle();
  if (!slot) return defaultTimes();
  if (slot.is_closed) return new Set();

  const { data: times } = await adminSupabase
    .from("takeout_slot_times")
    .select("time_label, is_active")
    .eq("slot_id", slot.id);
  const labels = (times ?? []).filter((t) => t.is_active !== false).map((t) => normTime(t.time_label));
  return new Set(labels);
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

  try {
    // 1) 店舗
    const store = await resolveStore(req.storeSlug);
    if (!store) return NextResponse.json({ error: "受取店舗が見つかりません。" }, { status: 400 });

    // 2) 受取日（本日〜31日先のみ・JST基準）
    const now = new Date(Date.now() + 9 * 3600 * 1000);
    const todayDt = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    const maxDt = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + PICKUP_WINDOW_DAYS));
    const todayStr = isoUTC(todayDt);
    const maxStr = isoUTC(maxDt);
    if (req.pickupDate < todayStr || req.pickupDate > maxStr) {
      return NextResponse.json({ error: "受取日は本日から31日以内で選択してください。" }, { status: 400 });
    }

    // 3) 受取時間（定休日・休止・満枠・対象外の時刻を拒否）
    const allowedTimes = await resolveAvailableTimes(store.id, req.pickupDate);
    if (allowedTimes.size === 0) {
      return NextResponse.json({ error: "選択された受取日は受付できません。別の日をお選びください。" }, { status: 400 });
    }
    if (!allowedTimes.has(normTime(req.pickupTime))) {
      return NextResponse.json({ error: "選択された受取時間は受付できません。" }, { status: 400 });
    }

    // 4) 商品・価格・合計（サーバー側でメニューから再計算）
    const menu = await resolveMenu(store.id);
    const items: OrderItem[] = [];
    let total = 0;
    for (const line of req.items) {
      const m = menu.get(line.id);
      if (!m) return NextResponse.json({ error: "選択できない商品が含まれています。" }, { status: 400 });
      items.push({ name: m.name, price: m.price, qty: line.qty });
      total += m.price * line.qty;
    }

    // 検証を通った正規データだけで注文オブジェクトを構築（以後クライアント値は一切使わない）
    const order: OrderPayload = {
      store: store.name,
      storeTel: store.tel,
      dateLabel: `${formatJpDate(req.pickupDate)} ${normTime(req.pickupTime)}`.trim(),
      items,
      total,
      customer: req.customer,
      storeSlug: req.storeSlug,
      pickupDate: req.pickupDate,
      pickupTime: normTime(req.pickupTime),
    };

    // DB へ保存（管理画面「注文受付」に届く）。DB店舗のときのみ INSERT。失敗してもメールにフォールバック。
    if (store.id) {
      try {
        const { data: created, error: orderErr } = await adminSupabase
          .from("takeout_orders")
          .insert({
            store_id: store.id,
            pickup_date: req.pickupDate,
            pickup_time: normTime(req.pickupTime),
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
          const rows = order.items.map((i) => ({ order_id: created.id, item_name: i.name, price: i.price, quantity: i.qty }));
          if (rows.length) await adminSupabase.from("takeout_order_items").insert(rows);
        }
      } catch (e) {
        console.error("[takeout] db save error:", e);
      }
    }

    // メール送信（Brevo HTTP API・best-effort）。失敗しても注文は保存済みなので ok を返す。
    try {
      const notifyTo = process.env.ORDER_NOTIFY_TO;
      if (notifyTo) {
        const storeMail = buildStoreMail(order);
        await sendEmail({ to: notifyTo, replyTo: order.customer.email, subject: storeMail.subject, text: storeMail.text, html: storeMail.html });
      }
      const cust = buildCustomerMail(order);
      await sendEmail({ to: order.customer.email, subject: cust.subject, text: cust.text, html: cust.html });
    } catch (e) {
      console.error("[takeout] mail send failed (注文は保存済み):", e);
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[takeout] unexpected error:", e);
    return NextResponse.json({ error: "注文処理に失敗しました。時間をおいて再度お試しください。" }, { status: 500 });
  }
}
