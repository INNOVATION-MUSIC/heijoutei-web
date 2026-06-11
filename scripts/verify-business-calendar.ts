// 営業カレンダーのフロント連動の検証。テスト営業日を投入→anon取得→月別マッピング確認→削除。
//   npx tsx scripts/verify-business-calendar.ts
import { readFileSync } from "node:fs";
import WebSocket from "ws";
import { createClient } from "@supabase/supabase-js";

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

type Biz = "normal" | "teikyu" | "lunch";
const mapStatus = (s: string): Biz => (s === "closed" || s === "special_closed" ? "teikyu" : s === "limited" ? "lunch" : "normal");
const pad = (n: number) => String(n).padStart(2, "0");

// businessCalendarDb.fetchBusinessCalendar と同じ anon 取得ロジック（検証用に複製）
async function fetchBiz(storeId: string) {
  const today = new Date();
  const y0 = today.getFullYear(), m0 = today.getMonth();
  const meta = [{ year: y0, month0: m0 }, m0 === 11 ? { year: y0 + 1, month0: 0 } : { year: y0, month0: m0 + 1 }];
  const startIso = `${meta[0].year}-${pad(meta[0].month0 + 1)}-01`;
  const lastNext = new Date(meta[1].year, meta[1].month0 + 1, 0);
  const endIso = `${lastNext.getFullYear()}-${pad(lastNext.getMonth() + 1)}-${pad(lastNext.getDate())}`;
  const { data } = await anon.from("business_calendars").select("date, status")
    .eq("store_id", storeId).gte("date", startIso).lte("date", endIso);
  if (!data || data.length === 0) return undefined;
  return meta.map(({ year, month0 }) => {
    const specials: Record<number, Biz> = {};
    for (const row of data as { date: string; status: string }[]) {
      const [ry, rm, rd] = row.date.split("-").map(Number);
      if (ry === year && rm === month0 + 1) { const t = mapStatus(row.status); if (t !== "normal") specials[rd] = t; }
    }
    return { year, month: month0 + 1, startDay: new Date(year, month0, 1).getDay(), totalDays: new Date(year, month0 + 1, 0).getDate(), specials };
  });
}

async function main() {
  const { data: store } = await admin.from("stores").select("id").eq("slug", "kameoka").single();
  if (!store) throw new Error("kameoka 不在");

  const today = new Date();
  const y = today.getFullYear(), m = today.getMonth(); // 当月(0-based)
  const nextY = m === 11 ? y + 1 : y, nextM = m === 11 ? 0 : m + 1;
  const d = (yy: number, mm0: number, dd: number) => `${yy}-${pad(mm0 + 1)}-${pad(dd)}`;
  const rows = [
    { store_id: store.id, date: d(y, m, 16), status: "closed", note: null },
    { store_id: store.id, date: d(y, m, 25), status: "special_closed", note: null },
    { store_id: store.id, date: d(y, m, 28), status: "limited", note: "ランチのみ" },
    { store_id: store.id, date: d(y, m, 10), status: "open", note: null },        // normal=省略されるべき
    { store_id: store.id, date: d(nextY, nextM, 7), status: "closed", note: null }, // 翌月
  ];
  const dates = rows.map((r) => r.date);

  const cleanup = async () => { await admin.from("business_calendars").delete().eq("store_id", store.id).in("date", dates); };
  await cleanup();
  const { error: insErr } = await admin.from("business_calendars").upsert(rows, { onConflict: "store_id,date" });
  if (insErr) throw insErr;

  const months = await fetchBiz(store.id);
  console.log("取得月数:", months?.length);
  const cur = months?.[0], nxt = months?.[1];
  console.log("当月:", JSON.stringify(cur));
  console.log("翌月:", JSON.stringify(nxt));

  const checks: [string, boolean][] = [
    ["当月=今月/翌月=来月", cur?.month === m + 1 && nxt?.month === nextM + 1],
    ["closed→teikyu(16)", cur?.specials[16] === "teikyu"],
    ["special_closed→teikyu(25)", cur?.specials[25] === "teikyu"],
    ["limited→lunch(28)", cur?.specials[28] === "lunch"],
    ["open→normalは省略(10未登録)", cur?.specials[10] === undefined],
    ["翌月 closed→teikyu(7)", nxt?.specials[7] === "teikyu"],
    ["startDay/totalDays整合(当月)", cur?.startDay === new Date(y, m, 1).getDay() && cur?.totalDays === new Date(y, m + 1, 0).getDate()],
  ];
  let ok = true;
  for (const [label, pass] of checks) { console.log(pass ? "  PASS " : "  FAIL ", label); if (!pass) ok = false; }

  await cleanup();
  console.log("後始末: テスト営業日削除済");
  console.log(ok ? "\n✅ 全チェックPASS" : "\n❌ 失敗あり");
  process.exit(ok ? 0 : 1);
}
main().catch((e) => { console.error(e); process.exit(1); });
