import { createStaticClient } from "@/lib/supabase/static";
import { MENU_CATEGORIES, getMenuCategory, getLunchItems, LUNCH_ITEMS, type MenuCategory, type MenuItem } from "./menuData";

type MenuItemRow = {
  name: string;
  description: string | null;
  image_url: string | null;
  price_label: string | null;
  sort_order: number | null;
};
type StoreMenuRow = {
  is_active: boolean | null;
  stores: { slug: string } | null;
  menu_items: MenuItemRow[];
};
type CategoryRow = {
  slug: string;
  name: string;
  card_image_url: string | null;
  sort_order: number | null;
  store_ids: string[] | null;
  store_menus: StoreMenuRow[];
};

function toItem(r: MenuItemRow): MenuItem {
  return {
    name: r.name,
    desc: r.description ?? undefined,
    price: Number(r.price_label ?? 0),
    photo: r.image_url ?? "",
  };
}
function sortItems(items: MenuItemRow[]): MenuItem[] {
  return items.slice().sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0)).map(toItem);
}

const CAT_SELECT =
  "slug, name, card_image_url, sort_order, store_ids, store_menus(is_active, stores(slug), menu_items(name, description, image_url, price_label, sort_order))";

function toCategory(r: CategoryRow, storeSlugById: Record<string, string>): MenuCategory {
  const itemsByStore: Record<string, MenuItem[]> = {};
  for (const sm of r.store_menus ?? []) {
    if (sm.is_active === false) continue; // 店舗ごとに非公開なメニューは除外
    const slug = sm.stores?.slug;
    if (!slug) continue;
    itemsByStore[slug] = sortItems(sm.menu_items ?? []);
  }
  // items（既定フォールバック）は亀岡店、無ければ最初の店舗
  const items = itemsByStore["kameoka"] ?? Object.values(itemsByStore)[0] ?? [];
  // 対象店舗（store_ids: stores.id[）を slug に解決。空/未指定は全店表示（undefined のまま）。
  const storeSlugs = (r.store_ids ?? [])
    .map((id) => storeSlugById[id])
    .filter((s): s is string => !!s);
  return {
    slug: r.slug,
    name: r.name,
    title: `${r.name}メニュー`,
    cardPhoto: r.card_image_url ?? "",
    items,
    itemsByStore,
    storeSlugs: storeSlugs.length > 0 ? storeSlugs : undefined,
  };
}

/** stores.id → slug の対応表（対象店舗の解決用）。失敗時は空。 */
async function fetchStoreSlugById(supabase: ReturnType<typeof createStaticClient>): Promise<Record<string, string>> {
  const map: Record<string, string> = {};
  const { data } = await supabase.from("stores").select("id, slug");
  for (const s of (data as { id: string; slug: string }[] | null) ?? []) map[s.id] = s.slug;
  return map;
}

/** カテゴリ一覧グリッド + 詳細用に、12カテゴリを itemsByStore 込みで返す（DB空時は静的）。 */
export async function fetchMenuCategoriesFull(): Promise<MenuCategory[]> {
  try {
    const supabase = createStaticClient();
    const [{ data, error }, storeSlugById] = await Promise.all([
      supabase
        .from("menu_categories")
        .select(CAT_SELECT)
        .neq("slug", "lunch")
        .eq("is_active", true)
        .order("sort_order", { ascending: true }),
      fetchStoreSlugById(supabase),
    ]);
    if (error || !data || data.length === 0) return MENU_CATEGORIES;
    return (data as unknown as CategoryRow[]).map((r) => toCategory(r, storeSlugById));
  } catch {
    return MENU_CATEGORIES;
  }
}

/** 単一カテゴリ（詳細ページの初期表示用） */
export async function fetchMenuCategory(slug: string): Promise<MenuCategory | undefined> {
  const all = await fetchMenuCategoriesFull();
  return all.find((c) => c.slug === slug) ?? getMenuCategory(slug);
}

