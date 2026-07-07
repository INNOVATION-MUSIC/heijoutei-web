-- ========================================
-- 平壌亭 CMS — 016 ギフト（ご進物）商品
-- /gift ページの商品カードを管理画面から登録・編集できるようにする。
-- 送料金表・CTA（電話番号）はサイト固定のため静的（giftData.ts）のまま。
-- ========================================
CREATE TABLE public.gift_products (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subtitle      TEXT,               -- 小見出し（金色）
  title         TEXT NOT NULL,      -- 商品名
  price_amount  TEXT,               -- 金額（大きく表示）例: 15,120
  price_note    TEXT,               -- 単位・補足（小さく表示）例: 円 / 500g（本体14,000円）
  image_url     TEXT,               -- 商品写真
  description   TEXT,               -- 説明文（改行可）
  content_label TEXT,               -- 内容ラベル（セット内容 / 額 面 など）
  content       TEXT,               -- 内容（改行可・全角スペースで桁揃え）
  specs         JSONB NOT NULL DEFAULT '[]'::jsonb, -- スペック行 [{label, value}]
  is_short      BOOLEAN NOT NULL DEFAULT false,     -- 写真を低く表示（お食事券など）
  is_active     BOOLEAN NOT NULL DEFAULT true,      -- 公開
  sort_order    INT DEFAULT 0,
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now()
);

CREATE TRIGGER gift_products_updated_at BEFORE UPDATE ON public.gift_products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- RLS: 匿名は公開商品のみ SELECT 可
ALTER TABLE public.gift_products ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public select gift_products" ON public.gift_products;
CREATE POLICY "Public select gift_products" ON public.gift_products FOR SELECT USING (is_active = true);

-- GRANT（MCP作成テーブルは標準権限が自動付与されないため明示付与）
GRANT ALL ON public.gift_products TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.gift_products TO anon, authenticated;

-- 既存の静的4商品をシード
INSERT INTO public.gift_products
  (subtitle, title, price_amount, price_note, image_url, description, content_label, content, specs, is_short, is_active, sort_order)
VALUES
  ('厳選した人気部位をバランスよくセットに', '特選焼肉食べ比べセット', '15,120', '円 / 500g（本体14,000円）',
   '/images/gift_steak_hikaku.webp',
   E'平壌亭の最高級ランクの焼肉を詰め合わせました。厚切りヒレの風味と柔らかさは絶品です。\n大切な方への贈り物におすすめの逸品です。',
   'セット内容',
   E'ヒレ　　　　　　　140g\nサーロイン　　　　140g\n上ロース　　　　　110g\n上カルビ　　　　　110g\n卓上用つけだれ　　100g\n調理用もみだれ　　100g',
   '[{"label":"賞味期限","value":"発送より1ヶ月"},{"label":"外形サイズ","value":"22 × 30 × 7.5cm"},{"label":"発送形態","value":"クール冷凍便"},{"label":"送 料","value":"別途 下記料金表の通り"}]'::jsonb,
   false, true, 1),
  ('肉のプロが厳選した和牛', '和牛焼肉セット', '7,020', '円 / 500g（本体6,500円）',
   '/images/gift_wagyu.webp',
   E'肉の旨みを存分に味わえる、贅沢なセットです。\nカルビの上質な甘み、赤身肉の奥深いコクをご家庭でお楽しみいただけます。',
   'セット内容',
   E'カルビ　　　　　　250g\n赤身肉　　　　　　250g\n卓上用つけだれ　　100g\n調理用もみだれ　　100g',
   '[{"label":"賞味期限","value":"発送より1ヶ月"},{"label":"外形サイズ","value":"22 × 30 × 7.5cm"},{"label":"発送形態","value":"クール冷凍便"},{"label":"送 料","value":"別途 下記料金表の通り"}]'::jsonb,
   false, true, 2),
  ('とろけるようなやわらかさと上品な旨み', 'すき焼き・しゃぶしゃぶ', '6,480', '円 / 500g（本体6,000円）',
   '/images/gift_sukiyaki.webp',
   E'サシがきめ細かく入った肩ロースをすき焼き・しゃぶしゃぶ用に、丁寧にスライスしました。\n特別な日の食卓に、贅沢なひと品を。',
   'セット内容',
   E'肩ロース　　　　　500g',
   '[{"label":"賞味期限","value":"発送より1ヶ月"},{"label":"外形サイズ","value":"22 × 30 × 7.5cm"},{"label":"発送形態","value":"クール冷凍便"},{"label":"送 料","value":"別途 下記料金表の通り"}]'::jsonb,
   false, true, 3),
  ('大切な方への贈り物に', '＜平壌亭＞お食事券', '5,000', '円 / 1,000円',
   '/images/gift_ticket.webp',
   E'贈り物や景品としてなど、さまざまなシーンでご利用いただけます。\n平壌亭各店でご使用になれます。おつりは出ませんのでご了承ください。',
   '額 面',
   '5,000円 / 1,000円',
   '[{"label":"有効期限","value":"なし"}]'::jsonb,
   true, true, 4);
