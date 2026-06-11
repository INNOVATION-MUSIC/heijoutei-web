// 管理画面にログインして主要ページのスクリーンショットを撮るデバッグ用スクリプト。
//   ADMIN_EMAIL=... ADMIN_PASSWORD=... npx tsx scripts/shot-admin.ts
import { chromium } from "playwright";

const email = process.env.ADMIN_EMAIL!;
const password = process.env.ADMIN_PASSWORD!;
const BASE = "http://localhost:3000";

async function main() {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  await page.goto(`${BASE}/admin/login`, { waitUntil: "networkidle" });
  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', password);
  await page.click('button[type="submit"]');
  await page.waitForURL("**/admin", { timeout: 15000 }).catch(() => {});
  await page.waitForTimeout(1500);

  await page.screenshot({ path: "/tmp/admin-dashboard.png", fullPage: true });

  await page.goto(`${BASE}/admin/stores`, { waitUntil: "networkidle" });
  await page.waitForTimeout(800);
  await page.screenshot({ path: "/tmp/admin-stores.png", fullPage: true });

  await page.goto(`${BASE}/admin/news/new`, { waitUntil: "networkidle" });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: "/tmp/admin-news-new.png", fullPage: true });

  console.log("saved /tmp/admin-dashboard.png, /tmp/admin-stores.png, /tmp/admin-news-new.png");
  await browser.close();
}

main().catch((e) => { console.error(e); process.exit(1); });
