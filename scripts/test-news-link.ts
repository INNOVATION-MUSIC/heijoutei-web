import { chromium } from "playwright";
const email = process.env.ADMIN_EMAIL!;
const password = process.env.ADMIN_PASSWORD!;
const BASE = "http://localhost:3000";
const TITLE = "【連携テスト】管理画面から公開したお知らせ";

async function main() {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  await page.goto(`${BASE}/admin/login`, { waitUntil: "networkidle" });
  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', password);
  await page.click('button[type="submit"]');
  await page.waitForURL("**/admin", { timeout: 15000 }).catch(() => {});
  await page.waitForTimeout(1000);

  await page.goto(`${BASE}/admin/news/new`, { waitUntil: "networkidle" });
  await page.getByRole("textbox").first().waitFor({ state: "visible", timeout: 10000 });
  await page.getByRole("textbox").first().fill(TITLE);                 // タイトル
  await page.locator("select").first().selectOption({ label: "公開" }); // 状態
  await page.getByRole("button", { name: "保存する" }).click();
  await page.waitForURL("**/admin/news", { timeout: 15000 }).catch(() => {});
  await page.waitForTimeout(1500);

  await page.goto(`${BASE}/news`, { waitUntil: "networkidle" });
  await page.waitForTimeout(1500);
  const found = await page.locator(`text=${TITLE}`).count();
  console.log("front /news 表示:", found > 0 ? "YES" : "NO");
  await page.screenshot({ path: "/tmp/front-news-after.png", fullPage: true });
  await browser.close();
}
main().catch((e) => { console.error(e.message); process.exit(1); });
