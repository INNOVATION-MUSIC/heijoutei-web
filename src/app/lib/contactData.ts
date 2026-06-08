// お問い合わせフォーム用データ（店舗・お問い合わせ種別）
// Figma「お問い合わせ」3画面（2004:2）準拠。
// ※店舗データはトップ StoreSection / takeoutData と同内容だが、機能ごとに別定義（既存の踏襲）。

export type ContactStore = { id: string; name: string; tel: string };

export const CONTACT_STORES: ContactStore[] = [
  { id: "kameoka", name: "亀岡店", tel: "0771-23-8410" },
  { id: "sonobe", name: "園部店", tel: "0771-68-0298" },
  { id: "fukuchiyama", name: "福知山店", tel: "0773-23-8410" },
  { id: "yurano", name: "焼肉 ゆらの", tel: "0771-22-8410" },
  { id: "heijohtei", name: "ヘイジョウテイ", tel: "0771-29-8410" },
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
