-- ========================================
-- 平壌亭 CMS — 001 初期スキーマ
-- update_updated_at トリガー関数（共通）
-- ========================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- 1. ユーザープロファイル
-- ========================================
CREATE TABLE public.profiles (
  id         UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name  TEXT,
  avatar_url TEXT,
  role       TEXT NOT NULL DEFAULT 'editor' CHECK (role IN ('admin', 'editor')),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ========================================
-- 2. お知らせ
-- ========================================
CREATE TABLE public.news (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title         TEXT NOT NULL,
  slug          TEXT NOT NULL UNIQUE,
  body          TEXT,
  thumbnail_url TEXT,
  is_published  BOOLEAN DEFAULT false,
  published_at  TIMESTAMPTZ,
  created_by    UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX news_slug_idx ON public.news(slug);
CREATE TRIGGER news_updated_at BEFORE UPDATE ON public.news
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TABLE public.news_tags (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  news_id    UUID NOT NULL REFERENCES public.news(id) ON DELETE CASCADE,
  label      TEXT NOT NULL,
  color      TEXT NOT NULL DEFAULT 'green',
  sort_order INT DEFAULT 0
);

-- ========================================
-- 3. メディア
-- ========================================
CREATE TABLE public.media (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  filename    TEXT NOT NULL,
  url         TEXT NOT NULL,
  size        BIGINT,
  mime_type   TEXT,
  uploaded_by UUID REFERENCES auth.users(id),
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- ========================================
-- 4. お問い合わせ
-- ========================================
CREATE TABLE public.contact_messages (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT NOT NULL,
  kana       TEXT,
  email      TEXT NOT NULL,
  phone      TEXT,
  subject    TEXT,
  message    TEXT NOT NULL,
  is_read    BOOLEAN DEFAULT false,
  read_at    TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ========================================
-- 5. 店舗マスタ
-- ========================================
CREATE TABLE public.stores (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name                TEXT NOT NULL,
  slug                TEXT NOT NULL UNIQUE,
  name_en             TEXT,
  address             TEXT,
  phone               TEXT,
  business_hours      TEXT,
  closed_days         TEXT,
  access              TEXT,
  description         TEXT,
  seat_count          TEXT,
  seat_description    TEXT,
  hero_image_url      TEXT,
  gallery_image_urls  TEXT[] DEFAULT '{}',
  line_id             TEXT,
  google_map_url      TEXT,
  is_active           BOOLEAN DEFAULT true,
  is_coming_soon      BOOLEAN DEFAULT false,
  sort_order          INT DEFAULT 0,
  created_at          TIMESTAMPTZ DEFAULT now(),
  updated_at          TIMESTAMPTZ DEFAULT now()
);
CREATE TRIGGER stores_updated_at BEFORE UPDATE ON public.stores
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ========================================
-- 6. メニューカテゴリマスタ
-- ========================================
CREATE TABLE public.menu_categories (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT NOT NULL,
  slug       TEXT NOT NULL UNIQUE,
  is_active  BOOLEAN DEFAULT true,
  sort_order INT DEFAULT 0
);

-- ========================================
-- 7. 店舗メニュー
-- ========================================
CREATE TABLE public.store_menus (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id           UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  category_id        UUID REFERENCES public.menu_categories(id) ON DELETE SET NULL,
  section_title      TEXT,
  has_detail_page    BOOLEAN DEFAULT false,
  detail_slug        TEXT,
  detail_image_url   TEXT,
  detail_description TEXT,
  is_active          BOOLEAN DEFAULT true,
  sort_order         INT DEFAULT 0,
  created_at         TIMESTAMPTZ DEFAULT now(),
  updated_at         TIMESTAMPTZ DEFAULT now()
);
CREATE TRIGGER store_menus_updated_at BEFORE UPDATE ON public.store_menus
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TABLE public.menu_items (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_menu_id UUID NOT NULL REFERENCES public.store_menus(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  description   TEXT,
  image_url     TEXT,
  price_label   TEXT,
  sort_order    INT DEFAULT 0
);

-- ========================================
-- 8. コース（店舗別・カード一覧完結）
-- ========================================
CREATE TABLE public.courses (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id    UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  type_label  TEXT,
  price_label TEXT,
  description TEXT,
  notes       TEXT,
  image_url   TEXT,
  is_active   BOOLEAN DEFAULT true,
  sort_order  INT DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()
);
CREATE TRIGGER courses_updated_at BEFORE UPDATE ON public.courses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ========================================
-- 9. テイクアウトカテゴリマスタ
-- ========================================
CREATE TABLE public.takeout_categories (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT NOT NULL,
  slug       TEXT NOT NULL UNIQUE,
  is_active  BOOLEAN DEFAULT true,
  sort_order INT DEFAULT 0
);

-- ========================================
-- 10. テイクアウトメニュー（店舗×カテゴリ）
-- ========================================
CREATE TABLE public.store_takeout_menus (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID REFERENCES public.takeout_categories(id) ON DELETE SET NULL,
  name        TEXT NOT NULL,
  description TEXT,
  image_url   TEXT,
  price       INT NOT NULL,
  is_active   BOOLEAN DEFAULT true,
  sort_order  INT DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()
);
CREATE TRIGGER takeout_menus_updated_at BEFORE UPDATE ON public.store_takeout_menus
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- テイクアウトメニューと店舗の中間テーブル（複数店舗対応）
CREATE TABLE public.store_takeout_menu_stores (
  takeout_menu_id UUID NOT NULL REFERENCES public.store_takeout_menus(id) ON DELETE CASCADE,
  store_id        UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  PRIMARY KEY (takeout_menu_id, store_id)
);

-- ========================================
-- 11. テイクアウト受付枠
-- ========================================
CREATE TABLE public.takeout_slots (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id         UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  available_date   DATE NOT NULL,
  default_capacity INT NOT NULL DEFAULT 5,
  is_closed        BOOLEAN DEFAULT false,
  created_at       TIMESTAMPTZ DEFAULT now(),
  updated_at       TIMESTAMPTZ DEFAULT now(),
  UNIQUE (store_id, available_date)
);
CREATE TRIGGER takeout_slots_updated_at BEFORE UPDATE ON public.takeout_slots
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TABLE public.takeout_slot_times (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slot_id    UUID NOT NULL REFERENCES public.takeout_slots(id) ON DELETE CASCADE,
  time_label TEXT NOT NULL,
  capacity   INT NOT NULL DEFAULT 5,
  is_active  BOOLEAN DEFAULT true,
  sort_order INT DEFAULT 0
);

-- ========================================
-- 12. 営業カレンダー（Business days / 亀岡本店固定）
-- ========================================
CREATE TABLE public.business_calendars (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id   UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  date       DATE NOT NULL,
  status     TEXT NOT NULL DEFAULT 'open'
             CHECK (status IN ('open','closed','special_closed','limited')),
  note       TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (store_id, date)
);
CREATE TRIGGER business_calendars_updated_at
  BEFORE UPDATE ON public.business_calendars
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ========================================
-- 13. テイクアウト注文
-- ========================================
CREATE TABLE public.takeout_orders (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id       UUID NOT NULL REFERENCES public.stores(id) ON DELETE RESTRICT,
  slot_id        UUID REFERENCES public.takeout_slots(id) ON DELETE SET NULL,
  pickup_date    DATE NOT NULL,
  pickup_time    TEXT NOT NULL,
  customer_name  TEXT NOT NULL,
  customer_kana  TEXT,
  customer_email TEXT NOT NULL,
  customer_phone TEXT,
  customer_note  TEXT,
  total_price    INT NOT NULL,
  status         TEXT NOT NULL DEFAULT 'pending'
                 CHECK (status IN ('pending','confirmed','cancelled','completed')),
  is_read        BOOLEAN DEFAULT false,
  read_at        TIMESTAMPTZ,
  created_at     TIMESTAMPTZ DEFAULT now(),
  updated_at     TIMESTAMPTZ DEFAULT now()
);
CREATE TRIGGER takeout_orders_updated_at BEFORE UPDATE ON public.takeout_orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TABLE public.takeout_order_items (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id        UUID NOT NULL REFERENCES public.takeout_orders(id) ON DELETE CASCADE,
  takeout_menu_id UUID REFERENCES public.store_takeout_menus(id) ON DELETE SET NULL,
  item_name       TEXT NOT NULL,
  price           INT NOT NULL,
  quantity        INT NOT NULL DEFAULT 1
);

-- ========================================
-- 14. 採用情報
-- ========================================
CREATE TABLE public.recruitments (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id     UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  title        TEXT NOT NULL,
  image_url    TEXT,
  body         TEXT,
  is_published BOOLEAN DEFAULT false,
  published_at TIMESTAMPTZ,
  sort_order   INT DEFAULT 0,
  created_at   TIMESTAMPTZ DEFAULT now(),
  updated_at   TIMESTAMPTZ DEFAULT now()
);
CREATE TRIGGER recruitments_updated_at BEFORE UPDATE ON public.recruitments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TABLE public.recruitment_tags (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recruitment_id UUID NOT NULL REFERENCES public.recruitments(id) ON DELETE CASCADE,
  label          TEXT NOT NULL,
  color          TEXT NOT NULL DEFAULT 'green',
  sort_order     INT DEFAULT 0
);

CREATE TABLE public.recruitment_details (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recruitment_id UUID NOT NULL REFERENCES public.recruitments(id) ON DELETE CASCADE,
  label          TEXT NOT NULL,
  value          TEXT NOT NULL,
  sort_order     INT DEFAULT 0
);
