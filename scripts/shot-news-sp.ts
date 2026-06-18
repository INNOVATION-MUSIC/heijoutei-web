import { chromium } from "playwright";
async function main() {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 390, height: 844 } });
  await p.goto("http://localhost:3000/news", { waitUntil: "networkidle" });
  await p.waitForTimeout(1800);
  await p.screenshot({ path: "/tmp/news-sp-initial.png", fullPage: true });
  // 「もっと見る」をクリックして追加表示
  const more = p.getByText("もっと見る");
  if (await more.count()) {
    await more.first().click();
    await p.waitForTimeout(1200);
    await p.screenshot({ path: "/tmp/news-sp-more.png", fullPage: true });
    console.log("saved /tmp/news-sp-more.png");
  }
  await b.close();
  console.log("saved /tmp/news-sp-initial.png");
}
main().catch((e) => { console.error(e); process.exit(1); });
