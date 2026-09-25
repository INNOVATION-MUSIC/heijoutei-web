-- お知らせサムネイルを切らずに全体表示（余白は黒）するフラグ。
-- 例: 横長・縦長のチラシ画像で、正方形などの枠に合わせて切り抜くと文字が欠ける記事。
alter table public.news
  add column if not exists thumbnail_contain boolean not null default false;

comment on column public.news.thumbnail_contain is
  'true=サムネイルを切らずに全体表示（余白は黒）。トップ・一覧・詳細（PC/SP）に適用。管理画面のチェックボックスで設定。';
