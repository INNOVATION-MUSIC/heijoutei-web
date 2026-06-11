import { chromium } from "playwright";
async function main() {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  await p.goto("http://localhost:3000/", { waitUntil: "networkidle" });
  await p.waitForTimeout(1500);
  await p.screenshot({ path: "/tmp/front-top.png" });
  await b.close();
  console.log("saved /tmp/front-top.png");
}
main().catch((e) => { console.error(e); process.exit(1); });
