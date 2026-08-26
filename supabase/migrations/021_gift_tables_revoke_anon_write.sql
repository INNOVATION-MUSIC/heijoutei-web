-- ========================================
-- 平壌亭 CMS — 021 ギフト2テーブルのanon書き込み権限を剥奪（多層防御・修正）
-- 016/017 で「MCP作成テーブルはGRANT必須」を踏まえたつもりが、
-- anon にも INSERT/UPDATE/DELETE を付与してしまっていた（010で確立した
-- 「anonは読み取り専用」方針から漏れた）。RLSはSELECTポリシーのみで
-- 現状の書き込みは拒否されているが、GRANT自体も他テーブルと同様に
-- 剥奪し、将来のRLS変更に対する多層防御を揃える。
-- ========================================
REVOKE INSERT, UPDATE, DELETE ON public.gift_products FROM anon;
REVOKE INSERT, UPDATE, DELETE ON public.gift_shipping_areas FROM anon;
