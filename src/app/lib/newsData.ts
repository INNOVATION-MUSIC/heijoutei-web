// ニュースデータ一元管理 - PC・SP共通
export const NEWS_TAG_NEW = { label: "NEW", color: "#da3425" };

export const NEWS_DATA = [
  {
    img: "/images/news1.jpg",
    date: "2026.05.1",
    title: "ゴールデンウィーク期間の営業について",
    tags: [NEWS_TAG_NEW, { label: "お知らせ", color: "#e18e3b" }],
  },
  {
    img: "/images/news2.jpg",
    date: "2026.05.1",
    title: "春の特選和牛コース登場！期間限定のご案内",
    tags: [NEWS_TAG_NEW, { label: "ブログ", color: "#2563a0" }, { label: "亀岡店", color: "#16871d" }],
  },
  {
    img: "/images/news3.jpg",
    date: "2026.05.1",
    title: "特別プランのご予約受付開始",
    tags: [] as { label: string; color: string }[],
  },
  {
    img: "/images/news4.jpg",
    date: "2026.05.1",
    title: "スタッフ募集中 詳しくは",
    tags: [{ label: "お知らせ", color: "#e18e3b" }],
  },
];

export type NewsItem = (typeof NEWS_DATA)[number];
