import { createStaticClient } from "@/lib/supabase/static";
import { adminSupabase } from "@/lib/supabase/admin";
import {
  TAKEOUT_STORES,
  TAKEOUT_CATEGORIES,
  TAKEOUT_MENU,
  TAKEOUT_TIME_SLOTS,
  normTime,
  type TakeoutStore,
  type TakeoutMenuItem,
  type DaySlotMap,
} from "./takeoutData";

// /takeout 注文フロー用の店舗一覧（DB stores → TakeoutStore）。DB空時は静的フォールバック。
export async function fetchTakeoutStores(): Promise<TakeoutStore[]> {
  try {
    const supabase = createStaticClient();
    const { data, error } = await supabase
      .from("stores")
      .select("slug, name, phone")
      .eq("is_active", true)
      .order("sort_order", { ascending: true });
    if (error || !data || data.length === 0) return TAKEOUT_STORES;
    return data.map((s) => ({ id: s.slug, name: s.name, tel: s.phone ?? "" }));
  } catch {
    return TAKEOUT_STORES;
  }
}

export type TakeoutMenuData = { categories: string[]; items: TakeoutMenuItem[] };

type MenuRow = {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  price: number;
  sort_order: number | null;
  takeout_categories: { name: string; sort_order: number | null } | null;
};

// 注文フローのメニュー（亀岡店基準＝共通品目＋亀岡bento）。現行の単一メニュー挙動を維持。
export async function fetchTakeoutMenu(): Promise<TakeoutMenuData> {
  const fallback: TakeoutMenuData = { categories: [...TAKEOUT_CATEGORIES], items: TAKEOUT_MENU };
  try {
    const supabase = createStaticClient();
    const [{ data: cats }, { data: kameoka }] = await Promise.all([
      supabase.from("takeout_categories").select("name, sort_order").eq("is_active", true).order("sort_order"),
      supabase.from("stores").select("id").eq("slug", "kameoka").maybeSingle(),
    ]);
    if (!cats || cats.length === 0 || !kameoka) return fallback;

    const { data: menus, error } = await supabase
      .from("store_takeout_menus")
      .select("id, name, description, image_url, price, sort_order, takeout_categories(name, sort_order), store_takeout_menu_stores!inner(store_id)")
      .eq("is_active", true)
      .eq("store_takeout_menu_stores.store_id", kameoka.id);
    if (error || !menus || menus.length === 0) return fallback;

    const rows = menus as unknown as MenuRow[];
    rows.sort((a, b) => {
      const ca = a.takeout_categories?.sort_order ?? 0;
      const cb = b.takeout_categories?.sort_order ?? 0;
      if (ca !== cb) return ca - cb;
      return (a.sort_order ?? 0) - (b.sort_order ?? 0);
    });

    const items: TakeoutMenuItem[] = rows.map((r) => ({
      id: r.id,
      category: (r.takeout_categories?.name ?? "") as TakeoutMenuItem["category"],
      name: r.name,
      desc: r.description ?? "",
      price: r.price,
      img: r.image_url ?? "",
    }));
    const categories = cats.map((c) => c.name);
    return { categories, items };
  } catch {
    return fallback;
  }
}

// 注文フローのメニューを店舗slug別に取得（Step1で選んだ店舗のメニューをStep2に出すため）。
// カテゴリは全店共通。品目は store_takeout_menu_stores の junction で各店に割当（共通品目は全店・bento等は店舗別）。
// DB空・失敗時は {} を返し、TakeoutClient 側で静的フォールバックする。
export async function fetchTakeoutMenuByStore(): Promise<Record<string, TakeoutMenuData>> {
  try {
    const supabase = createStaticClient();
    const [{ data: cats }, { data: stores }] = await Promise.all([
      supabase.from("takeout_categories").select("name, sort_order, store_ids").eq("is_active", true).order("sort_order"),
      supabase.from("stores").select("id, slug").eq("is_active", true),
    ]);
    if (!cats || cats.length === 0 || !stores || stores.length === 0) return {};
    // カテゴリは店舗別（store_ids 未指定=全店）。店舗ごとに対象カテゴリ名リストを作る。
    const categoriesForStore = (storeId: string) =>
      (cats as { name: string; store_ids: string[] | null }[])
        .filter((c) => !c.store_ids || c.store_ids.length === 0 || c.store_ids.includes(storeId))
        .map((c) => c.name);

    const { data: menus, error } = await supabase
      .from("store_takeout_menus")
      .select("id, name, description, image_url, price, sort_order, takeout_categories(name, sort_order), store_takeout_menu_stores(store_id)")
      .eq("is_active", true);
    if (error || !menus || menus.length === 0) return {};

    const rows = menus as unknown as (MenuRow & { store_takeout_menu_stores: { store_id: string }[] })[];
    // カテゴリ順→品目順にソートしておけば、各店へ push する順序もそのまま整う
    rows.sort((a, b) => {
      const ca = a.takeout_categories?.sort_order ?? 0;
      const cb = b.takeout_categories?.sort_order ?? 0;
      if (ca !== cb) return ca - cb;
      return (a.sort_order ?? 0) - (b.sort_order ?? 0);
    });

    const slugById = new Map(stores.map((s) => [s.id, s.slug]));
    const result: Record<string, TakeoutMenuData> = {};
    for (const s of stores) result[s.slug] = { categories: categoriesForStore(s.id), items: [] };

    for (const r of rows) {
      const item: TakeoutMenuItem = {
        id: r.id,
        category: (r.takeout_categories?.name ?? "") as TakeoutMenuItem["category"],
        name: r.name,
        desc: r.description ?? "",
        price: r.price,
        img: r.image_url ?? "",
      };
      for (const j of r.store_takeout_menu_stores ?? []) {
        const slug = slugById.get(j.store_id);
        if (slug && result[slug]) result[slug].items.push(item);
      }
    }
    // 品目が1件も無い店舗は除外（TakeoutClient 側で静的フォールバックさせる）
    for (const slug of Object.keys(result)) {
      if (result[slug].items.length === 0) delete result[slug];
    }
    return result;
  } catch {
    return {};
  }
}

