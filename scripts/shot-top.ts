import { chromium } from "playwright";
async function main() {
  const b = await chromium.launch();
  // PC: News セクション付近
  const pc = await b.newPage({ viewport: { width: 1440, height: 1000 } });
  await pc.goto("http://localhost:3000/", { waitUntil: "networkidle" });
  await pc.waitForTimeout(2500);
  await pc.evaluate(() => window.scrollTo(0, 1000));
  await pc.waitForTimeout(800);
  await pc.screenshot({ path: "/tmp/top-news-pc.png" });
  // SP
  const sp = await b.newPage({ viewport: { width: 390, height: 844 } });
  await sp.goto("http://localhost:3000/", { waitUntil: "networkidle" });
  await sp.waitForTimeout(2500);
  await sp.evaluate(() => window.scrollTo(0, 900));
  await sp.waitForTimeout(800);
  await sp.screenshot({ path: "/tmp/top-news-sp.png" });
  await b.close();
  console.log("saved");
}
main().catch((e) => { console.error(e.message); process.exit(1); });
