// ナビゲーションリンク定義（パスは後で設定し直す）
export const NAV_LINKS = [
  { label: "お知らせ",           href: "/news" },
  { label: "平壌亭について",     href: "/about" },
  { label: "メニュー",           href: "/menu" },
  { label: "ご進物",             href: "/gift" },
  { label: "店舗一覧",           href: "/store" },
  // { label: "ご予約", href: "/reserve" }, // /reserveページが無く404のため削除（予約はモーダルで対応）
  // { label: "公式オンラインストア", href: "/online-shop" }, // OnlineShop非公開中（公開後に解除）
  { label: "採用情報",           href: "/recruit" },
  { label: "お問い合せ",         href: "/contact" },
] as const;

export type NavLink = (typeof NAV_LINKS)[number];

// 下層ページ共通ヘッダーのナビ（Figmaの左→右の並び順・「ご予約」はボタンで別途）
export const HEADER_NAV_LINKS = [
  { label: "お問い合せ",         href: "/contact" },
  { label: "採用情報",           href: "/recruit" },
  // { label: "公式オンラインストア", href: "/online-shop" }, // OnlineShop非公開中（公開後に解除）
  { label: "店舗情報",           href: "/store" },
  { label: "メニュー",           href: "/menu" },
  { label: "ご進物",             href: "/gift" },
  { label: "お知らせ",           href: "/news" },
  { label: "平壌亭について",     href: "/about" },
] as const;

// セクション別ボタンリンク
export const SECTION_LINKS = {
  news:    "/news",
  menu:    "/menu",
  lunch:   "/menu/lunch",
  course:  "/menu/course",
  store:   "/store",
  gift:    "/gift",
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
