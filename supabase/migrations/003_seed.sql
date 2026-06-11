-- ========================================
-- 平壌亭 CMS — 003 シードデータ
-- 店舗名は実ブランド「平壌亭」。値は src/app/lib/storeDetailData.ts の実コンテンツに準拠。
-- 5店目は現行フロント同様 KOPU29（slug=heijohtei・公開）。
-- ========================================

-- 店舗シードデータ
INSERT INTO public.stores
  (name, slug, name_en, address, phone, business_hours, closed_days, access, description, seat_description,
   hero_image_url, gallery_image_urls, line_id, is_active, is_coming_soon, sort_order)
VALUES
  ('平壌亭 亀岡店', 'kameoka', 'HEIJOHTEI  KAMEOKA',
   '京都府亀岡市篠町浄法寺中村３５-５', '0771-23-8410',
   E'月、水〜日、祝日、祝前日: 11:30〜14:30 （料理L.O. 14:00 ドリンクL.O. 14:00）16:00〜22:30 （料理L.O. 22:00 ドリンクL.O. 22:00）\nお席120分制となっておりますのでご了承ください。',
   '火曜　但し祝祭日の場合は翌日',
   '【30台無料駐車場完備】お車でお越しの方も安心◎ 8名様以上でマイクロバスの送迎も承ります。お気軽にご相談ください。',
   E'落ち着きのある空間の中で、\n上質な焼肉と特別なひとときをお楽しみいただけます\n本店ならではのメニュー、ランチ&ディナーもご用意しております',
   '126席(テーブル/掘りごたつ座敷/個室)　4〜36名様までOKの個室完備',
   '/images/storelist_kameoka.webp',
   ARRAY['/images/storelist_kameoka.webp','/images/about_interior.webp','/images/about_zashiki.webp','/images/hero_meat.webp'],
   'kameoka', true, false, 1),

  ('平壌亭 園部店', 'sonobe', 'HEIJOHTEI  SONOBE',
   '京都府南丹市園部町上木崎町坪ノ内26-5', '0771-68-1760',
   '月、水〜日、祝日、祝前日: 16:00〜22:30',
   '火曜', '20台駐車場完備/8名様よりマイクロバス送迎あり', NULL, NULL,
   '/images/storelist_sonobe.webp',
   ARRAY['/images/storelist_sonobe.webp','/images/about_interior.webp','/images/about_zashiki.webp','/images/hero_meat.webp'],
   'sonobe', true, false, 2),

  ('平壌亭 福知山店', 'fukuchiyama', 'HEIJOHTEI  FUKUCHIYAMA',
   '京都府福知山市字堀2303の２', '0773-24-2322',
   '月、水〜日、祝日、祝前日: 16:00〜22:30',
   '火曜', '15台駐車場完備/8名様よりマイクロバス送迎あり', NULL, NULL,
   '/images/storelist_fukuchiyama.webp',
   ARRAY['/images/storelist_fukuchiyama.webp','/images/about_interior.webp','/images/about_zashiki.webp','/images/hero_meat.webp'],
   'fukuchiyama', true, false, 3),

  ('焼肉ゆらの', 'yurano', 'YAKINIKU  YURANO',
   '京都府福知山堀今岡６番地ゆらのガーデン内', '0773-45-8429',
   '11:30〜14:30(LO14:00) / 17:00〜22:00(LO21:30)',
   '火曜', 'JR福知山駅より徒歩10分/駐車場有', NULL, NULL,
   '/images/storelist_yurano.webp',
   ARRAY['/images/storelist_yurano.webp','/images/about_interior.webp','/images/about_zashiki.webp','/images/hero_meat.webp'],
   'yurano', true, false, 4),

  ('KOPU29', 'heijohtei', 'KOPUNIKU',
   '京都府亀岡市篠町浄法寺中村34-6', '0771-20-1960',
   '月、水〜日、祝日、祝前日: 16:00〜22:30',
   '火曜', 'JR嵯峨野線「亀岡」駅から徒歩15分', NULL, NULL,
   NULL,
   ARRAY['/images/about_zashiki.webp','/images/about_interior.webp','/images/about_cut.webp','/images/hero_meat.webp'],
   NULL, true, false, 5);

-- 通常メニューカテゴリ
INSERT INTO public.menu_categories (name, slug, sort_order) VALUES
  ('名物',                  'meibutsu', 1),
  ('肉',                    'niku',     2),
  ('ホルモン',              'horumon',  3),
  ('セット',                'set',      4),
  ('焼き物',                'yakimono', 5),
  ('逸品',                  'ippin',    6),
  ('サラダ・キムチ・ナムル', 'salad',    7),
  ('スープ',                'soup',     8),
  ('ご飯',                  'gohan',    9),
  ('麺類',                  'men',     10),
  ('デザート',              'dessert', 11),
  ('ランチ',                'lunch',   12);

-- テイクアウトカテゴリ
INSERT INTO public.takeout_categories (name, slug, sort_order) VALUES
  ('焼肉弁当',         'bento',       1),
  ('お惣菜',           'sozai',       2),
  ('お家で焼肉セット', 'home-set',    3),
  ('BBQセット',        'bbq',         4),
  ('ご飯物・一品料理', 'gohan-ippin', 5),
  ('焼肉単品',         'tanpin',      6),
  ('焼肉盛合わせ',     'moriawase',   7);
