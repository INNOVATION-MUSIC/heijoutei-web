-- ========================================
-- 平壌亭 CMS — 010 anon 権限の縮小（多層防御）
-- フロント(anon)は読み取り専用。公開フォーム(問い合わせ/注文)は
-- /api/contact・/api/takeout が service_role で INSERT するため、
-- anon に書き込み権限・匿名INSERTポリシーは不要。
-- これにより、将来 RLS 設定を失念しても anon からの書き込みを遮断できる。
-- ========================================

-- 1) anon の書き込みテーブル権限を剥奪（SELECT のみ残す）
REVOKE INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public FROM anon;
ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE INSERT, UPDATE, DELETE ON TABLES FROM anon;

-- 2) 不要になった匿名INSERTポリシーを削除（フォームは service_role 経由）
DROP POLICY IF EXISTS "Public insert takeout_orders"      ON public.takeout_orders;
DROP POLICY IF EXISTS "Public insert takeout_order_items" ON public.takeout_order_items;
DROP POLICY IF EXISTS "Public insert contact_messages"    ON public.contact_messages;

-- 注: service_role(管理画面/API) の GRANT ALL（006）は維持。
--     authenticated への書き込み権限も 006 のまま（アプリは admin 操作も service_role 経由で行うが、
--     ストレージ等で authenticated を使うため現状維持＝必要最小限の変更に留める）。
