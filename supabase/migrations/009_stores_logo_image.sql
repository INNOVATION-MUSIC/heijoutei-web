-- 009: stores にロゴ画像列を追加（KOPU29 等のロゴ表示用）
-- ※本マイグレーションは MCP で本番に適用済みだが、ローカルの migrations フォルダに
--   ファイルが残っていなかったため、リモート schema_migrations と一致するよう復元したもの。
--   フロント店舗一覧（storeListDb.ts）が logo_image_url を参照するため、再現性のため必須。

ALTER TABLE public.stores
  ADD COLUMN IF NOT EXISTS logo_image_url text;

-- KOPU29（slug=heijohtei）は白背景ロゴを表示する
UPDATE public.stores
  SET logo_image_url = '/images/store_kopu29.webp'
  WHERE slug = 'heijohtei';
