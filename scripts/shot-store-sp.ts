import { chromium } from "playwright";
async function main() {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 390, height: 844 } });
  await p.goto("http://localhost:3000/store", { waitUntil: "networkidle" });
  await p.waitForTimeout(1800);
  await p.screenshot({ path: "/tmp/store-sp-full.png", fullPage: true });
  // 先頭付近のビューも保存
  await p.screenshot({ path: "/tmp/store-sp-top.png" });
  await b.close();
  console.log("saved /tmp/store-sp-full.png /tmp/store-sp-top.png");
}
main().catch((e) => { console.error(e); process.exit(1); });
