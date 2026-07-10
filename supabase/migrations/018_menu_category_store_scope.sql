-- menu_categories に対象店舗（store_ids）を追加。
-- NULL / 空配列 = 全店表示（従来どおり後方互換）。
-- 店舗を指定した場合は、その店舗の /menu カテゴリ一覧にのみ表示する。
-- ※ カテゴリ自体はグローバルのまま。表示可否だけを店舗で絞る。
alter table public.menu_categories
  add column if not exists store_ids uuid[];

comment on column public.menu_categories.store_ids is
  'NULL/空=全店表示。stores.id の配列を指定するとその店舗のみ /menu カテゴリ一覧に表示する。';

-- 権限はテーブルレベル GRANT（006_grants.sql）で新列も自動的にカバーされる。
-- RLS は menu_categories の既存 SELECT ポリシーがそのまま適用され追加不要。
