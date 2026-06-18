import { chromium } from "playwright";

async function main() {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 390, height: 844 } });

  // 一覧
  await p.goto("http://localhost:3000/recruit", { waitUntil: "networkidle" });
  await p.waitForTimeout(1800);
  await p.screenshot({ path: "/tmp/recruit-sp-list.png", fullPage: true });

  // 店舗タブ切替（求人なし店舗で空状態を確認）
  const tab = p.locator("button", { hasText: "園部店" }).first();
  if (await tab.count()) {
    await tab.click();
    await p.waitForTimeout(800);
    await p.screenshot({ path: "/tmp/recruit-sp-list-empty.png", fullPage: true });
  }

  // 詳細（id=2 = キッチンスタッフ・本文が長い）
  await p.goto("http://localhost:3000/recruit/2", { waitUntil: "networkidle" });
  await p.waitForTimeout(1800);
  await p.screenshot({ path: "/tmp/recruit-sp-detail.png", fullPage: true });

  // 詳細（id=1 = 清掃・本文短め）
  await p.goto("http://localhost:3000/recruit/1", { waitUntil: "networkidle" });
  await p.waitForTimeout(1500);
  await p.screenshot({ path: "/tmp/recruit-sp-detail2.png", fullPage: true });

  await b.close();
  console.log("saved /tmp/recruit-sp-*.png");
}

main().catch((e) => { console.error(e); process.exit(1); });
