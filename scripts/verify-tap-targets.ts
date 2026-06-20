import { chromium } from "playwright";

async function measure(width: number, label: string) {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width, height: 844 } });
  await p.goto("http://localhost:3000/", { waitUntil: "networkidle" });
  await p.waitForTimeout(1500);
  // スクロールして固定ヘッダー/CTAを確実に出す
  await p.mouse.wheel(0, 600);
  await p.waitForTimeout(800);

  const reserve = await p.getByRole("button", { name: "予約する" }).boundingBox();
  const takeout = await p.getByText("テイクアウト", { exact: true }).first().boundingBox();
  console.log(`\n[${label} ${width}px]`);
  console.log("  予約するCTA   :", reserve && `${Math.round(reserve.width)}x${Math.round(reserve.height)}`);
  console.log("  テイクアウトCTA:", takeout && `${Math.round(takeout.width)}x${Math.round(takeout.height)}`);

  if (width < 1024) {
    const burger = await p.getByRole("button", { name: "メニューを開く" }).boundingBox();
    console.log("  ハンバーガー   :", burger && `${Math.round(burger.width)}x${Math.round(burger.height)}`);
  }
  await b.close();
}

async function main() {
  await measure(390, "SP");
  await measure(1440, "PC");
}
main().catch((e) => { console.error(e); process.exit(1); });