export async function fetchMenuParams(): Promise<{ category: string }[]> {
  try {
    const supabase = createStaticClient();
    const { data } = await supabase.from("menu_categories").select("slug").neq("slug", "lunch").eq("is_active", true);
    if (!data || data.length === 0) return MENU_CATEGORIES.map((c) => ({ category: c.slug }));
    return data.map((r) => ({ category: r.slug }));
  } catch {
    return MENU_CATEGORIES.map((c) => ({ category: c.slug }));
  }
}

/** ランチ品目を店舗 slug ごとに返す（/menu/lunch 用・DB空時は静的）。 */
export async function fetchLunchByStore(): Promise<Record<string, MenuItem[]>> {
  const fallback: Record<string, MenuItem[]> = {};
  for (const s of ["kameoka", "sonobe", "fukuchiyama", "yurano", "heijohtei"]) fallback[s] = getLunchItems(s) ?? LUNCH_ITEMS;
  try {
    const supabase = createStaticClient();
    const { data, error } = await supabase
      .from("menu_categories")
      .select("store_menus(is_active, stores(slug), menu_items(name, description, image_url, price_label, sort_order))")
      .eq("slug", "lunch")
      .maybeSingle();
    if (error || !data) return fallback;
    const map: Record<string, MenuItem[]> = {};
    for (const sm of ((data as unknown as { store_menus: StoreMenuRow[] }).store_menus ?? [])) {
      if (sm.is_active === false) continue; // 店舗ごとに非公開なランチは除外
      const slug = sm.stores?.slug;
      if (!slug) continue;
      map[slug] = sortItems(sm.menu_items ?? []);
    }
    return Object.keys(map).length > 0 ? map : fallback;
  } catch {
    return fallback;
  }
}

// /menu/lunch のサブタブ1つ分。slug=null は未分類（タブにしない／単独ならフラット表示）。
export type LunchGroup = { slug: string | null; name: string | null; items: MenuItem[] };

type LunchItemRow = MenuItemRow & {
  lunch_categories?: { slug: string; name: string; sort_order: number | null } | null;
};
type LunchStoreMenuRow = {
  is_active: boolean | null;
  stores: { slug: string } | null;
  menu_items: LunchItemRow[];
};

/**
 * ランチ品目を店舗 slug ごとに、カテゴリ別グループ（サブタブ）にまとめて返す。
 * lunch_categories.sort_order 順、未分類は末尾の slug=null グループに集約する。
 * DB 空／失敗時は undefined を返し、フロントは静的データのフラット表示にフォールバックする。
 */
export async function fetchLunchGroupsByStore(): Promise<Record<string, LunchGroup[]> | undefined> {
  try {
    const supabase = createStaticClient();
    const { data, error } = await supabase
      .from("menu_categories")
      .select(
        "store_menus(is_active, stores(slug), menu_items(name, description, image_url, price_label, sort_order, lunch_categories(slug, name, sort_order)))"
      )
      .eq("slug", "lunch")
      .maybeSingle();
    if (error || !data) return undefined;

    const result: Record<string, LunchGroup[]> = {};
    for (const sm of ((data as unknown as { store_menus: LunchStoreMenuRow[] }).store_menus ?? [])) {
      if (sm.is_active === false) continue; // 店舗ごとに非公開なランチは除外
      const storeSlug = sm.stores?.slug;
      if (!storeSlug) continue;
      const sorted = (sm.menu_items ?? []).slice().sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
      const groups = new Map<string, LunchGroup & { _order: number }>();
      for (const it of sorted) {
        const cat = it.lunch_categories ?? null;
        const key = cat?.slug ?? "__none__";
        let g = groups.get(key);
        if (!g) {
          g = { slug: cat?.slug ?? null, name: cat?.name ?? null, items: [], _order: cat ? cat.sort_order ?? 0 : Number.MAX_SAFE_INTEGER };
          groups.set(key, g);
        }
        g.items.push(toItem(it));
      }
      result[storeSlug] = [...groups.values()].sort((a, b) => a._order - b._order).map(({ slug, name, items }) => ({ slug, name, items }));
    }
    return Object.keys(result).length > 0 ? result : undefined;
  } catch {
    return undefined;
  }
}
