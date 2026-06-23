// サイト全体のメタ情報・絶対URLの基点。
// 独自ドメイン切替時は NEXT_PUBLIC_SITE_URL を設定するだけで sitemap / canonical / OGP が追従する。
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://heijoutei-web.motoki-s.workers.dev"
).replace(/\/$/, "");

export const SITE_NAME = "焼肉平壌亭";

export const SITE_DESCRIPTION =
  "創業50年。受け継がれる伝統と、変わらない美味しさ。京都・亀岡、園部、福知山で愛される焼肉平壌亭の公式サイト。";
