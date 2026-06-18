import { chromium } from "playwright";
async function main() {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 390, height: 844 } });
  for (const id of ["6", "1"]) {
    await p.goto(`http://localhost:3000/news/${id}`, { waitUntil: "networkidle" });
    await p.waitForTimeout(1800);
    await p.screenshot({ path: `/tmp/news-detail-sp-${id}.png`, fullPage: true });
    console.log(`saved /tmp/news-detail-sp-${id}.png`);
  }
  await b.close();
}
main().catch((e) => { console.error(e); process.exit(1); });
