// 既存の静的メニューデータ(menuData.ts)を Supabase に移行するワンオフスクリプト。
//   npx tsx scripts/migrate-menu.ts
// menu_categories(カード画像/不足カテゴリ補正) / store_menus / menu_items を投入する。
// 対象: カテゴリ一覧グリッド12 + 各カテゴリ詳細(店舗別) + ランチ(slug='lunch')。
// ※ /menu/takeout はテイクアウト注文フローと別管理のため対象外。
import { readFileSync } from "node:fs";
import WebSocket from "ws";
import { createClient } from "@supabase/supabase-js";
import { MENU_CATEGORIES, MENU_STORES, getMenuItems, getLunchItems } from "../src/app/lib/menuData.ts";

// Node 20 では global WebSocket が無く supabase-js の Realtime 初期化が失敗するため ws を供給
// @ts-expect-error global 補完
globalThis.WebSocket = globalThis.WebSocket ?? WebSocket;

// .env.local を素朴にパース
const env = Object.fromEntries(
  readFileSync(new URL("../.env.local", import.meta.url), "utf8")
    .split("\n")
    .filter((l) => l && !l.startsWith("#") && l.includes("="))
    .map((l) => {
      const i = l.indexOf("=");
      return [l.slice(0, i).trim(), l.slice(i + 1).trim()];
    })
);

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// フロント MENU_CATEGORIES の並び順（grid 12）。lunch は grid 外として末尾に。
const GRID_ORDER = MENU_CATEGORIES.map((c) => c.slug); // 12 件（front 準拠順）

async function main() {
  // 1) 不足カテゴリ補正 + カード画像 + 並び順。lunch は sort_order=99 で grid から除外。
  for (let i = 0; i < MENU_CATEGORIES.length; i++) {
    const c = MENU_CATEGORIES[i];
    const { error } = await supabase
      .from("menu_categories")
      .upsert({ slug: c.slug, name: c.name, is_active: true, sort_order: i + 1, card_image_url: c.cardPhoto }, { onConflict: "slug" });
    if (error) throw new Error(`menu_categories ${c.slug}: ${error.message}`);
  }
  // lunch カテゴリ（grid 外・/menu/lunch 用）
  await supabase.from("menu_categories").upsert({ slug: "lunch", name: "ランチ", is_active: true, sort_order: 99 }, { onConflict: "slug" });

  // 2) slug→id マップ
  const { data: cats } = await supabase.from("menu_categories").select("id, slug");
  const catId = new Map((cats ?? []).map((c) => [c.slug, c.id]));
  const { data: stores } = await supabase.from("stores").select("id, slug");
  const storeId = new Map((stores ?? []).map((s) => [s.id, s.slug] as const).map(([id, slug]) => [slug, id] as const));

  // 3) 既存の store_menus を全削除（menu_items は CASCADE）→ 再実行可能に
  await supabase.from("store_menus").delete().neq("id", "00000000-0000-0000-0000-000000000000");

  let smCount = 0;
  let miCount = 0;

  // 4) 各店舗 × (grid カテゴリ + lunch) の store_menus + menu_items
  for (const store of MENU_STORES) {
    const sId = storeId.get(store.id);
    if (!sId) continue;

    // grid カテゴリ
    for (let i = 0; i < GRID_ORDER.length; i++) {
      const cat = MENU_CATEGORIES[i];
      const cId = catId.get(cat.slug);
      if (!cId) continue;
      const items = getMenuItems(cat, store.id);
      const sm = await insertStoreMenu(sId, cId, i + 1);
      smCount++;
      miCount += await insertItems(sm, items);
    }

    // lunch
    const lunchCatId = catId.get("lunch");
    if (lunchCatId) {
      const lunchItems = getLunchItems(store.id);
      const sm = await insertStoreMenu(sId, lunchCatId, 99);
      smCount++;
      miCount += await insertItems(sm, lunchItems);
    }
  }

  console.log(`done. store_menus=${smCount}, menu_items=${miCount}`);
}

async function insertStoreMenu(store_id: string, category_id: string, sort_order: number): Promise<string> {
  const { data, error } = await supabase
    .from("store_menus")
    .insert({ store_id, category_id, is_active: true, has_detail_page: false, sort_order })
    .select("id")
    .single();
  if (error || !data) throw new Error(`store_menus: ${error?.message}`);
  return data.id;
}

async function insertItems(store_menu_id: string, items: { name: string; desc?: string; price: number; photo: string }[]): Promise<number> {
  if (items.length === 0) return 0;
  const rows = items.map((it, idx) => ({
    store_menu_id,
    name: it.name,
    description: it.desc ?? null,
    image_url: it.photo ?? null,
    price_label: String(it.price),
    sort_order: idx,
  }));
  const { error } = await supabase.from("menu_items").insert(rows);
  if (error) throw new Error(`menu_items: ${error.message}`);
  return rows.length;
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
