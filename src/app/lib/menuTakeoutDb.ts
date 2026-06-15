import { createStaticClient } from "@/lib/supabase/static";
import { getTakeoutTabs, MENU_STORES, type TakeoutMenuTab, type MenuItem } from "./menuData";

type MenuRow = {
  category_id: string | null;
  name: string;
  description: string | null;
  image_url: string | null;
  price: number;
  sort_order: number | null;
  store_takeout_menu_stores: { store_id: string }[];
};

function toItem(r: MenuRow): MenuItem {
  return { name: r.name, desc: r.description ?? undefined, price: r.price, photo: r.image_url ?? "" };
}

/** /menu/takeout 用：店舗 slug ごとのタブ配列。DB 空時は静的データにフォールバック。 */
export async function fetchTakeoutTabsByStore(): Promise<Record<string, TakeoutMenuTab[]>> {
  const fallback: Record<string, TakeoutMenuTab[]> = {};
  for (const s of MENU_STORES) fallback[s.id] = getTakeoutTabs(s.id);

  try {
    const supabase = createStaticClient();
    const [{ data: cats }, { data: menus }, { data: stores }] = await Promise.all([
      supabase.from("takeout_categories").select("slug, name, sort_order").eq("is_active", true).order("sort_order"),
      supabase
        .from("store_takeout_menus")
        .select("category_id, name, description, image_url, price, sort_order, store_takeout_menu_stores(store_id)")
        .eq("is_active", true)
        .order("sort_order"),
      supabase.from("stores").select("id, slug"),
    ]);
    if (!cats || cats.length === 0 || !menus || menus.length === 0 || !stores) return fallback;

    // category_id を slug に変換するため takeout_categories の id も必要
    const { data: catIds } = await supabase.from("takeout_categories").select("id, slug");
    const catSlugById = new Map((catIds ?? []).map((c) => [c.id, c.slug]));

    const result: Record<string, TakeoutMenuTab[]> = {};
    for (const store of stores) {
      const tabs: TakeoutMenuTab[] = cats.map((c) => ({ slug: c.slug, name: c.name, items: [] as MenuItem[] }));
      const tabBySlug = new Map(tabs.map((t) => [t.slug, t]));
      for (const m of menus as unknown as MenuRow[]) {
        const inStore = (m.store_takeout_menu_stores ?? []).some((j) => j.store_id === store.id);
        if (!inStore) continue;
        const cslug = m.category_id ? catSlugById.get(m.category_id) : undefined;
        if (!cslug) continue;
        tabBySlug.get(cslug)?.items.push(toItem(m));
      }
      // 品目が1つもあるタブのみ残す（getTakeoutTabs 同様、全タブ表示でもよいが空は除外）
      result[store.slug] = tabs.filter((t) => t.items.length > 0);
    }
    // どの店舗もタブが空ならフォールバック
    const anyHasTabs = Object.values(result).some((t) => t.length > 0);
    if (!anyHasTabs) return fallback;
    // MENU_STORES の id キーに合わせる（フロントの useStoreParam は MENU_STORES.id を使う＝slug と一致）
    const byMenuStore: Record<string, TakeoutMenuTab[]> = {};
    for (const s of MENU_STORES) byMenuStore[s.id] = result[s.id] ?? getTakeoutTabs(s.id);
    return byMenuStore;
  } catch {
    return fallback;
  }
}
