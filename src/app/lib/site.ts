// サイト全体のメタ情報・絶対URLの基点。
// 独自ドメイン切替時は NEXT_PUBLIC_SITE_URL を設定するだけで sitemap / canonical / OGP が追従する。
export const PRODUCTION_SITE_URL = "https://heijyotei.com";

export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? PRODUCTION_SITE_URL
).replace(/\/$/, "");

// 確認環境（NEXT_PUBLIC_SITE_URL が本番以外）では noindex・「確認環境」表示・メール差し替えを行う
export const IS_PRODUCTION_SITE = SITE_URL === PRODUCTION_SITE_URL;

export const SITE_NAME = "平壌亭";

export const SITE_DESCRIPTION =
  "創業50年以上。京都の亀岡・園部・福知山に5店舗（平壌亭・焼肉ゆらの・KOPU29）を構える焼肉店、平壌亭の公式サイト。";
