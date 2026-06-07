// テイクアウト注文フロー用データ（店舗・メニュー・カテゴリ・時間枠・カレンダー）
// Figma「テイクアウト」5画面（2011:2）準拠。

// ───────── 店舗 ─────────
export type TakeoutStore = { id: string; name: string; tel: string };

export const TAKEOUT_STORES: TakeoutStore[] = [
  { id: "kameoka", name: "亀岡店", tel: "0771-23-8410" },
  { id: "sonobe", name: "園部店", tel: "0771-68-0298" },
  { id: "fukuchiyama", name: "福知山店", tel: "0773-23-8410" },
  { id: "yurano", name: "焼肉 ゆらの", tel: "0771-22-8410" },
  { id: "heijohtei", name: "ヘイジョウテイ", tel: "0771-29-8410" },
];

// ───────── メニューカテゴリ ─────────
export const TAKEOUT_CATEGORIES = [
  "焼肉弁当",
  "お惣菜",
  "お家で焼肉セット",
  "BBQセット",
  "ご飯物/一品料理",
  "焼肉単品",
  "焼肉盛合わせ",
] as const;

export type TakeoutCategory = (typeof TAKEOUT_CATEGORIES)[number];

// ───────── メニュー商品 ─────────
export type TakeoutMenuItem = {
  id: string;
  category: TakeoutCategory;
  name: string;
  desc: string;
  price: number;
  img: string;
};

// 写真は Figma ノード撮影 → WebP 化した 6 点を流用（takeout_*.webp）
const IMG = {
  yakiniku: "/images/takeout_yakiniku.webp",
  karubi: "/images/takeout_karubi.webp",
  tanshio: "/images/takeout_tanshio.webp",
  steak: "/images/takeout_steak.webp",
  salad: "/images/takeout_salad.webp",
  soup: "/images/takeout_soup.webp",
};

export const TAKEOUT_MENU: TakeoutMenuItem[] = [
  // 焼肉弁当
  { id: "bento-yakiniku", category: "焼肉弁当", name: "焼肉弁当", desc: "脂の旨い国産牛カルビは焼\n肉の王様です。", price: 1700, img: IMG.yakiniku },
  { id: "bento-karubi", category: "焼肉弁当", name: "カルビ弁当", desc: "脂の旨い国産牛カルビは焼\n肉の王様です。", price: 2000, img: IMG.karubi },
  { id: "bento-tanshio", category: "焼肉弁当", name: "タン塩弁当", desc: "ジューシーなタンの旨みと\nさっぱりとした塩ダレの組\nみ合わせが絶品", price: 2000, img: IMG.tanshio },
  { id: "bento-steak", category: "焼肉弁当", name: "ステーキ弁当", desc: "赤身の旨みが際立つやわら\nかなステーキ肉を使用", price: 2800, img: IMG.steak },

  // お惣菜
  { id: "side-salad", category: "お惣菜", name: "野菜サラダ", desc: "平壌亭オリジナルドレッシン\nグのさっぱりサラダ", price: 800, img: IMG.salad },
  { id: "side-soup", category: "お惣菜", name: "たまごスープ", desc: "ごま油香る卵とわかめの\nふんわりスープ", price: 594, img: IMG.soup },
  { id: "side-namul", category: "お惣菜", name: "ナムル盛り合わせ", desc: "三種のナムルを彩りよく\n盛り合わせました", price: 650, img: IMG.salad },
  { id: "side-kimchi", category: "お惣菜", name: "自家製キムチ", desc: "じっくり漬け込んだ\n旨辛の自家製キムチ", price: 580, img: IMG.salad },

  // お家で焼肉セット
  { id: "home-karubi", category: "お家で焼肉セット", name: "国産牛カルビセット", desc: "ご家庭で楽しむ\n国産牛カルビ（2人前）", price: 3800, img: IMG.karubi },
  { id: "home-tan", category: "お家で焼肉セット", name: "上タン塩セット", desc: "厚切り上タンを\nたっぷり（2人前）", price: 4200, img: IMG.tanshio },
  { id: "home-family", category: "お家で焼肉セット", name: "焼肉ファミリーセット", desc: "カルビ・ロース・タンの\n人気3種（4人前）", price: 5800, img: IMG.yakiniku },

  // BBQセット
  { id: "bbq-standard", category: "BBQセット", name: "BBQスタンダードセット", desc: "野菜付き・3〜4人前の\nお手軽BBQセット", price: 6800, img: IMG.yakiniku },
  { id: "bbq-deluxe", category: "BBQセット", name: "BBQデラックスセット", desc: "特選肉と海鮮入りの\n豪華BBQセット（5人前）", price: 9800, img: IMG.steak },

  // ご飯物/一品料理
  { id: "rice-kuppa", category: "ご飯物/一品料理", name: "クッパ", desc: "やさしい旨みの\n韓国風スープご飯", price: 900, img: IMG.soup },
  { id: "rice-bibimbap", category: "ご飯物/一品料理", name: "ビビンバ", desc: "彩り野菜と挽肉の\n混ぜご飯", price: 1100, img: IMG.salad },
  { id: "rice-naengmyeon", category: "ご飯物/一品料理", name: "冷麺", desc: "コシのある麺と\nさっぱり冷たいスープ", price: 1000, img: IMG.soup },

  // 焼肉単品
  { id: "single-karubi", category: "焼肉単品", name: "上カルビ", desc: "霜降りの旨みあふれる\n上カルビ", price: 1800, img: IMG.karubi },
  { id: "single-rosu", category: "焼肉単品", name: "上ロース", desc: "やわらかな赤身の\n上ロース", price: 1800, img: IMG.steak },
  { id: "single-tan", category: "焼肉単品", name: "上タン塩", desc: "厚切りで食感豊かな\n上タン塩", price: 2200, img: IMG.tanshio },

  // 焼肉盛合わせ
  { id: "platter-regular", category: "焼肉盛合わせ", name: "焼肉盛合わせ", desc: "人気の部位を彩りよく\n盛り合わせ（3〜4人前）", price: 5800, img: IMG.yakiniku },
  { id: "platter-premium", category: "焼肉盛合わせ", name: "特選盛合わせ", desc: "特選部位を贅沢に\n盛り合わせ（4〜5人前）", price: 8800, img: IMG.steak },
];

