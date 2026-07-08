-- ========================================
-- 平壌亭 CMS — 017 ギフト送料金表
-- /gift の送料金表を管理画面から編集できるようにする。
-- ========================================
CREATE TABLE public.gift_shipping_areas (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  region      TEXT NOT NULL,                    -- 地域名（例: 北海道）
  prefectures TEXT[] NOT NULL DEFAULT '{}',     -- 都道府県（縦積み）
  fee         TEXT,                             -- 送料（例: 1,970）
  sort_order  INT DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()
);

CREATE TRIGGER gift_shipping_areas_updated_at BEFORE UPDATE ON public.gift_shipping_areas
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- RLS: 匿名も全件 SELECT 可（公開の送料表）
ALTER TABLE public.gift_shipping_areas ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public select gift_shipping_areas" ON public.gift_shipping_areas;
CREATE POLICY "Public select gift_shipping_areas" ON public.gift_shipping_areas FOR SELECT USING (true);

-- GRANT（MCP作成テーブルは明示付与）
GRANT ALL ON public.gift_shipping_areas TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.gift_shipping_areas TO anon, authenticated;

-- 既存の静的12地域をシード
INSERT INTO public.gift_shipping_areas (region, prefectures, fee, sort_order) VALUES
  ('北海道', ARRAY['北海道'], '1,970', 1),
  ('北東北', ARRAY['青森県','秋田県','岩手県'], '1,530', 2),
  ('南東北', ARRAY['宮城県','山形県','福島県'], '1,420', 3),
  ('関東', ARRAY['茨城県','栃木県','群馬県','埼玉県','千葉県','神奈川県','東京都','山梨県'], '1,310', 4),
  ('信越', ARRAY['新潟県','長野県'], '1,200', 5),
  ('中部', ARRAY['静岡県','愛知県','三重県','岐阜県'], '1,200', 6),
  ('北陸', ARRAY['富山県','石川県','福井県'], '1,200', 7),
  ('関西', ARRAY['大阪府','京都府','滋賀県','奈良県','和歌山県','兵庫県'], '980', 8),
  ('中国', ARRAY['岡山県','広島県','山口県','鳥取県','島根県'], '1,200', 9),
  ('四国', ARRAY['香川県','徳島県','愛媛県','高知県'], '1,200', 10),
  ('九州', ARRAY['福岡県','佐賀県','長崎県','熊本県','大分県','宮崎県','鹿児島県'], '1,310', 11),
  ('沖縄', ARRAY['沖縄県'], '1,640', 12);
