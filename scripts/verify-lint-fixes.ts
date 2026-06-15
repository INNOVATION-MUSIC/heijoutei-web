// #4(lint修正)で挙動が変わっていないかを自動検証するデバッグ用スクリプト。
//   npx tsx scripts/verify-lint-fixes.ts
import { chromium, type Page } from "playwright";

const BASE = "http://localhost:3000";
const results: { name: string; ok: boolean; detail: string }[] = [];
function check(name: string, ok: boolean, detail = "") {
  results.push({ name, ok, detail });
  console.log(`${ok ? "✓ PASS" : "✗ FAIL"}  ${name}${detail ? `  — ${detail}` : ""}`);
}

async function bodyOverflow(page: Page) {
  return page.evaluate(() => document.body.style.overflow || "(empty)");
}

async function main() {
  const browser = await chromium.launch();

  // ── 1. PC/SP 切替（useIsMobile）──────────────────────────
  {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
    await page.waitForTimeout(800);
    // PC幅では SP専用ハンバーガー(MEMU)が出ず、PCナビが見える想定
    const pcShot = "/tmp/lintfix-top-pc.png";
    await page.screenshot({ path: pcShot });
    const pcWidth = await page.evaluate(() => document.body.scrollWidth);
    check("トップ PC描画(1440)", pcWidth <= 1480, `scrollWidth=${pcWidth}`);

    await page.setViewportSize({ width: 390, height: 844 });
    await page.waitForTimeout(800);
    const spShot = "/tmp/lintfix-top-sp.png";
    await page.screenshot({ path: spShot });
    const spWidth = await page.evaluate(() => document.body.scrollWidth);
    // SPで横スクロールが出ていない（=SPレイアウトに切替）ことを確認
    check("トップ SP切替(390・横スクロール無)", spWidth <= 400, `scrollWidth=${spWidth}`);
    await page.close();
  }

  // ── 2. /menu の店舗タブ＆?store= URL同期（useStoreParam）──
  {
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
    await page.goto(`${BASE}/menu`, { waitUntil: "networkidle" });
    await page.waitForTimeout(600);
    // 2番目の店舗タブをクリック（先頭=亀岡=既定なのでクエリが付かない。2番目で付く想定）
    const tabs = page.locator("button", { hasText: /店|ゆらの|KOPU/ });
    // 店舗タブは StoreTabs。テキストに店名を含むボタンを拾う
    const sonobe = page.getByRole("button", { name: /園部/ }).first();
    let storeQueryOk = false;
    if (await sonobe.count()) {
      await sonobe.click();
      await page.waitForTimeout(300);
      storeQueryOk = page.url().includes("store=");
    }
    check("/menu 店舗タブで ?store= 付与", storeQueryOk, page.url());

    // カテゴリへ進んでも店舗が維持されるか（肉カテゴリのカードを開く）
    const before = page.url();
    const cat = page.locator('a[href*="/menu/"]').first();
    let persistOk = false;
    if (await cat.count()) {
      const href = await cat.getAttribute("href");
      if (href && href.includes("store=")) persistOk = true;
    }
    check("カテゴリリンクに ?store= 継承", persistOk, `from ${before}`);

    // リロードで店舗維持（直接 ?store= 付きURLを開いて選択状態を確認）
    await page.goto(`${BASE}/menu?store=sonobe`, { waitUntil: "networkidle" });
    await page.waitForTimeout(500);
    const reloadOk = page.url().includes("store=sonobe");
    check("/menu?store=sonobe リロード維持", reloadOk, page.url());
    await page.screenshot({ path: "/tmp/lintfix-menu-store.png" });
    await page.close();
  }

  // ── 3. 予約モーダルの開閉＋body scroll lock/restore（ReserveModal）──
  {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
    await page.waitForTimeout(600);
    const beforeOpen = await bodyOverflow(page);

    // 右下Stickyのご予約 or ヘッダーのご予約ボタンを開く
    const reserveBtn = page.getByText("ご予約", { exact: false }).first();
    let opened = false;
    let lockedWhileOpen = "(n/a)";
    if (await reserveBtn.count()) {
      await reserveBtn.click().catch(() => {});
      await page.waitForTimeout(600);
      // モーダル内の電話番号 or 店舗名が見えるか
      opened = (await page.getByText(/亀岡店|0771/).count()) > 0;
      lockedWhileOpen = await bodyOverflow(page);
    }
    check("予約モーダルが開く", opened);
    check("開いている間 body=overflow:hidden", lockedWhileOpen === "hidden", `body.overflow=${lockedWhileOpen}`);
    await page.screenshot({ path: "/tmp/lintfix-modal-open.png" });

    // 閉じる（✕ or オーバーレイ）→ scroll lock 解除を確認
    const closeBtn = page.locator('[aria-label*="閉"], button:has(svg)').first();
    await page.keyboard.press("Escape").catch(() => {});
    // Escで閉じない実装なのでオーバーレイをクリック
    await page.mouse.click(20, 20);
    await page.waitForTimeout(700);
    const afterClose = await bodyOverflow(page);
    check("閉じた後に scroll lock 解除", afterClose !== "hidden", `body.overflow=${afterClose}（開く前=${beforeOpen}）`);
    await page.close();
  }

  // ── 4. ロゴの <Link> 化（クリックで / へ）──────────────
  {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await page.goto(`${BASE}/news`, { waitUntil: "networkidle" });
    await page.waitForTimeout(600);
    const logo = page.locator('a[aria-label="トップへ"]').first();
    let navOk = false;
    if (await logo.count()) {
      await logo.click();
      await page.waitForURL(`${BASE}/`, { timeout: 8000 }).catch(() => {});
      navOk = new URL(page.url()).pathname === "/";
    }
    check("ヘッダーロゴ(Link)→ / へ遷移", navOk, page.url());
    await page.close();
  }

  await browser.close();

  const failed = results.filter((r) => !r.ok);
  console.log(`\n=== ${results.length - failed.length}/${results.length} PASS ===`);
  if (failed.length) {
    console.log("FAILED:", failed.map((f) => f.name).join(", "));
    process.exit(1);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
