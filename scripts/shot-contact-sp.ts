// /contact SP(390) の3ステップ視覚確認。別ターミナルで npm run dev を起動しておく。
//   npx tsx scripts/shot-contact-sp.ts
import { chromium } from "playwright";

async function main() {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 390, height: 844 } });

  // ステップ1: 入力フォーム
  await p.goto("http://localhost:3000/contact", { waitUntil: "networkidle" });
  await p.waitForTimeout(1500);
  await p.screenshot({ path: "/tmp/contact-sp-1form.png", fullPage: true });
  console.log("saved /tmp/contact-sp-1form.png");

  // 入力（プレースホルダで特定）
  await p.getByPlaceholder("平壌　太郎").fill("平壌 太郎");
  await p.getByPlaceholder("ヘイジョウ　タロウ").fill("ヘイジョウ タロウ");
  const emails = p.getByPlaceholder("info@example.com");
  await emails.nth(0).fill("test@example.com");
  await emails.nth(1).fill("test@example.com");
  await p.getByPlaceholder("075-000-0000").fill("075-123-4567");
  await p.getByPlaceholder("ご自由にご入力ください。").fill("テスト送信です。SP表示の確認をしています。改行も\n確認します。");
  await p.locator('input[type="checkbox"]').check();
  await p.waitForTimeout(400);
  await p.screenshot({ path: "/tmp/contact-sp-1filled.png", fullPage: true });
  console.log("saved /tmp/contact-sp-1filled.png");

  // ステップ2: 確認
  await p.getByText("確認画面へ進む").click();
  await p.waitForTimeout(1000);
  await p.screenshot({ path: "/tmp/contact-sp-2confirm.png", fullPage: true });
  console.log("saved /tmp/contact-sp-2confirm.png");

  await b.close();
}
main().catch((e) => { console.error(e); process.exit(1); });
