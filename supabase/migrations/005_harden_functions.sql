-- ========================================
-- 平壌亭 CMS — 005 関数のハーデニング（Supabase security advisor 対応）
-- ========================================

-- search_path を固定（function_search_path_mutable 警告の解消）
ALTER FUNCTION public.update_updated_at() SET search_path = '';
ALTER FUNCTION public.handle_new_user() SET search_path = '';

-- トリガー専用関数を RPC から直接実行できないよう EXECUTE 権限を剥奪（トリガー発火には影響しない）
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.update_updated_at() FROM anon, authenticated, public;

-- profiles: 本人が自分のプロフィールを読めるポリシー（管理画面は service role でバイパス）
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);
