// ナビゲーションリンク定義（パスは後で設定し直す）
export const NAV_LINKS = [
  { label: "お知らせ",           href: "/news" },
  { label: "平壌亭について",     href: "/about" },
  { label: "メニュー",           href: "/menu" },
  { label: "店舗一覧",           href: "/store" },
  { label: "ご予約",             href: "/reserve" },
  { label: "公式オンラインストア", href: "/online-shop" },
  { label: "採用情報",           href: "/recruit" },
  { label: "お問い合せ",         href: "/contact" },
] as const;

export type NavLink = (typeof NAV_LINKS)[number];

// セクション別ボタンリンク
export const SECTION_LINKS = {
  news:    "/news",
  menu:    "/menu",
  lunch:   "/menu/lunch",
  course:  "/menu/course",
  store:   "/store",
  online:  "/online-shop",
  takeout: "/takeout",
  reserve: "/reserve",
  cta:     "/reserve",
  line:    "/line",        // LINE友だち追加ページ（後で外部URLに変更）
} as const;

// 各店舗LINE友だち追加リンク（後で実URLに変更）
export const LINE_STORE_LINKS = {
  kameoka:     "/line/kameoka",
  sonobe:      "/line/sonobe",
  fukuchiyama: "/line/fukuchiyama",
  yurano:      "/line/yurano",
} as const;
