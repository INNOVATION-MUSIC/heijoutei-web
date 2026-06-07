// ニュースデータ一元管理 - PC・SP共通
export const NEWS_TAG_NEW = { label: "NEW", color: "#da3425" };

export const NEWS_DATA = [
  {
    img: "/images/news1.webp",
    date: "2026.05.1",
    title: "ゴールデンウィーク期間の営業について",
    tags: [NEWS_TAG_NEW, { label: "お知らせ", color: "#e18e3b" }],
  },
  {
    img: "/images/news2.webp",
    date: "2026.05.1",
    title: "春の特選和牛コース登場！期間限定のご案内",
    tags: [NEWS_TAG_NEW, { label: "ブログ", color: "#2563a0" }, { label: "亀岡店", color: "#16871d" }],
  },
  {
    img: "/images/news3.webp",
    date: "2026.05.1",
    title: "特別プランのご予約受付開始",
    tags: [] as { label: string; color: string }[],
  },
  {
    img: "/images/news4.webp",
    date: "2026.05.1",
    title: "スタッフ募集中 詳しくは",
    tags: [{ label: "お知らせ", color: "#e18e3b" }],
  },
];

export type NewsItem = (typeof NEWS_DATA)[number];

// タグの色（PCトップ NewsSection と統一・newタグは一覧では使わない）
const TAG_NEWS  = { label: "お知らせ", color: "#e18e3b" };
const TAG_BLOG  = { label: "ブログ",   color: "#2563a0" };
const tagStore  = (label: string) => ({ label, color: "#16871d" });

// お知らせ一覧ページ用データ（/news・PC 3列グリッド）
// Figma「お知らせ一覧」の並び順（左→右、上→下）に準拠
export const NEWS_LIST_DATA = [
  {
    img: "/images/newslist1.webp",
    date: "2026.05.1",
    title: "ゴールデンウィーク期間の営業について",
    tags: [TAG_NEWS],
  },
  {
    img: "/images/newslist2.webp",
    date: "2026.05.1",
    title: "春の特選和牛コース登場！期間限定のご案内",
    tags: [TAG_BLOG, tagStore("亀岡店")],
  },
  {
    img: "/images/newslist3.webp",
    date: "2026.05.1",
    title: "特別プランのご予約受付開始",
    tags: [TAG_NEWS],
  },
  {
    img: "/images/newslist4.webp",
    date: "2026.05.1",
    title: "福知山店にてスタッフ募集中!!",
    tags: [TAG_NEWS],
  },
  {
    img: "/images/newslist5.webp",
    date: "2026.05.1",
    title: "新メニュー「特選タン塩盛り合わせ」販売開始",
    tags: [TAG_BLOG, tagStore("園部店")],
  },
  {
    img: "/images/newslist6.webp",
    date: "2026.05.1",
    title: "臨時休業のお知らせ",
    tags: [TAG_NEWS],
  },
  {
    img: "/images/newslist7.webp",
    date: "2026.05.1",
    title: "韓国恵方巻 お持ち帰り予約受付中",
    tags: [TAG_NEWS],
  },
  {
    img: "/images/newslist8.webp",
    date: "2026.05.1",
    title: "日頃より頑張ってくれているパートさんに感謝の意を込めて、慰労食事会を開きました",
    tags: [TAG_BLOG, tagStore("福知山店")],
  },
  {
    img: "/images/newslist9.webp",
    date: "2026.05.1",
    title: "全店謝恩セール開催中　最高級のお肉の盛り合わせ",
    tags: [TAG_NEWS],
  },
];
