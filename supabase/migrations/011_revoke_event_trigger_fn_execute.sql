-- ========================================
-- 平壌亭 CMS — 011 イベントトリガ関数の EXECUTE 剥奪（多層防御）
-- rls_auto_enable() は DDL イベントトリガ用の SECURITY DEFINER 関数。
-- 関数定義時の PUBLIC 既定付与により anon/authenticated が /rpc から呼べる状態だった。
-- イベントトリガ経由でのみ動けばよく、ロール経由の EXECUTE は不要なので剥奪する。
-- （Supabase security advisor 0028/0029 の指摘に対応）
-- ========================================
REVOKE EXECUTE ON FUNCTION public.rls_auto_enable() FROM PUBLIC, anon, authenticated;
