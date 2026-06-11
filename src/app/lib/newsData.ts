// ニュースデータ一元管理 - PC・SP共通
export const NEWS_TAG_NEW = { label: "NEW", color: "#da3425" };

export const NEWS_DATA = [
  {
    id: "1",
    img: "/images/news1.webp",
    date: "2026.05.1",
    title: "ゴールデンウィーク期間の営業について",
    tags: [NEWS_TAG_NEW, { label: "お知らせ", color: "#e18e3b" }],
  },
  {
    id: "2",
    img: "/images/news2.webp",
    date: "2026.05.1",
    title: "春の特選和牛コース登場！期間限定のご案内",
    tags: [NEWS_TAG_NEW, { label: "ブログ", color: "#2563a0" }, { label: "亀岡店", color: "#16871d" }],
  },
  {
    id: "3",
    img: "/images/news3.webp",
    date: "2026.05.1",
    title: "特別プランのご予約受付開始",
    tags: [] as { label: string; color: string }[],
  },
  {
    id: "4",
    img: "/images/news4.webp",
    date: "2026.05.1",
    title: "スタッフ募集中 詳しくは",
    tags: [{ label: "お知らせ", color: "#e18e3b" }],
  },
];

export type NewsItem = (typeof NEWS_DATA)[number];

// タグの色（PCトップ NewsSection と統一・newタグは一覧では使わない）
export type Tag = { label: string; color: string };
const TAG_NEWS  = { label: "お知らせ", color: "#e18e3b" };
const TAG_BLOG  = { label: "ブログ",   color: "#2563a0" };
const tagStore  = (label: string) => ({ label, color: "#16871d" });

// お知らせ一覧ページ用データ（/news・PC 3列グリッド）
// Figma「お知らせ一覧」の並び順（左→右、上→下）に準拠。
// id は詳細ページ /news/[id] のルーティングキー。
// heroImg（詳細右上 500×500）・body（本文）・bodyImg（本文中 980×640）は詳細ページ用（任意）。
// heroImg / body が無い場合は newsHero() / newsBody() が一覧画像・既定文にフォールバックする。
export type NewsListItem = {
  id: string;
  img: string;
  date: string;
  title: string;
  tags: Tag[];
  heroImg?: string;
  body?: string;
  bodyImg?: string;
};

export const NEWS_LIST_DATA: NewsListItem[] = [
  {
    id: "1",
    img: "/images/newslist1.webp",
    date: "2026.05.1",
    title: "ゴールデンウィーク期間の営業について",
    tags: [TAG_NEWS],
  },
  {
    id: "2",
    img: "/images/newslist2.webp",
    date: "2026.05.1",
    title: "春の特選和牛コース登場！期間限定のご案内",
    tags: [TAG_BLOG, tagStore("亀岡店")],
  },
  {
    id: "3",
    img: "/images/newslist3.webp",
    date: "2026.05.1",
    title: "特別プランのご予約受付開始",
    tags: [TAG_NEWS],
  },
  {
    id: "4",
    img: "/images/newslist4.webp",
    date: "2026.05.1",
    title: "福知山店にてスタッフ募集中!!",
    tags: [TAG_NEWS],
  },
  {
    id: "5",
    img: "/images/newslist5.webp",
    date: "2026.05.1",
    title: "新メニュー「特選タン塩盛り合わせ」販売開始",
    tags: [TAG_BLOG, tagStore("園部店")],
  },
  {
    id: "6",
    img: "/images/newslist6.webp",
    date: "2026.05.16",
    title: "臨時休業のお知らせ",
    tags: [TAG_NEWS],
    heroImg: "/images/newsdetail_hero.webp",
    bodyImg: "/images/newsdetail_body.webp",
    body: `日頃より焼肉 平壌亭 亀岡店をご愛顧いただき、誠にありがとうございます。
誠に勝手ながら、店舗メンテナンスのため、下記日程を臨時休業とさせていただきます。

【臨時休業日】
2026年6月16日（火）〜18日（木）
2026年7月22日（水）〜23日（木）

お客様にはご迷惑をおかけいたしますが、何卒ご理解賜りますようお願い申し上げます。`,
  },
  {
    id: "7",
    img: "/images/newslist7.webp",
    date: "2026.05.1",
    title: "韓国恵方巻 お持ち帰り予約受付中",
    tags: [TAG_NEWS],
  },
  {
    id: "8",
    img: "/images/newslist8.webp",
    date: "2026.05.1",
    title: "日頃より頑張ってくれているパートさんに感謝の意を込めて、慰労食事会を開きました",
    tags: [TAG_BLOG, tagStore("福知山店")],
  },
  {
    id: "9",
    img: "/images/newslist9.webp",
    date: "2026.05.1",
    title: "全店謝恩セール開催中　最高級のお肉の盛り合わせ",
    tags: [TAG_NEWS],
  },
];

// 詳細本文が未設定の記事に使う既定文（テンプレートが成立する最小限の文面）
export const DEFAULT_NEWS_BODY = `日頃より焼肉 平壌亭をご愛顧いただき、誠にありがとうございます。
詳細につきましては、各店舗までお問い合わせくださいませ。

今後とも焼肉 平壌亭をよろしくお願い申し上げます。`;

/** id から記事を取得（無ければ undefined） */
export function getNewsArticle(id: string): NewsListItem | undefined {
  return NEWS_LIST_DATA.find((n) => n.id === id);
}

/** 詳細ページ右上 500×500 画像（未設定なら一覧画像にフォールバック） */
export function newsHero(a: NewsListItem): string {
  return a.heroImg ?? a.img;
}

/** 詳細本文（未設定なら既定文） */
export function newsBody(a: NewsListItem): string {
  return a.body ?? DEFAULT_NEWS_BODY;
}
