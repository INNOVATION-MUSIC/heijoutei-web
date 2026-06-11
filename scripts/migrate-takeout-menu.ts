// /menu/takeout の閲覧用テイクアウトデータ(TAKEOUT_MENU_TABS)を正として
// takeout_categories / store_takeout_menus / store_takeout_menu_stores に移行する。
//   npx tsx scripts/migrate-takeout-menu.ts
// 共通タブは全店 junction、bento(店舗別あり)は店舗別 junction。
import { readFileSync } from "node:fs";
import WebSocket from "ws";
import { createClient } from "@supabase/supabase-js";
import { TAKEOUT_MENU_TABS, getTakeoutTabs, MENU_STORES } from "../src/app/lib/menuData.ts";

// @ts-expect-error Node20 global WebSocket 供給
globalThis.WebSocket = globalThis.WebSocket ?? WebSocket;

const env = Object.fromEntries(
  readFileSync(new URL("../.env.local", import.meta.url), "utf8")
    .split("\n").filter((l) => l && !l.startsWith("#") && l.includes("="))
    .map((l) => { const i = l.indexOf("="); return [l.slice(0, i).trim(), l.slice(i + 1).trim()]; })
);
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// bento タブは店舗別 override があるので店舗別 junction にする
const PER_STORE_SLUGS = new Set(["bento"]);

async function main() {
  // 1) takeout_categories を TAKEOUT_MENU_TABS に揃える（既存を一旦全削除→再投入）
  await supabase.from("store_takeout_menus").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  await supabase.from("takeout_categories").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  for (let i = 0; i < TAKEOUT_MENU_TABS.length; i++) {
    const t = TAKEOUT_MENU_TABS[i];
    const { error } = await supabase.from("takeout_categories").insert({ slug: t.slug, name: t.name, is_active: true, sort_order: i + 1 });
    if (error) throw new Error(`takeout_categories ${t.slug}: ${error.message}`);
  }

  const { data: cats } = await supabase.from("takeout_categories").select("id, slug");
  const catId = new Map((cats ?? []).map((c) => [c.slug, c.id]));
  const { data: stores } = await supabase.from("stores").select("id, slug");
  const storeId = new Map((stores ?? []).map((s) => [s.slug, s.id]));
  const allStoreIds = MENU_STORES.map((s) => storeId.get(s.id)).filter(Boolean) as string[];

  let menuCount = 0;
  let junctionCount = 0;

  async function insertItem(catSlug: string, item: { name: string; desc?: string; price: number; photo: string }, order: number, storeIds: string[]) {
    const cId = catId.get(catSlug);
    if (!cId) return;
    const { data, error } = await supabase
      .from("store_takeout_menus")
      .insert({ category_id: cId, name: item.name, description: item.desc ?? null, image_url: item.photo ?? null, price: Math.round(item.price), is_active: true, sort_order: order })
      .select("id").single();
    if (error || !data) throw new Error(`store_takeout_menus: ${error?.message}`);
    menuCount++;
    const rows = storeIds.map((sid) => ({ takeout_menu_id: data.id, store_id: sid }));
    if (rows.length) {
      const { error: jErr } = await supabase.from("store_takeout_menu_stores").insert(rows);
      if (jErr) throw new Error(`junction: ${jErr.message}`);
      junctionCount += rows.length;
    }
  }

  // 2) 共通タブ（bento 以外）: TAKEOUT_MENU_TABS の既定品目を全店 junction
  for (const tab of TAKEOUT_MENU_TABS) {
    if (PER_STORE_SLUGS.has(tab.slug)) continue;
    for (let i = 0; i < tab.items.length; i++) {
      await insertItem(tab.slug, tab.items[i], i, allStoreIds);
    }
  }

  // 3) bento: 店舗別（getTakeoutTabs で解決した店舗別品目）を当該店舗のみ junction
  for (const store of MENU_STORES) {
    const sid = storeId.get(store.id);
    if (!sid) continue;
    const tabs = getTakeoutTabs(store.id);
    for (const slug of PER_STORE_SLUGS) {
      const tab = tabs.find((t) => t.slug === slug);
      if (!tab) continue;
      for (let i = 0; i < tab.items.length; i++) {
        await insertItem(slug, tab.items[i], i, [sid]);
      }
    }
  }

  console.log(`done. store_takeout_menus=${menuCount}, junctions=${junctionCount}, categories=${TAKEOUT_MENU_TABS.length}`);
}

main().catch((e) => { console.error(e); process.exit(1); });
