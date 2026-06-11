import { chromium } from "playwright";
async function main() {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1440, height: 1400 } });
  await p.goto("http://localhost:3000/takeout", { waitUntil: "networkidle" });
  await p.waitForTimeout(1500);
  // ○(受取可)マークをクリック(凡例の○を避けて複数試行)
  const marks = p.getByText("○", { exact: true });
  const mc = await marks.count();
  let dateOk = false;
  for (let i = 0; i < mc; i++) {
    await marks.nth(i).click({ timeout: 1500 }).catch(() => {});
    await p.waitForTimeout(300);
    // 時間枠が選べるようになったか: 時間ボタンを押す
    const t = p.getByText(/^\d{2}\s*:\s*\d{2}$/).first();
    if (await t.count() > 0) { await t.click({ timeout: 1500 }).catch(() => {}); }
    const next = p.getByRole("button", { name: /メニュー選択へ進む/ });
    if (await next.count() > 0 && await next.first().isEnabled().catch(() => false)) { dateOk = true; break; }
  }
  const next = p.getByRole("button", { name: /メニュー選択へ進む/ });
  const enabled = await next.first().isEnabled().catch(() => false);
  console.log("日付+時間選択:", dateOk, "/ 次へ有効:", enabled);
  if (enabled) {
    await next.first().click();
    await p.waitForTimeout(1500);
    await p.screenshot({ path: "/tmp/takeout-step2.png", fullPage: true });
    console.log("Step2 焼肉弁当(DB):", (await p.locator("text=焼肉弁当").count()) > 0 ? "YES" : "NO");
    console.log("Step2 カルビ弁当(DB):", (await p.locator("text=カルビ弁当").count()) > 0 ? "YES" : "NO");
  }
  await b.close();
}
main().catch((e) => { console.error(e.message); process.exit(1); });
