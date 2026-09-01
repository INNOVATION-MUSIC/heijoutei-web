// お問い合わせフォーム用データ（店舗・お問い合わせ種別）
// Figma「お問い合わせ」3画面（2004:2）準拠。
// ※店舗データはトップ StoreSection / takeoutData と同内容だが、機能ごとに別定義（既存の踏襲）。

export type ContactStore = { id: string; name: string; tel: string };

// tel は storeDetailData.ts（実店舗データ）と一致させる。DB空時のみ使われるフォールバック。
export const CONTACT_STORES: ContactStore[] = [
  { id: "kameoka", name: "亀岡店", tel: "0771-23-8410" },
  { id: "sonobe", name: "園部店", tel: "0771-68-1760" },
  { id: "fukuchiyama", name: "福知山店", tel: "0773-24-2322" },
  { id: "yurano", name: "焼肉 ゆらの", tel: "0773-45-8429" },
  { id: "heijohtei", name: "ヘイジョウテイ", tel: "0771-20-1960" },
];

// お問い合わせ種別（Figma の既定は「ご予約について」）
export const INQUIRY_TYPES = [
  "ご予約について",
  "メニューについて",
  "テイクアウトについて",
  "求人・採用について",
  "その他",
] as const;

export type InquiryType = (typeof INQUIRY_TYPES)[number];
