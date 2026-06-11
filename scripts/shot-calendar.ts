// トップ営業カレンダーの視覚確認。フォールバック(DB空)→DB投入後(live)→後始末でスクショ。
//   npx tsx scripts/shot-calendar.ts    （別ターミナルで npm run dev を起動しておく）
import { readFileSync } from "node:fs";
import WebSocket from "ws";
import { createClient } from "@supabase/supabase-js";
import { chromium } from "playwright";

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
const pad = (n: number) => String(n).padStart(2, "0");

async function shot(tag: string) {
  const b = await chromium.launch();
  const pc = await b.newPage({ viewport: { width: 1440, height: 1000 } });
  await pc.goto("http://localhost:3000/", { waitUntil: "networkidle" });
  await pc.waitForTimeout(2500);
  await pc.evaluate(() => window.scrollTo(0, 8600));
  await pc.waitForTimeout(800);
  await pc.screenshot({ path: `/tmp/cal-${tag}-pc.png` });

  const sp = await b.newPage({ viewport: { width: 390, height: 844 } });
  await sp.goto("http://localhost:3000/", { waitUntil: "networkidle" });
  await sp.waitForTimeout(2500);
  await sp.evaluate(() => window.scrollTo(0, 10000));
  await sp.waitForTimeout(800);
  await sp.screenshot({ path: `/tmp/cal-${tag}-sp.png` });
  await b.close();
  console.log(`saved /tmp/cal-${tag}-{pc,sp}.png`);
}

async function main() {
  const { data: store } = await admin.from("stores").select("id").eq("slug", "kameoka").single();
  if (!store) throw new Error("kameoka 不在");
  const today = new Date();
  const y = today.getFullYear(), m = today.getMonth();
  const nextY = m === 11 ? y + 1 : y, nextM = m === 11 ? 0 : m + 1;
  const d = (yy: number, mm0: number, dd: number) => `${yy}-${pad(mm0 + 1)}-${pad(dd)}`;
  // 当月の毎週火曜=定休, 28=ランチのみ / 翌月の毎週火曜=定休 を投入
  const rows: { store_id: string; date: string; status: string; note: string | null }[] = [];
  for (const [yy, mm0] of [[y, m], [nextY, nextM]] as [number, number][]) {
    const days = new Date(yy, mm0 + 1, 0).getDate();
    for (let dd = 1; dd <= days; dd++) {
      if (new Date(yy, mm0, dd).getDay() === 2) rows.push({ store_id: store.id, date: d(yy, mm0, dd), status: "closed", note: null });
    }
  }
  rows.push({ store_id: store.id, date: d(y, m, 28), status: "limited", note: "ランチのみ" });
  const dates = rows.map((r) => r.date);
  const cleanup = async () => { await admin.from("business_calendars").delete().eq("store_id", store.id).in("date", dates); };

  await cleanup();
  await shot("fallback"); // DB空＝従来の静的サンプル(5月/6月)が出るはず

  await admin.from("business_calendars").upsert(rows, { onConflict: "store_id,date" });
  await shot("live");     // 当月/翌月＋定休/ランチのみが反映されるはず

  await cleanup();
  console.log("後始末: テスト営業日削除済");
  process.exit(0);
}
main().catch((e) => { console.error(e); process.exit(1); });
