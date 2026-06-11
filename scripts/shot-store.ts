import { chromium } from "playwright";
async function main() {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1440, height: 1600 } });
  await p.goto("http://localhost:3000/store", { waitUntil: "networkidle" });
  await p.waitForTimeout(1500);
  await p.screenshot({ path: "/tmp/front-store.png", fullPage: true });
  await b.close(); console.log("saved /tmp/front-store.png");
}
main().catch((e) => { console.error(e.message); process.exit(1); });
