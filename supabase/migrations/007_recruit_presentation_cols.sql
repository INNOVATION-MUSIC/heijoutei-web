-- ========================================
-- 平壌亭 CMS — 007 採用フロントの表示固有項目を保持する列追加
-- 一覧カードの2行teaser(summary)と詳細500x500画像(hero_image_url)は
-- 既存フロント固有の表示項目で、回帰なく動的化するために列を追加する。
-- ========================================
ALTER TABLE public.recruitments ADD COLUMN IF NOT EXISTS summary TEXT;
ALTER TABLE public.recruitments ADD COLUMN IF NOT EXISTS hero_image_url TEXT;
