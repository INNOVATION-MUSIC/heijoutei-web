# 平壊亭 CMS 管理画面 — Cursor 依頼文

---

## 事前確認事項（Cursorに渡す前に手元で準備）

- [ ] 既存フロントのディレクトリ構成をこの依頼文の末尾に追記する
- [ ] Supabase プロジェクトを作成済みであること
- [ ] `.env.local` に `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` / `SUPABASE_SERVICE_ROLE_KEY` を設定済みであること

---

## Cursor への依頼文（そのままペースト）

```
# 平壊亭 CMS 管理画面の追加実装

nextjs-cms スキルを参考にして、既存の Next.js フロントに管理画面と
Supabase 連携を追加してください。

---

## 前提・制約

### やること
- `/app/admin` 以下に管理画面を新規追加する
- Supabase との DB 連携（下記マイグレーション SQL を使用）
- 既存フロントの動的データ取得への切り替え
- 管理画面でのデータ更新後、フロントのキャッシュを revalidatePath で即時クリア

### やらないこと（重要）
- `/app` 以下の既存フロントページのデザイン・レイアウトは一切変更しない
- 既存の共通コンポーネント（Header / Footer 等）は変更前に差分を提示してから適用すること
- スキルが生成するフロントページ（news / blog / about / services / team / contact）は不要

### 既存プロジェクト構成

```
.
├── next.config.ts
├── package.json
├── postcss.config.mjs
├── public
│   └── images
│       └── （各種 .webp / .jpg / .svg 画像ファイル）
├── src
│   └── app
│       ├── about/page.tsx
│       ├── api
│       │   ├── contact/
│       │   └── takeout/
│       ├── components
│       │   ├── AboutClient.tsx / AboutSection.tsx
│       │   ├── CalendarSection.tsx
│       │   ├── ContactClient.tsx
│       │   ├── CourseSection.tsx
│       │   ├── Footer.tsx
│       │   ├── HeroSection.tsx
│       │   ├── MenuCategoryClient.tsx / MenuCategorySection.tsx
│       │   ├── MenuCourseClient.tsx / MenuCourseSection.tsx
│       │   ├── MenuDetailClient.tsx / MenuDetailSection.tsx
│       │   ├── MenuLunchClient.tsx / MenuLunchSection.tsx
│       │   ├── MenuTakeoutClient.tsx / MenuTakeoutSection.tsx
│       │   ├── NewsDetailClient.tsx / NewsDetailSection.tsx
│       │   ├── NewsListClient.tsx / NewsListSection.tsx
│       │   ├── NewsSection.tsx
│       │   ├── RecruitDetailClient.tsx / RecruitDetailSection.tsx
│       │   ├── RecruitListClient.tsx / RecruitListSection.tsx
│       │   ├── StoreDetailClient.tsx / StoreDetailSection.tsx
│       │   ├── StoreListClient.tsx / StoreListSection.tsx
│       │   ├── sp/           ← SP専用コンポーネント
│       │   └── takeout/      ← テイクアウト関連コンポーネント
│       ├── contact/page.tsx
│       ├── globals.css
│       ├── layout.tsx
│       ├── lib
│       │   ├── contactData.ts
│       │   ├── contactMail.ts
│       │   ├── menuData.ts
│       │   ├── menuPhotos.ts
│       │   ├── navLinks.ts
│       │   ├── newsData.ts
│       │   ├── recruitData.ts
│       │   ├── storeDetailData.ts
│       │   ├── takeoutData.ts
│       │   └── takeoutMail.ts
│       ├── menu
│       │   ├── [category]/
│       │   ├── course/
│       │   ├── lunch/
│       │   ├── takeout/
│       │   └── page.tsx
│       ├── news
│       │   ├── [id]/
│       │   └── page.tsx
│       ├── page.tsx           ← トップページ
│       ├── recruit
│       │   ├── [id]/
│       │   └── page.tsx
│       ├── store
│       │   ├── [id]/
│       │   └── page.tsx
│       └── takeout/page.tsx
└── tsconfig.json
```

#### 既存構成から読み取れる重要な情報

- データは現在 `src/app/lib/` 以下の静的 `.ts` ファイルで管理されている
  （menuData.ts / newsData.ts / recruitData.ts / storeDetailData.ts / takeoutData.ts 等）
- フロントの動的切り替えは、これらの静的データファイルを Supabase クエリに置き換える形で実施すること
- `components/sp/` にSP専用コンポーネントが存在するため、レスポンシブ対応は既存の構造を維持すること
- `api/contact/` と `api/takeout/` にRoute Handlerが既存。テイクアウト注文・お問い合わせは既存のRoute Handlerをベースに Supabase INSERT に切り替えること
- メニューは `menu/[category]/` `menu/course/` `menu/lunch/` `menu/takeout/` と既にルート分割済み
- カレンダーは `components/CalendarSection.tsx` として既存実装あり。Business days の動的化はこのコンポーネントのデータ取得部分のみ切り替えること
- 画像は `public/images/` にローカル保存済み。Supabase Storage への移行は不要（管理画面からの新規アップロード分のみ Storage を使用）

---

## DB マイグレーション

以下の SQL を Supabase SQL Editor で順に実行してください。
ファイルは `supabase/migrations/` に配置してください。

### 001_initial.sql

-- ========================================
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
-- 1. ユーザープロファイル (スキルそのまま)
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
-- 2. お知らせ (スキルの posts を news に特化)
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
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  news_id       UUID NOT NULL REFERENCES public.news(id) ON DELETE CASCADE,
  label         TEXT NOT NULL,
  color         TEXT NOT NULL DEFAULT 'green',
  sort_order    INT DEFAULT 0
);

-- ========================================
-- 3. メディア (スキルそのまま)
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
-- 4. お問い合わせ (スキルそのまま)
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
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id        UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  category_id     UUID REFERENCES public.menu_categories(id) ON DELETE SET NULL,
  section_title   TEXT,
  has_detail_page BOOLEAN DEFAULT false,
  detail_slug     TEXT,
  detail_image_url TEXT,
  detail_description TEXT,
  is_active       BOOLEAN DEFAULT true,
  sort_order      INT DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);
CREATE TRIGGER store_menus_updated_at BEFORE UPDATE ON public.store_menus
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TABLE public.menu_items (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_menu_id  UUID NOT NULL REFERENCES public.store_menus(id) ON DELETE CASCADE,
  name           TEXT NOT NULL,
  description    TEXT,
  image_url      TEXT,
  price_label    TEXT,
  sort_order     INT DEFAULT 0
);

-- ========================================
-- 8. コース（店舗別・カード一覧完結）
-- ========================================
CREATE TABLE public.courses (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id         UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  name             TEXT NOT NULL,
  type_label       TEXT,
  price_label      TEXT,
  description      TEXT,
  notes            TEXT,
  image_url        TEXT,
  is_active        BOOLEAN DEFAULT true,
  sort_order       INT DEFAULT 0,
  created_at       TIMESTAMPTZ DEFAULT now(),
  updated_at       TIMESTAMPTZ DEFAULT now()
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
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id          UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  available_date    DATE NOT NULL,
  default_capacity  INT NOT NULL DEFAULT 5,
  is_closed         BOOLEAN DEFAULT false,
  created_at        TIMESTAMPTZ DEFAULT now(),
  updated_at        TIMESTAMPTZ DEFAULT now(),
  UNIQUE (store_id, available_date)
);
CREATE TRIGGER takeout_slots_updated_at BEFORE UPDATE ON public.takeout_slots
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TABLE public.takeout_slot_times (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slot_id      UUID NOT NULL REFERENCES public.takeout_slots(id) ON DELETE CASCADE,
  time_label   TEXT NOT NULL,
  capacity     INT NOT NULL DEFAULT 5,
  is_active    BOOLEAN DEFAULT true,
  sort_order   INT DEFAULT 0
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
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id        UUID NOT NULL REFERENCES public.stores(id) ON DELETE RESTRICT,
  slot_id         UUID REFERENCES public.takeout_slots(id) ON DELETE SET NULL,
  pickup_date     DATE NOT NULL,
  pickup_time     TEXT NOT NULL,
  customer_name   TEXT NOT NULL,
  customer_kana   TEXT,
  customer_email  TEXT NOT NULL,
  customer_phone  TEXT,
  customer_note   TEXT,
  total_price     INT NOT NULL,
  status          TEXT NOT NULL DEFAULT 'pending'
                  CHECK (status IN ('pending','confirmed','cancelled','completed')),
  is_read         BOOLEAN DEFAULT false,
  read_at         TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
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
-- 13. 採用情報
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


### 002_rls.sql

-- 全テーブルで RLS 有効化
ALTER TABLE public.profiles              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.news                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.news_tags             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_messages      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stores                ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_categories       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_menus           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_items            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses               ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.takeout_categories    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_takeout_menus   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_takeout_menu_stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.takeout_slots         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.takeout_slot_times    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.takeout_orders        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.takeout_order_items   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recruitments          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recruitment_tags      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recruitment_details   ENABLE ROW LEVEL SECURITY;

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
ALTER TABLE public.business_calendars ENABLE ROW LEVEL SECURITY;
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

-- 管理者は全テーブルに対して全操作可（adminSupabase = Service Role で RLS バイパス）
-- 管理画面の Server Component / Server Action は必ず adminSupabase を使うこと


### 003_seed.sql

-- 店舗シードデータ
INSERT INTO public.stores (name, slug, name_en, sort_order, is_active) VALUES
  ('平壊亭 亀岡店',   'kameoka',   'HEIJOHTEI KAMEOKA',   1, true),
  ('平壊亭 園部店',   'sonobe',    'HEIJOHTEI SONOBE',    2, true),
  ('平壊亭 福知山店', 'fukuchiyama','HEIJOHTEI FUKUCHIYAMA',3, true),
  ('焼肉ゆらの',      'yurano',    'YAKINIKU YURANO',     4, true),
  ('ヘイジョウテイ',  'heijohtei', 'HEIJOHTEI',           5, false);

-- 通常メニューカテゴリ
INSERT INTO public.menu_categories (name, slug, sort_order) VALUES
  ('名物',                 'meibutsu',  1),
  ('肉',                   'niku',      2),
  ('ホルモン',             'horumon',   3),
  ('セット',               'set',       4),
  ('焼き物',               'yakimono',  5),
  ('逸品',                 'ippin',     6),
  ('サラダ・キムチ・ナムル','salad',     7),
  ('スープ',               'soup',      8),
  ('ご飯',                 'gohan',     9),
  ('麺類',                 'men',      10),
  ('デザート',             'dessert',  11),
  ('ランチ',               'lunch',    12);

-- テイクアウトカテゴリ
INSERT INTO public.takeout_categories (name, slug, sort_order) VALUES
  ('焼肉弁当',           'bento',       1),
  ('お惣菜',             'sozai',       2),
  ('お家で焼肉セット',   'home-set',    3),
  ('BBQセット',          'bbq',         4),
  ('ご飯物・一品料理',   'gohan-ippin', 5),
  ('焼肉単品',           'tanpin',      6),
  ('焼肉盛合わせ',       'moriawase',   7);

---

## 管理画面の実装仕様

### ディレクトリ構成（追加分のみ）

/app/admin/
  layout.tsx                        ← サイドバーレイアウト
  page.tsx                          ← ダッシュボード
  login/page.tsx                    ← ログイン
  news/
    page.tsx                        ← お知らせ一覧
    new/page.tsx                    ← 新規作成
    [id]/edit/page.tsx              ← 編集
  stores/
    page.tsx                        ← 店舗一覧
    new/page.tsx
    [id]/edit/page.tsx
  menus/
    page.tsx                        ← メニュー一覧（店舗×カテゴリ）
    new/page.tsx
    [id]/edit/page.tsx
  courses/
    page.tsx
    new/page.tsx
    [id]/edit/page.tsx
  takeout-menus/
    page.tsx
    new/page.tsx
    [id]/edit/page.tsx
  takeout-slots/
    page.tsx                        ← カレンダーUI
  takeout-orders/
    page.tsx                        ← 注文受付一覧（既読管理）
  recruitments/
    page.tsx
    new/page.tsx
    [id]/edit/page.tsx
  contact/
    page.tsx                        ← お問い合わせ一覧（既読管理）
  business-calendar/
    page.tsx                        ← 営業カレンダー管理（亀岡本店固定）
  settings/
    categories/page.tsx             ← メニュー・テイクアウトカテゴリ管理
  users/
    page.tsx
    new/page.tsx
  media/
    page.tsx

/components/admin/
  Sidebar.tsx                       ← サイドメニュー方式（下記仕様参照）
  TopBar.tsx
  RichTextEditor.tsx                ← TipTap（お知らせ本文）
  ImageUploader.tsx
  DraggableCategoryTable.tsx        ← カテゴリのドラッグ並び替え
  TakeoutCalendar.tsx               ← カレンダーUI（'use client'）
  BusinessCalendar.tsx              ← 営業カレンダーUI（'use client'）
  RecruitmentDetailTable.tsx        ← 採用詳細表（行追加・削除）
  MarkReadButton.tsx                ← 既読ボタン（'use client'）

/lib/actions/
  news.ts
  stores.ts
  menus.ts
  courses.ts
  takeout-menus.ts
  takeout-slots.ts
  takeout-orders.ts
  recruitments.ts
  contact.ts
  categories.ts
  business-calendar.ts
  users.ts
  media.ts

### サイドバー構成

スキルの references/admin.md のサイドバーをベースに、
以下のメニュー構成でサイドメニュー方式（左固定サイドバー）で実装すること。
カード型ナビは使わない。

【メイン】
- ダッシュボード

【コンテンツ】
- お知らせ
- 店舗
- メニュー
- コース
- 営業カレンダー

【テイクアウト】
- テイクアウトメニュー
- 受付枠管理（カレンダーUI）
- 注文受付（未読バッジ表示）

【採用・問い合わせ】
- 採用情報
- お問い合わせ（未読バッジ表示）

【システム】
- カテゴリ管理
- メディア
- ユーザー管理

未読バッジ（注文受付・お問い合わせ）はダッシュボードの
Server Component でカウントを取得してサイドバーに渡す。

### ダッシュボード

- 未読注文数 / 本日の注文件数・合計金額 / 未読問い合わせ数 / 公開中コンテンツ数
- 最新の注文・問い合わせ一覧（未読は青ドット）
- 最近のお知らせ一覧（公開/下書きバッジ）

### お知らせ管理

スキルの posts 管理をベースに以下を変更：
- type 区別（blog/news）は不要。news テーブル単体を使う
- タグは news_tags テーブルで複数管理（カラー付き）
- 本文は TipTap リッチテキストエディタ
- 公開/下書き/予約公開に対応

### 店舗管理

- 基本情報（名前・スラッグ・住所・電話・営業時間・定休日・座席数・アクセス・LINE ID・Google マップ URL）
- ヒーロー画像・ギャラリー画像（複数）
- 公開フラグ・Coming Soon フラグ・表示順
- 店舗を追加すると、メニュー・テイクアウト・採用・受付枠の
  プルダウン・タブ・チップに自動反映される（stores テーブルが単一マスタ）
- 店舗更新時は以下をキャッシュクリア：
  revalidatePath('/') revalidatePath('/stores') revalidatePath('/menu') 等

### メニュー管理

- 店舗プルダウン + カテゴリプルダウンで絞り込み
- メニュー項目（name / description / price_label / image_url）を行で追加・削除
- カテゴリのタブ表示は sort_order 順に並び、10件以上は2段になる
  （フロント側で自動折り返し。管理画面での特別対応は不要）
- ランチは menu_categories の slug='lunch' として通常メニューと同じ仕組みで管理
- カテゴリ一覧ページ下部に表示するランチ・テイクアウト・コースの誘導バナーは
  store_menus の has_detail_page=true のレコードで画像・説明文を管理する
- 更新時 revalidatePath('/menu') / revalidatePath('/menu/[store slug]')

### コース管理

- 店舗別
- 一覧カード用画像 / コース種別ラベル（「野菜とヘルシーなコース」等）/ コース名 / 価格表示（¥8,500〜）
- 説明文 / 注意事項（ページ下部に共通表示）
- 詳細ページへの遷移は不要。カード一覧で完結するデザインのため slug 不要
- 更新時 revalidatePath('/menu') / revalidatePath('/menu/[store slug]/course')

### テイクアウトメニュー管理

- カテゴリプルダウン
- 取り扱い店舗チップ（複数選択） → store_takeout_menu_stores 中間テーブルに保存
- 価格は数値（INT）で入力 → 表示時は「1,700円」に自動フォーマット
- 注文画面プレビューを表示

### テイクアウト受付枠管理（カレンダーUI）

TakeoutCalendar.tsx を 'use client' で実装。

- 上部タブで店舗を切り替え
- 左：月カレンダー（受付あり=緑ドット / 停止=赤ドット / 未設定=ドットなし）
- 右：選択した日の時間枠設定パネル
  - 時間枠チップ（クリックで受付ON/OFF）
  - 「全枠を開く」「全枠を停止」「この日を受付停止」ボタン
  - 定員の一括変更
- 下部：デフォルト設定（受付時間帯 / 1枠あたり定員 / 定休曜日）
- 保存ボタンで takeout_slots / takeout_slot_times を upsert

### テイクアウト注文受付

スキルの contact 管理と同じ構造で実装：
- 上部：未読件数 / 本日の注文件数・合計金額
- 店舗フィルター（チップ）
- 一覧：未読は青ラインと青ドット / クリックで詳細パネルを表示
- 既読にする ボタン（MarkReadButton.tsx = 'use client'）
- 注文詳細：受取日時 / 注文メニュー一覧 / 購入者情報

### 採用管理

- 店舗プルダウン
- タグ（色付き・複数）
- 求人詳細表：label / value の行を自由に追加・削除（RecruitmentDetailTable.tsx = 'use client'）
- 本文テキストエリア（プレーンテキスト）
- 画像アップロード
- 公開/非公開

### お問い合わせ管理

スキルの contact 管理をそのまま流用：
- 既読/未読バッジ、一覧、詳細パネル、既読切替
- phone フィールドも表示

### 営業カレンダー管理

BusinessCalendar.tsx を 'use client' で実装。

- 対象店舗：亀岡店（本店）固定。store_id は stores.slug = 'kameoka' で取得
- テイクアウト受付枠カレンダーと同じUIパターンで実装
  - 左：月カレンダー（前後ナビで月切り替え）
  - 右：選択した日のステータス設定パネル
    - ステータス選択（open / closed / special_closed / limited）
    - 備考テキスト入力（「ランチのみ」「貸切」等）
  - 凡例表示（通常営業 / 定休日 / 臨時休業 / 時短・特別営業）
- 一括設定として「毎週○曜日を定休日に設定」ボタンを用意
- 保存ボタンで business_calendars を upsert
- 更新時は revalidatePath('/') でトップページのキャッシュをクリア

ステータスとフロント表示の対応：
- open           → 通常表示（デザイン通り）
- closed         → 定休日（× 表示）
- special_closed → 臨時休業（△ 表示）
- limited        → 時短・特別営業（○ 表示）

### カテゴリ管理（設定 > カテゴリ管理）

通常メニュー / テイクアウト のタブで切り替え：
- カテゴリ名 / スラッグ / 表示ON/OFF / 表示順（ドラッグ並び替え）
- 行追加・削除
- カテゴリ削除時、紐づくメニューが存在する場合は警告を表示

DraggableCategoryTable.tsx を 'use client' で実装（@dnd-kit/core 使用）。

---

## フロント側の動的データ切り替え

### 基本方針

既存の静的フロントを動的データ取得に切り替える。
レイアウト・デザインは一切変更しないこと。
データ取得部分のみ Supabase に切り替える。

#### 切り替えの具体的な方法
- `src/app/lib/` 以下の静的データファイル（menuData.ts / newsData.ts 等）を
  Supabase クエリに置き換える
- 各 Section コンポーネントへのデータの渡し方は既存の props 構造を維持すること
- `api/contact/` と `api/takeout/` の既存 Route Handler は
  Supabase INSERT に切り替えるだけでよい（新規作成不要）
- `components/sp/` のSP専用コンポーネントは変更しないこと
- 既存の画像（public/images/）はそのまま使用。
  新規アップロード分のみ Supabase Storage の URL を参照する

### ISR（revalidate）設定

export const revalidate = 60 を各ページに設定。
管理画面での更新時は revalidatePath で即時クリア。

### 各ページの切り替え対象

#### トップページ（src/app/page.tsx）
- NewsSection.tsx → news テーブルから最新3〜5件取得
- CourseSection.tsx → courses テーブルから取得
- StoreSection.tsx → stores テーブルから取得
- CalendarSection.tsx → business_calendars テーブルから当月・翌月分を取得
  - 表示店舗：亀岡店（stores.slug = 'kameoka'）固定
  - status に応じた日付スタイル切り替え（デザイン通り）
  - note がある場合はツールチップまたは凡例で表示

#### お知らせ一覧（src/app/news/page.tsx）
- NewsListSection.tsx / NewsListClient.tsx のデータを
  lib/newsData.ts から Supabase クエリに切り替え
- news テーブル + news_tags テーブルを別クエリで取得

#### お知らせ詳細（src/app/news/[id]/page.tsx）
- NewsDetailSection.tsx / NewsDetailClient.tsx のデータを切り替え
- generateStaticParams で全 id（slug）を事前生成（createStaticClient 使用）
- 本文は TipTap で保存した HTML をそのまま表示

#### 店舗一覧（src/app/store/page.tsx）
- StoreListSection.tsx / StoreListClient.tsx のデータを
  lib/storeDetailData.ts から Supabase クエリに切り替え
- stores テーブルから is_active=true を取得・sort_order 順

#### 店舗詳細（src/app/store/[id]/page.tsx）
- StoreDetailSection.tsx / StoreDetailClient.tsx のデータを切り替え
- stores テーブル + LINE ID / Google Map URL も使用

#### メニュー（src/app/menu/）

既存コンポーネント構成：
- MenuCategorySection.tsx / MenuCategoryClient.tsx → カテゴリ一覧画面
- MenuDetailSection.tsx / MenuDetailClient.tsx → カテゴリ詳細画面
- MenuLunchSection.tsx / MenuLunchClient.tsx → ランチメニュー画面
- MenuTakeoutSection.tsx / MenuTakeoutClient.tsx → テイクアウトメニュー画面
- MenuCourseSection.tsx / MenuCourseClient.tsx → コースメニュー画面
- lib/menuData.ts のデータをすべて Supabase クエリに切り替え

店舗タブ → stores テーブルから動的生成

【カテゴリ一覧画面 src/app/menu/page.tsx】
- 上部：menu_categories のバナーグリッド（通常カテゴリ・sort_order 順）
- 下部：ランチ / テイクアウト / コース の誘導バナー3枚を縦並びで表示
  store_menus の has_detail_page=true レコードから画像・説明文を取得
  - ランチバナー       → /menu/lunch へ遷移
  - テイクアウトバナー → /takeout へ遷移
  - コースバナー       → /menu/course へ遷移

【カテゴリ詳細画面 src/app/menu/[category]/page.tsx】
- カテゴリタブは menu_categories を sort_order 順に表示
  タブが多い場合は2段に折り返す（CSS flex-wrap で対応。デザイン通り）
- 選択カテゴリの store_menus → menu_items を別クエリで取得して表示

【ランチメニュー画面 src/app/menu/lunch/page.tsx】
- menu_categories slug='lunch' の store_menus → menu_items を表示
- デザインはカテゴリ詳細画面と同じグリッドレイアウト
- 見出しは「ランチメニュー」固定

【テイクアウトメニュー画面 src/app/menu/takeout/page.tsx】
- store_takeout_menus を店舗・カテゴリで絞り込んで表示
- カテゴリタブは takeout_categories から動的生成
- このページはメニュー閲覧のみ。注文機能は /takeout ページに誘導

【コースメニュー画面 src/app/menu/course/page.tsx】
- courses テーブルから store_id で絞り込んで3列グリッドで表示
- 各カード：画像 / コース種別ラベル / コース名 / 価格表示 / 説明文
- ページ下部に注意事項（courses.notes）を表示
- 詳細ページへの遷移は不要。カードで完結するデザイン

#### テイクアウト（src/app/takeout/page.tsx）
- 既存の components/takeout/ 以下のコンポーネントを維持
- lib/takeoutData.ts のデータを Supabase クエリに切り替え
- 店舗はプルダウン選択（stores テーブル）
- 日付カレンダー → takeout_slots テーブル（is_closed / 時間枠の定員状況）
- メニュー → store_takeout_menus + store_takeout_menu_stores（店舗絞り込み）
- カテゴリタブ → takeout_categories テーブル
- 注文送信 → 既存 api/takeout/ Route Handler を Supabase INSERT に切り替え
  takeout_orders / takeout_order_items にINSERT後、既存のメール送信処理（takeoutMail.ts）は維持

#### 採用（src/app/recruit/）
- RecruitListSection.tsx / RecruitListClient.tsx → 一覧画面
- RecruitDetailSection.tsx / RecruitDetailClient.tsx → 詳細画面
- lib/recruitData.ts のデータを Supabase クエリに切り替え
- 店舗タブ → stores テーブルから動的生成
- 求人一覧 → recruitments + recruitment_tags の別クエリ取得
- 求人詳細（src/app/recruit/[id]/page.tsx）→ recruitments + recruitment_details + recruitment_tags

#### お問い合わせ（src/app/contact/page.tsx）
- 既存 api/contact/ Route Handler を Supabase INSERT に切り替え
  contact_messages にINSERT後、既存のメール送信処理（contactMail.ts）は維持

---

## スキルの既存実装との差分まとめ

| スキルの実装 | 今回の対応 |
|-------------|-----------|
| posts テーブル（blog/news 両用） | 不使用。news テーブルを新規作成 |
| categories テーブル（blog/news） | 不使用。menu_categories / takeout_categories を新規作成 |
| contact_messages テーブル | そのまま流用（phone フィールドを追加） |
| profiles テーブル | そのまま流用 |
| media テーブル | そのまま流用 |
| Sidebar.tsx | カード型ではなく左固定サイドバーに変更 |
| admin/posts → admin/news | お知らせ専用に変更 |
| admin/contact | そのまま流用（テイクアウト注文管理も同構造で追加） |
| admin/users, admin/media | そのまま流用 |
| フロントページ | 既存フロントのデザインを維持し、データ取得部分のみ切り替え |
| 営業カレンダー | business_calendars テーブルを新規追加。亀岡本店固定でトップの Business days セクションに連動 |
| コース | 詳細ページ遷移なし。カード一覧で完結。slug / 詳細画像 不要。type_label を追加 |
| メニューカテゴリ一覧 | 上部：通常カテゴリグリッド / 下部：ランチ・テイクアウト・コースの誘導バナー3枚縦並び |
| メニュータブ | カテゴリが多い場合は2段折り返し（CSS flex-wrap） |

---

## 実装の優先順位

以下の順で実装してください：

1. DB マイグレーション（001 → 002 → 003）
2. Supabase クライアント（スキルそのまま）
3. 管理画面レイアウト（Sidebar / TopBar）
4. 認証（スキルそのまま）
5. 店舗管理（他の全機能の基盤になるため最初に）
6. カテゴリ管理（メニュー登録の前提）
7. メニュー / コース / テイクアウトメニュー管理
8. テイクアウト受付枠管理（カレンダーUI）
9. 営業カレンダー管理（Business days）
10. お知らせ管理
11. 採用管理
12. 注文受付 / お問い合わせ管理
13. ユーザー / メディア管理
14. フロント動的切り替え
15. ダッシュボード

---

## 注意事項（スキルの重要ポリシーより）

- 管理画面の DB アクセスは必ず adminSupabase（Service Role）を使う
- onClick は Server Component に書かない → 'use client' に切り出す
- カテゴリは JOIN ではなく別クエリ + categoryMap パターン
- RLS ポリシーは DROP POLICY IF EXISTS してから CREATE POLICY
- 店舗マスタ更新時は revalidatePath で関連フロントページのキャッシュをクリア
- generateStaticParams / generateMetadata では createStaticClient を使う
```

---

## チェックリスト（実装完了後に確認）

- [ ] Supabase SQL Editor で 001 → 002 → 003 を実行済み
- [ ] Storage バケット `media` を Public で作成済み
- [ ] `.env.local` に3つの環境変数を設定済み
- [ ] 管理者ユーザーを Supabase Auth で作成し、profiles.role = 'admin' に更新済み
- [ ] http://localhost:3000/admin/login でログイン確認
- [ ] 店舗を1件追加してメニュー登録画面のプルダウンに反映されることを確認
- [ ] テイクアウト受付枠を設定してフロントのカレンダーに反映されることを確認
- [ ] 営業カレンダーを設定してトップの Business days セクションに反映されることを確認
- [ ] フロントからテイクアウト注文を送信し、管理画面の注文受付に届くことを確認
