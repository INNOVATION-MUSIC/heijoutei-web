import { createStaticClient } from "@/lib/supabase/static";
import {
  TAKEOUT_STORES,
  TAKEOUT_CATEGORIES,
  TAKEOUT_MENU,
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
      supabase.from("takeout_categories").select("name, sort_order").eq("is_active", true).order("sort_order"),
      supabase.from("stores").select("id, slug").eq("is_active", true),
    ]);
    if (!cats || cats.length === 0 || !stores || stores.length === 0) return {};
    const categories = cats.map((c) => c.name);

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
    for (const s of stores) result[s.slug] = { categories, items: [] };

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
      .select("id, available_date, is_closed, stores(slug)")
      .gte("available_date", start)
      .lte("available_date", end);
    if (error || !slots || slots.length === 0) return {};

    const slotIds = slots.map((s) => s.id);
    const { data: times } = await supabase
      .from("takeout_slot_times")
      .select("slot_id, time_label, is_active, sort_order")
      .in("slot_id", slotIds)
      .order("sort_order", { ascending: true });

    const labelsBySlot = new Map<string, string[]>();
    for (const t of times ?? []) {
      if (t.is_active === false) continue; // 受付可能な枠のみ
      const arr = labelsBySlot.get(t.slot_id) ?? [];
      arr.push(t.time_label);
      labelsBySlot.set(t.slot_id, arr);
    }

    const result: Record<string, DaySlotMap> = {};
    for (const s of slots) {
      const slug = (s as unknown as { stores?: { slug?: string } }).stores?.slug;
      if (!slug) continue;
      const map = (result[slug] ??= {});
      map[s.available_date] = {
        isClosed: s.is_closed ?? false,
        timeLabels: labelsBySlot.get(s.id) ?? [],
      };
    }
    return result;
  } catch {
    return {};
  }
}
