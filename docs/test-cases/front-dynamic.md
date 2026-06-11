# フロント動的化 テストケース（FRONT）

対象: `/news`・`/news/[id]`・トップ NewsSection・`/store`・`/store/[id]`・`/recruit`・`/recruit/[id]`・`/menu` 系（`/menu`・`/menu/[category]`・`/menu/lunch`・`/menu/course`・`/menu/takeout`）・`/takeout` 注文フロー。

関連コード:
- `src/app/lib/newsDb.ts`・`storeDb.ts`・`storeListDb.ts`・`recruitDb.ts`・`menuDb.ts`・`courseDb.ts`・`menuTakeoutDb.ts`・`takeoutOrderDb.ts`
- `src/lib/supabase/static.ts`（`createStaticClient` — anon・SELECT 用）
- 各フロントページ `export const revalidate = 60`

共通設計（全ページ共通パターン）:
- フェッチャは `createStaticClient` で SELECT → DB が空/エラー/例外時は **静的データへフォールバック**（try/catch で安全動作）。
- サーバーページで prefetch → クライアントに任意 props 注入（店舗切替等はクライアント側のまま）→ 表示コンポーネントは無改変。
- **レイアウト/URL は据え置き**。ISR `revalidate=60`、管理更新時は `revalidatePath` で即時クリア。
- 公開条件（RLS）: news/recruit は `is_published=true`、stores/courses/categories/menus は `is_active=true`。news は `published_at <= now()` も条件。

| ID | テスト項目 | 前提条件 | 操作手順 | 期待結果 | 優先度 |
|----|-----------|----------|----------|----------|--------|
| FRONT-001 | お知らせ一覧の DB 描画 | news に公開記事複数 | `/news` を開く | DB の公開記事が新しい順で描画される（`fetchNewsList`） | 高 |
| FRONT-002 | お知らせ詳細（slug） | 公開記事 | `/news/<slug>` を開く | DB の本文（TipTap HTML）がそのまま描画される | 高 |
| FRONT-003 | 予約公開が未来は非表示 | `published_at` が未来の公開記事 | `/news` を開く | `published_at <= now()` 条件で当該記事は表示されない | 高 |
| FRONT-004 | 下書きは非表示 | 下書き記事 | `/news` `/news/<slug>` を開く | 一覧・詳細とも表示されない（`is_published=true` 条件） | 高 |
| FRONT-005 | トップ News カルーセル | news に公開記事 | トップ `/` を開く | 最新数件が NewsSection（PC/SP）に描画される（`fetchTopNews`） | 中 |
| FRONT-006 | 店舗一覧の DB 描画 | stores に is_active 複数 | `/store` を開く | is_active=true の店舗が sort_order 順で描画 | 高 |
| FRONT-007 | 非公開店舗の除外 | is_active=false の店舗 | `/store` を開く | 当該店舗が一覧に出ない | 高 |
| FRONT-008 | 店舗詳細 | 店舗あり | `/store/<slug>` を開く | DB の店舗情報・LINE ID・Google Map URL 等が描画 | 高 |
| FRONT-009 | 採用一覧/詳細 | recruit 公開あり | `/recruit`・`/recruit/<id>` を開く | 公開求人とタグ/募集要項が描画される | 高 |
| FRONT-010 | メニューカテゴリ一覧 | menu_categories あり | `/menu` を開く | カテゴリグリッド + 誘導バナー（ランチ/テイクアウト/コース）が描画 | 高 |
| FRONT-011 | カテゴリ詳細 | store_menus/menu_items あり | `/menu/<category>` を開く | 該当カテゴリの項目が描画される | 高 |
| FRONT-012 | ランチ/コース/テイクアウト閲覧 | 各データあり | `/menu/lunch`・`/menu/course`・`/menu/takeout` を開く | それぞれの DB データが描画される | 高 |
| FRONT-013 | 店舗別メニュー切替 | 複数店舗にメニュー | メニュー画面で店舗タブ/select を切替 | 同カテゴリで店舗別の内容に切替わる（リロードなし・`?store=` 更新） | 高 |
| FRONT-014 | テイクアウト注文フロー（店舗/メニュー） | takeout メニューあり | `/takeout` を開き店舗・メニューを選択 | DB の店舗 select・メニューが描画される（`takeoutOrderDb`） | 高 |
| FRONT-015 | ISR revalidate=60 | フロント各ページ | ページソース/挙動を確認 | 各ページに `revalidate=60` が設定され、最大60秒で再生成される | 中 |
| FRONT-016 | revalidatePath 即時反映 | 管理画面でデータ更新 | 該当データを更新後フロントを再読込 | `revalidatePath` 対象ページが即時で最新化される | 高 |
| FRONT-017 | URL 据え置き | — | 各フロント URL を確認 | 動的化後も URL は従来どおり（`/news`/`/store`/`/menu` 等） | 中 |

## 回帰テスト（フォールバック等）

| ID | テスト項目 | 前提条件 | 操作手順 | 期待結果 | 優先度 | 備考 |
|----|-----------|----------|----------|----------|--------|------|
| FRONT-REG-001 | DB 空時の静的フォールバック（一覧） | 対象テーブルが空 or 取得失敗 | `/news`（`/store`/`/recruit`/`/menu` 同様）を開く | クエリ結果が 0 件/エラー時に静的データ（`NEWS_LIST_DATA` 等）へフォールバックし、ページが壊れず描画される | 高 | ミスリスト 2026-06-11。各 `xxxDb.ts` の try/catch・空判定 |
| FRONT-REG-002 | DB 空時のトップ News フォールバック | news が空 | トップ `/` を開く | `NEWS_DATA`（静的）へフォールバックして NewsSection が描画される | 高 | ミスリスト 2026-06-11 |
| FRONT-REG-003 | 詳細フォールバック（未存在/例外） | DB 取得失敗 | `/news/<id>` を開く | 静的 `NEWS_LIST_DATA` から id 一致を返す（無ければ undefined） | 中 | ミスリスト 2026-06-11 |
| FRONT-REG-004 | generateStaticParams のフォールバック | news が空 | ビルド時 | DB 空なら静的 id 一覧で SSG（`fetchNewsParams`） | 中 | ミスリスト 2026-06-11 |
| FRONT-REG-005 | レイアウト無変更 | DB 連携後 | 各フロントページを表示 | 既存デザイン/レイアウトが変わっていない（データ取得のみ切替） | 高 | ミスリスト 2026-06-11 |
</content>
