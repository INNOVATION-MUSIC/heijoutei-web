import { chromium } from "playwright";
async function main() {
  const slugs = ["kameoka", "yurano", "heijohtei"];
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 390, height: 844 } });
  for (const slug of slugs) {
    await p.goto(`http://localhost:3000/store/${slug}`, { waitUntil: "networkidle" });
    await p.waitForTimeout(1800);
    await p.screenshot({ path: `/tmp/store-detail-${slug}.png`, fullPage: true });
    console.log(`saved /tmp/store-detail-${slug}.png`);
  }
  await b.close();
}
main().catch((e) => { console.error(e); process.exit(1); });
