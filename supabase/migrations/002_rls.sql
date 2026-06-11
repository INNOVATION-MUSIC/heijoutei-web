-- ========================================
-- 平壌亭 CMS — 002 RLS ポリシー
-- 管理画面の DB アクセスは adminSupabase（Service Role）で RLS をバイパスする。
-- 以下は「フロント公開系の SELECT」「フォーム系の INSERT」のみを anon に許可する。
-- ========================================

-- 全テーブルで RLS 有効化
ALTER TABLE public.profiles                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.news                      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.news_tags                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media                     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_messages          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stores                    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_categories           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_menus               ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_items                ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses                   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.takeout_categories        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_takeout_menus       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_takeout_menu_stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.takeout_slots             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.takeout_slot_times        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.takeout_orders            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.takeout_order_items       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recruitments              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recruitment_tags          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recruitment_details       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_calendars        ENABLE ROW LEVEL SECURITY;

-- フロント公開系（認証不要で SELECT 可）
DROP POLICY IF EXISTS "Public select news"              ON public.news;
CREATE POLICY "Public select news"                      ON public.news FOR SELECT USING (is_published = true);
DROP POLICY IF EXISTS "Public select news_tags"         ON public.news_tags;
CREATE POLICY "Public select news_tags"                 ON public.news_tags FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public select stores"            ON public.stores;
CREATE POLICY "Public select stores"                    ON public.stores FOR SELECT USING (is_active = true);
DROP POLICY IF EXISTS "Public select menu_categories"   ON public.menu_categories;
CREATE POLICY "Public select menu_categories"           ON public.menu_categories FOR SELECT USING (is_active = true);
DROP POLICY IF EXISTS "Public select store_menus"       ON public.store_menus;
CREATE POLICY "Public select store_menus"               ON public.store_menus FOR SELECT USING (is_active = true);
DROP POLICY IF EXISTS "Public select menu_items"        ON public.menu_items;
CREATE POLICY "Public select menu_items"                ON public.menu_items FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public select courses"           ON public.courses;
CREATE POLICY "Public select courses"                   ON public.courses FOR SELECT USING (is_active = true);
DROP POLICY IF EXISTS "Public select takeout_categories" ON public.takeout_categories;
CREATE POLICY "Public select takeout_categories"        ON public.takeout_categories FOR SELECT USING (is_active = true);
DROP POLICY IF EXISTS "Public select store_takeout_menus" ON public.store_takeout_menus;
CREATE POLICY "Public select store_takeout_menus"       ON public.store_takeout_menus FOR SELECT USING (is_active = true);
DROP POLICY IF EXISTS "Public select store_takeout_menu_stores" ON public.store_takeout_menu_stores;
CREATE POLICY "Public select store_takeout_menu_stores" ON public.store_takeout_menu_stores FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public select takeout_slots"     ON public.takeout_slots;
CREATE POLICY "Public select takeout_slots"             ON public.takeout_slots FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public select takeout_slot_times" ON public.takeout_slot_times;
CREATE POLICY "Public select takeout_slot_times"        ON public.takeout_slot_times FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public select recruitments"      ON public.recruitments;
CREATE POLICY "Public select recruitments"              ON public.recruitments FOR SELECT USING (is_published = true);
DROP POLICY IF EXISTS "Public select recruitment_tags"  ON public.recruitment_tags;
CREATE POLICY "Public select recruitment_tags"          ON public.recruitment_tags FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public select recruitment_details" ON public.recruitment_details;
CREATE POLICY "Public select recruitment_details"       ON public.recruitment_details FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public select media"             ON public.media;
CREATE POLICY "Public select media"                     ON public.media FOR SELECT USING (true);

-- 営業カレンダーは誰でも SELECT 可
DROP POLICY IF EXISTS "Public select business_calendars" ON public.business_calendars;
CREATE POLICY "Public select business_calendars"
  ON public.business_calendars FOR SELECT USING (true);

-- テイクアウト注文は誰でも INSERT 可
DROP POLICY IF EXISTS "Public insert takeout_orders"    ON public.takeout_orders;
CREATE POLICY "Public insert takeout_orders"            ON public.takeout_orders FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Public insert takeout_order_items" ON public.takeout_order_items;
CREATE POLICY "Public insert takeout_order_items"       ON public.takeout_order_items FOR INSERT WITH CHECK (true);

-- お問い合わせも誰でも INSERT 可
DROP POLICY IF EXISTS "Public insert contact_messages"  ON public.contact_messages;
CREATE POLICY "Public insert contact_messages"          ON public.contact_messages FOR INSERT WITH CHECK (true);
