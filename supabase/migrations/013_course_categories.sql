-- ========================================
-- 平壌亭 CMS — 013 コースカテゴリ（/menu/course のサブタブ化）
-- テイクアウト（takeout_categories）と同方式で、コースをカテゴリ別タブに分けて表示する。
-- 後方互換: course_category_id は NULL 許容。未設定のコース／カテゴリ0件のときは
-- フロントは従来どおりカテゴリタブ無しのフラット表示にフォールバックする。
-- ========================================

-- 1) コースカテゴリ（takeout_categories と同形）
CREATE TABLE IF NOT EXISTS public.course_categories (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT NOT NULL,
  slug       TEXT NOT NULL UNIQUE,
  is_active  BOOLEAN DEFAULT true,
  sort_order INT DEFAULT 0
);

-- 2) コース → カテゴリの紐づけ（NULL 許容・カテゴリ削除時は未分類へ）
ALTER TABLE public.courses
  ADD COLUMN IF NOT EXISTS course_category_id UUID
    REFERENCES public.course_categories(id) ON DELETE SET NULL;

-- 3) RLS（公開 SELECT のみ・既存テーブルと同方針）
ALTER TABLE public.course_categories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public select course_categories" ON public.course_categories;
CREATE POLICY "Public select course_categories"
  ON public.course_categories FOR SELECT USING (is_active = true);

-- 4) 権限（MCP/手動作成テーブルは GRANT を明示する。anon は SELECT のみ＝010 方針）
GRANT ALL ON public.course_categories TO service_role;
GRANT SELECT ON public.course_categories TO anon, authenticated;
