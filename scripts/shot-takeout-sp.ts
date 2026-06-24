// /takeout SP(390) の各ステップ視覚確認。別ターミナルで npm run dev を起動しておく。
//   npx tsx scripts/shot-takeout-sp.ts
import { chromium } from "playwright";

async function main() {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 390, height: 844 } });

  // ステップ1: 日時選択
  await p.goto("http://localhost:3000/takeout", { waitUntil: "networkidle" });
  await p.waitForTimeout(1800);
  await p.screenshot({ path: "/tmp/takeout-sp-1.png", fullPage: true });
  console.log("saved /tmp/takeout-sp-1.png");

  // カレンダーで予約可能な最初の日付セルをクリック（cursor:pointer を持つセル内 div）
  const clickedDate = await p.evaluate(() => {
    const cells = Array.from(document.querySelectorAll("div")).filter((d) => {
      const cs = getComputedStyle(d);
      return cs.cursor === "pointer" && d.offsetHeight > 30 && d.offsetHeight < 60 && /^\d+/.test(d.textContent || "");
    });
    if (cells[0]) { (cells[0] as HTMLElement).click(); return cells[0].textContent; }
    return null;
  });
  console.log("clicked date:", clickedDate);
  await p.waitForTimeout(500);

  // 最初の有効な時間枠ボタンをクリック
  await p.locator("button:not([disabled])").filter({ hasText: /\d{2}:\d{2}/ }).first().click();
  await p.waitForTimeout(500);
  await p.screenshot({ path: "/tmp/takeout-sp-1filled.png", fullPage: true });
  console.log("saved /tmp/takeout-sp-1filled.png");

  // メニュー選択へ進む
  await p.getByText("メニュー選択へ進む").click();
  await p.waitForTimeout(800);
  await p.screenshot({ path: "/tmp/takeout-sp-2.png", fullPage: true });
  console.log("saved /tmp/takeout-sp-2.png");

  // 最初の商品を1点追加（「+」ボタン）
  await p.getByRole("button", { name: "増やす" }).first().click();
  await p.getByRole("button", { name: "増やす" }).nth(1).click();
  await p.waitForTimeout(500);
  await p.screenshot({ path: "/tmp/takeout-sp-2cart.png", fullPage: true });
  console.log("saved /tmp/takeout-sp-2cart.png");

  // 購入者情報入力へ進む
  await p.getByText("購入者情報入力へ進む").click();
  await p.waitForTimeout(800);

  // 入力
  await p.getByPlaceholder("平壌　太郎").fill("平壌 太郎");
  await p.getByPlaceholder("ヘイジョウ　タロウ").fill("ヘイジョウ タロウ");
  const emails = p.getByPlaceholder("info@example.com");
  await emails.nth(0).fill("test@example.com");
  await emails.nth(1).fill("test@example.com");
  await p.getByPlaceholder("075-000-0000").fill("075-123-4567");
  await p.getByPlaceholder("ご自由にご入力ください。").fill("テスト注文です。SP表示の確認をしています。");
  await p.locator('input[type="checkbox"]').check();
  await p.waitForTimeout(400);
  await p.screenshot({ path: "/tmp/takeout-sp-3.png", fullPage: true });
  console.log("saved /tmp/takeout-sp-3.png");

  // 確認画面へ進む
  await p.getByText("確認画面へ進む").click();
  await p.waitForTimeout(800);
  await p.screenshot({ path: "/tmp/takeout-sp-4.png", fullPage: true });
  console.log("saved /tmp/takeout-sp-4.png");

  await b.close();
}
main().catch((e) => { console.error(e); process.exit(1); });
