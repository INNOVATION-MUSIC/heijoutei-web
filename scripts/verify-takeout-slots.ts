// 受付枠フロント連動の検証。テスト枠を投入→anon経路で取得→buildCalendarのオーバーライド確認→削除。
//   npx tsx scripts/verify-takeout-slots.ts
import { readFileSync } from "node:fs";
import WebSocket from "ws";
import { createClient } from "@supabase/supabase-js";
import { buildCalendar, type DaySlotMap, type DaySlotInfo } from "../src/app/lib/takeoutData.ts";

// @ts-expect-error Node20 global WebSocket 供給
globalThis.WebSocket = globalThis.WebSocket ?? WebSocket;

const env = Object.fromEntries(
  readFileSync(new URL("../.env.local", import.meta.url), "utf8")
    .split("\n").filter((l) => l && !l.startsWith("#") && l.includes("="))
    .map((l) => { const i = l.indexOf("="); return [l.slice(0, i).trim(), l.slice(i + 1).trim()]; })
);
const admin = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});
const anon = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

// fetchTakeoutSlots と同じ anon 取得ロジック（検証用に複製）
async function fetchSlots(): Promise<Record<string, DaySlotMap>> {
  const today = new Date();
  const start = iso(new Date(today.getFullYear(), today.getMonth(), 1));
  const endD = new Date(today.getFullYear(), today.getMonth() + 2, 0);
  const { data: slots } = await anon
    .from("takeout_slots")
    .select("id, available_date, is_closed, stores(slug)")
    .gte("available_date", start).lte("available_date", iso(endD));
  if (!slots || slots.length === 0) return {};
  const { data: times } = await anon
    .from("takeout_slot_times")
    .select("slot_id, time_label, is_active, sort_order")
    .in("slot_id", slots.map((s) => s.id)).order("sort_order");
  const bySlot = new Map<string, string[]>();
  for (const t of times ?? []) {
    if (t.is_active === false) continue;
    const arr = bySlot.get(t.slot_id) ?? []; arr.push(t.time_label); bySlot.set(t.slot_id, arr);
  }
  const result: Record<string, DaySlotMap> = {};
  for (const s of slots as { id: string; available_date: string; is_closed: boolean; stores?: { slug?: string } }[]) {
    const slug = s.stores?.slug; if (!slug) continue;
    (result[slug] ??= {})[s.available_date] = { isClosed: s.is_closed ?? false, timeLabels: bySlot.get(s.id) ?? [] };
  }
  return result;
}

async function main() {
  const { data: store } = await admin.from("stores").select("id, slug").eq("slug", "kameoka").single();
  if (!store) throw new Error("kameoka store が見つかりません");

  // 近い未来の火曜（既定=定休→開放上書き検証）と水曜（既定=可→休止上書き検証）を探す
  let openDay: Date | null = null;  // 火曜
  let closeDay: Date | null = null; // 水曜
  for (let i = 7; i <= 21; i++) {
    const d = new Date(); d.setDate(d.getDate() + i); d.setHours(0, 0, 0, 0);
    if (d.getDay() === 2 && !openDay) openDay = d;
    if (d.getDay() === 3 && !closeDay) closeDay = d;
  }
  if (!openDay || !closeDay) throw new Error("検証用の火/水が見つかりません");
  const openIso = iso(openDay), closeIso = iso(closeDay);
  console.log("検証日: 火曜(開放)", openIso, "/ 水曜(休止)", closeIso);

  // 後始末（前回残骸も含め）
  const cleanup = async () => {
    const { data: old } = await admin.from("takeout_slots").select("id")
      .eq("store_id", store.id).in("available_date", [openIso, closeIso]);
    for (const s of old ?? []) await admin.from("takeout_slot_times").delete().eq("slot_id", s.id);
    await admin.from("takeout_slots").delete().eq("store_id", store.id).in("available_date", [openIso, closeIso]);
  };
  await cleanup();

  // 投入: 火曜=開放(2枠) / 水曜=休止
  const { data: openSlot } = await admin.from("takeout_slots")
    .insert({ store_id: store.id, available_date: openIso, default_capacity: 5, is_closed: false })
    .select("id").single();
  await admin.from("takeout_slot_times").insert([
    { slot_id: openSlot!.id, time_label: "12 : 00", capacity: 5, is_active: true, sort_order: 0 },
    { slot_id: openSlot!.id, time_label: "12 : 30", capacity: 5, is_active: true, sort_order: 1 },
    { slot_id: openSlot!.id, time_label: "13 : 00", capacity: 5, is_active: false, sort_order: 2 }, // 非アクティブ=除外されるべき
  ]);
  await admin.from("takeout_slots")
    .insert({ store_id: store.id, available_date: closeIso, default_capacity: 0, is_closed: true });

  // anon 経路で取得
  const map = await fetchSlots();
  const km = map["kameoka"] ?? {};
  const openInfo: DaySlotInfo | undefined = km[openIso];
  const closeInfo: DaySlotInfo | undefined = km[closeIso];
  console.log("取得(火曜):", JSON.stringify(openInfo));
  console.log("取得(水曜):", JSON.stringify(closeInfo));

  // buildCalendar オーバーライド確認（その月で）
  const cal = buildCalendar(openDay.getFullYear(), openDay.getMonth(), new Date(), km);
  const cell = (i: string) => cal.find((c) => c.iso === i);
  // 同月の水曜セル（closeDayが同月の場合のみ判定）
  const calClose = buildCalendar(closeDay.getFullYear(), closeDay.getMonth(), new Date(), km);
  const cellClose = calClose.find((c) => c.iso === closeIso);

  const checks: [string, boolean][] = [
    ["anon: 火曜の受付可能枠=2(非アクティブ除外)", openInfo?.timeLabels.length === 2 && openInfo.isClosed === false],
    ["anon: 火曜のラベル先頭=12 : 00", openInfo?.timeLabels[0] === "12 : 00"],
    ["anon: 水曜=休止/枠0", closeInfo?.isClosed === true && closeInfo.timeLabels.length === 0],
    ["calendar: 火曜が既定closed→available に上書き", cell(openIso)?.status === "available"],
    ["calendar: 水曜が既定available→closed に上書き", cellClose?.status === "closed"],
  ];
  let ok = true;
  for (const [label, pass] of checks) { console.log(pass ? "  PASS " : "  FAIL ", label); if (!pass) ok = false; }

  await cleanup();
  console.log("後始末: テスト枠削除済");
  console.log(ok ? "\n✅ 全チェックPASS" : "\n❌ 失敗あり");
  process.exit(ok ? 0 : 1);
}
main().catch((e) => { console.error(e); process.exit(1); });
