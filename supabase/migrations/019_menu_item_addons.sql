-- 品目に「追加メニュー」を持たせる。
-- 例: サムギョプサルの追加メニュー（豚バラ・キムチ 等）。
-- 形式: jsonb 配列 [{ "name": "豚バラ", "price": "740" }, ...]。NULL/空=追加メニューなし。
alter table public.menu_items
  add column if not exists addons jsonb;

comment on column public.menu_items.addons is
  '品目の追加メニュー。jsonb配列 [{name, price}]。NULL/空=なし。フロントで品目カード内に入れ子表示する。';
