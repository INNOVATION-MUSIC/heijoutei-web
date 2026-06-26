-- ========================================
-- 平壌亭 CMS — 014 ランチカテゴリ（/menu/lunch のサブタブ化）
-- ランチは store_menus(category='lunch') + menu_items のフラット構造。
-- 品目ごとに lunch_category_id を持たせてカテゴリ別タブに分ける（テイクアウト/コースと同方式）。
-- 後方互換: lunch_category_id は NULL 許容。未設定／カテゴリ0件のときは
-- フロントは従来どおりカテゴリタブ無しのフラット表示にフォールバックする。
-- ========================================

CREATE TABLE IF NOT EXISTS public.lunch_categories (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT NOT NULL,
  slug       TEXT NOT NULL UNIQUE,
  is_active  BOOLEAN DEFAULT true,
  sort_order INT DEFAULT 0
);

ALTER TABLE public.menu_items
  ADD COLUMN IF NOT EXISTS lunch_category_id UUID
    REFERENCES public.lunch_categories(id) ON DELETE SET NULL;

ALTER TABLE public.lunch_categories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public select lunch_categories" ON public.lunch_categories;
CREATE POLICY "Public select lunch_categories"
  ON public.lunch_categories FOR SELECT USING (is_active = true);

GRANT ALL ON public.lunch_categories TO service_role;
GRANT SELECT ON public.lunch_categories TO anon, authenticated;
