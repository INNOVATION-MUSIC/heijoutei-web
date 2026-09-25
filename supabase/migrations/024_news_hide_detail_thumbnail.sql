-- お知らせ詳細でサムネイル（ヒーロー画像）を表示しないフラグ。
-- 例: サムネがロゴ画像で、詳細ページのヘッダーロゴと重複する記事。一覧・トップのサムネ表示には影響しない。
alter table public.news
  add column if not exists hide_detail_thumbnail boolean not null default false;

comment on column public.news.hide_detail_thumbnail is
  'true=お知らせ詳細ページでサムネイルを表示しない（一覧のサムネは表示）。管理画面のチェックボックスで設定。';

-- 既存でロゴ画像をサムネにしている記事は非表示にしておく
update public.news
  set hide_detail_thumbnail = true
  where thumbnail_url like '%4615a3f5-88b4-41a9-8e3d-7d21d23d92c8%';