// 受付枠（takeout_slots / takeout_slot_times）を店舗slug別に取得。
// 戻り値 = { storeSlug: { iso: DaySlotInfo } }。当月〜翌々月頭までの公開枠（31日先までの予約に必要な範囲）。
// DB空・未投入時は {} を返し、buildCalendar はアルゴリズム既定にフォールバックする（注文不能にならない）。
// 定員(capacity)は既存の takeout_orders 件数（組数）と突き合わせ、満枠の時間帯は fullTimeLabels に振り分ける。
// takeout_orders は anon から読めない（RLS で service_role 専用）ため、この関数は adminSupabase を使う。
export async function fetchTakeoutSlots(): Promise<Record<string, DaySlotMap>> {
  const iso = (y: number, m: number, d: number) =>
    `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
  try {
    const supabase = createStaticClient();
    const today = new Date();
    const start = iso(today.getFullYear(), today.getMonth(), 1);
    const endD = new Date(today.getFullYear(), today.getMonth() + 2, 0); // 翌々月末日
    const end = iso(endD.getFullYear(), endD.getMonth(), endD.getDate());

    const { data: slots, error } = await supabase
      .from("takeout_slots")
      .select("id, store_id, available_date, is_closed, stores(slug)")
      .gte("available_date", start)
      .lte("available_date", end);
    if (error || !slots || slots.length === 0) return {};

    const slotIds = slots.map((s) => s.id);
    const { data: times } = await supabase
      .from("takeout_slot_times")
      .select("slot_id, time_label, is_active, capacity, sort_order")
      .in("slot_id", slotIds)
      .order("sort_order", { ascending: true });

    // 定員との突き合わせに必要な既存注文件数（組数）を店舗×受取日×受取時間で集計する。
    // キャンセル済みは枠を占有しないため対象外。
    const storeIds = Array.from(new Set(slots.map((s) => s.store_id)));
    const { data: existingOrders } = await adminSupabase
      .from("takeout_orders")
      .select("store_id, pickup_date, pickup_time")
      .in("store_id", storeIds)
      .gte("pickup_date", start)
      .lte("pickup_date", end)
      .neq("status", "cancelled");
    const countByKey = new Map<string, number>();
    for (const o of existingOrders ?? []) {
      const key = `${o.store_id}|${o.pickup_date}|${normTime(o.pickup_time)}`;
      countByKey.set(key, (countByKey.get(key) ?? 0) + 1);
    }

    const timesBySlot = new Map<string, { label: string; capacity: number }[]>();
    for (const t of times ?? []) {
      if (t.is_active === false) continue; // 受付可能な枠のみ
      const arr = timesBySlot.get(t.slot_id) ?? [];
      arr.push({ label: t.time_label, capacity: t.capacity });
      timesBySlot.set(t.slot_id, arr);
    }

    const result: Record<string, DaySlotMap> = {};
    for (const s of slots) {
      const slug = (s as unknown as { stores?: { slug?: string } }).stores?.slug;
      if (!slug) continue;
      const entries = timesBySlot.get(s.id) ?? [];
      const timeLabels: string[] = [];
      const fullTimeLabels: string[] = [];
      for (const e of entries) {
        const key = `${s.store_id}|${s.available_date}|${normTime(e.label)}`;
        const used = countByKey.get(key) ?? 0;
        if (used >= e.capacity) fullTimeLabels.push(e.label);
        else timeLabels.push(e.label);
      }
      const map = (result[slug] ??= {});
      map[s.available_date] = {
        isClosed: s.is_closed ?? false,
        timeLabels,
        fullTimeLabels,
      };
    }
    return result;
  } catch {
    return {};
  }
}

/**
 * 受取日の受付可能な時間枠（正規化済み）を返す。空集合＝その日は受付不可。
 * DBに枠がある日はDB（休止/受付・時間枠）を優先し、無い日は既定（火曜定休・他は全枠）にフォールバック。
 * buildCalendar と同じ判定をサーバー側で再現する。
 * 定員(組数)チェック：DBに枠がある場合、同一店舗・受取日・受取時間の既存注文数(キャンセル除く)が
 * capacity に達している時間帯は除外する。api/takeout/route.ts の最終検証(POST)から呼ばれる。
 */
export async function resolveAvailableTimes(storeId: string | null, pickupDate: string): Promise<Set<string>> {
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
    .select("time_label, is_active, capacity")
    .eq("slot_id", slot.id);
  const activeTimes = (times ?? []).filter((t) => t.is_active !== false);
  if (activeTimes.length === 0) return new Set();

  const { data: existing } = await adminSupabase
    .from("takeout_orders")
    .select("pickup_time")
    .eq("store_id", storeId)
    .eq("pickup_date", pickupDate)
    .neq("status", "cancelled");
  const countByTime = new Map<string, number>();
  for (const o of existing ?? []) {
    const key = normTime(o.pickup_time);
    countByTime.set(key, (countByTime.get(key) ?? 0) + 1);
  }

  const labels = new Set<string>();
  for (const t of activeTimes) {
    const key = normTime(t.time_label);
    const used = countByTime.get(key) ?? 0;
    if (used < t.capacity) labels.add(key);
  }
  return labels;
}