// ───────── 受取時間枠（11:30〜22:00 / 30分刻み・全22枠） ─────────
export const TAKEOUT_TIME_SLOTS: string[] = (() => {
  const slots: string[] = [];
  for (let m = 11 * 60 + 30; m <= 22 * 60; m += 30) {
    const h = Math.floor(m / 60);
    const min = m % 60;
    slots.push(`${String(h).padStart(2, "0")} : ${String(min).padStart(2, "0")}`);
  }
  return slots;
})();

// ───────── カレンダー ─────────
// 受取日の状態。火曜は店舗休業日(定休)。土日は残りわずか想定。それ以外は予約可能。
export type DayStatus = "available" | "few" | "unavailable" | "closed" | "past" | "empty";

export type CalendarDay = {
  day: number;          // 1〜31（空セルは 0）
  weekday: number;      // 0=日 … 6=土
  status: DayStatus;
  iso: string;          // "2026-06-12"（空セルは ""）
};

const WEEKDAY_LABELS = ["日", "月", "火", "水", "木", "金", "土"];
export { WEEKDAY_LABELS };

/** 指定年月（month は 0 始まり）の 6 週ぶんのカレンダーを生成する。 */
export function buildCalendar(year: number, month: number, today: Date): CalendarDay[] {
  const first = new Date(year, month, 1);
  const startWeekday = first.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const t = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const max = new Date(t);
  max.setDate(max.getDate() + 31); // 本日から31日先まで予約可能

  const cells: CalendarDay[] = [];
  // 先頭の空セル
  for (let i = 0; i < startWeekday; i++) {
    cells.push({ day: 0, weekday: i, status: "empty", iso: "" });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(year, month, d);
    const weekday = date.getDay();
    const iso = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    let status: DayStatus;
    if (weekday === 2) status = "closed";          // 火曜定休
    else if (date < t || date > max) status = "past"; // 期間外
    else if (weekday === 0 || weekday === 6) status = "few"; // 土日は残りわずか
    else status = "available";
    cells.push({ day: d, weekday, status, iso });
  }
  // 末尾の空セル（6週=42セルに揃える）
  while (cells.length % 7 !== 0) {
    cells.push({ day: 0, weekday: cells.length % 7, status: "empty", iso: "" });
  }
  return cells;
}

/** ISO 日付 → "5月22日(木)" 表記 */
export function formatJpDate(iso: string): string {
  if (!iso) return "";
  const [y, m, d] = iso.split("-").map(Number);
  const wd = WEEKDAY_LABELS[new Date(y, m - 1, d).getDay()];
  return `${m}月${d}日(${wd})`;
}
