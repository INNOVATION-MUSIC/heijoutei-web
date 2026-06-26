-- ========================================
-- 平壌亭 CMS — 015 コース「飯物付き」フラグ
-- フロントのコースカードに、チェック時のみ「飯物付き」ラベルを表示する。
-- ========================================
ALTER TABLE public.courses
  ADD COLUMN IF NOT EXISTS with_rice BOOLEAN NOT NULL DEFAULT false;
