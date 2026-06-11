-- ========================================
-- 平壌亭 CMS — 008 メニューカテゴリのカード画像列
-- カテゴリ一覧グリッド(/menu)のカード写真(menu_cat_*.webp)を保持する。
-- 既存静的データの移行は scripts/migrate-menu.ts で実施。
-- ========================================
ALTER TABLE public.menu_categories ADD COLUMN IF NOT EXISTS card_image_url TEXT;
