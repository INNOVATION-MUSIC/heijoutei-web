import { chromium } from "playwright";

// /menu 各ページの SP 実機スクショ（設計幅 390）。崩れ・タップ領域の目視確認用。
const PAGES: [string, string][] = [
  ["/menu", "menu-cat"],
  ["/menu/niku", "menu-detail"],
  ["/menu/lunch", "menu-lunch"],
  ["/menu/course", "menu-course"],
  ["/menu/takeout", "menu-takeout"],
];

async function main() {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 390, height: 844 } });
  for (const [path, name] of PAGES) {
    await p.goto(`http://localhost:3100${path}`, { waitUntil: "networkidle" });
    await p.waitForTimeout(1800);
    await p.screenshot({ path: `/tmp/${name}-sp.png`, fullPage: true });
    console.log(`saved /tmp/${name}-sp.png`);
  }
  await b.close();
}
main().catch((e) => { console.error(e); process.exit(1); });
