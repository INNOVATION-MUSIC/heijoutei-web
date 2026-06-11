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
  stores: { slug: string } | null;
  menu_items: MenuItemRow[];
};
type CategoryRow = {
  slug: string;
  name: string;
  card_image_url: string | null;
  sort_order: number | null;
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
  "slug, name, card_image_url, sort_order, store_menus(stores(slug), menu_items(name, description, image_url, price_label, sort_order))";

function toCategory(r: CategoryRow): MenuCategory {
  const itemsByStore: Record<string, MenuItem[]> = {};
  for (const sm of r.store_menus ?? []) {
    const slug = sm.stores?.slug;
    if (!slug) continue;
    itemsByStore[slug] = sortItems(sm.menu_items ?? []);
  }
  // items（既定フォールバック）は亀岡店、無ければ最初の店舗
  const items = itemsByStore["kameoka"] ?? Object.values(itemsByStore)[0] ?? [];
  return {
    slug: r.slug,
    name: r.name,
    title: `${r.name}メニュー`,
    cardPhoto: r.card_image_url ?? "",
    items,
    itemsByStore,
  };
}

/** カテゴリ一覧グリッド + 詳細用に、12カテゴリを itemsByStore 込みで返す（DB空時は静的）。 */
export async function fetchMenuCategoriesFull(): Promise<MenuCategory[]> {
  try {
    const supabase = createStaticClient();
    const { data, error } = await supabase
      .from("menu_categories")
      .select(CAT_SELECT)
      .neq("slug", "lunch")
      .eq("is_active", true)
      .order("sort_order", { ascending: true });
    if (error || !data || data.length === 0) return MENU_CATEGORIES;
    return (data as unknown as CategoryRow[]).map(toCategory);
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
      .select("store_menus(stores(slug), menu_items(name, description, image_url, price_label, sort_order))")
      .eq("slug", "lunch")
      .maybeSingle();
    if (error || !data) return fallback;
    const map: Record<string, MenuItem[]> = {};
    for (const sm of ((data as unknown as { store_menus: StoreMenuRow[] }).store_menus ?? [])) {
      const slug = sm.stores?.slug;
      if (!slug) continue;
      map[slug] = sortItems(sm.menu_items ?? []);
    }
    return Object.keys(map).length > 0 ? map : fallback;
  } catch {
    return fallback;
  }
}
