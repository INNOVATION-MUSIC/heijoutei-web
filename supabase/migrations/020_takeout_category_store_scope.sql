-- takeout_categories に対象店舗（store_ids）を追加。
-- NULL / 空配列 = 全店表示（従来どおり後方互換）。
-- 店舗を指定した場合は、その店舗の /takeout 注文フロー・/menu/takeout・管理フォームにのみ表示する。
-- ※ カテゴリ自体はグローバルのまま。表示可否だけを店舗で絞る（018 の menu_categories と同方式）。
alter table public.takeout_categories
  add column if not exists store_ids uuid[];

comment on column public.takeout_categories.store_ids is
  'NULL/空=全店表示。stores.id の配列を指定するとその店舗のみ 注文フロー/表示/管理フォームに表示する。';

-- 権限はテーブルレベル GRANT（006_grants.sql）で新列も自動的にカバーされる。
-- RLS は takeout_categories の既存 SELECT ポリシーがそのまま適用され追加不要。
