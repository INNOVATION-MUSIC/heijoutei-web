# 店舗管理 テストケース（STORE）

対象: `/admin/stores`・`/admin/stores/new`・`/admin/stores/[id]/edit`。基本情報・ヒーロー画像・ギャラリー（複数）・ロゴ・公開/Coming Soon フラグ・並び順。

関連コード:
- `src/lib/actions/stores.ts`（`createStore` / `updateStore` / `deleteStore` / `normalize` / `revalidateStoreFronts`）
- `src/lib/actions/refs.ts`（`getStoreRefs` — 他フォームのプルダウン用）

設計メモ:
- `stores` は単一マスタ。追加するとメニュー・コース・テイクアウト・採用・受付枠のプルダウン/チップに反映（`getStoreRefs` を sort_order 順で参照）。
- 必須: `name`・`slug`。空文字は `normalize` で null 化（gallery は `[]` 既定）。
- 既定値: `is_active=true`・`is_coming_soon=false`・`sort_order=0`。
- 更新時 `revalidatePath('/')` `/store` `/store/[id]` `/menu`。
- フロント `/store` は `is_active=true` のみ表示（RLS `Public select stores`）。

| ID | テスト項目 | 前提条件 | 操作手順 | 期待結果 | 優先度 |
|----|-----------|----------|----------|----------|--------|
| STORE-001 | 一覧表示 | ログイン状態・店舗 seed 投入済（亀岡/園部/福知山/ゆらの/KOPU29 等） | `/admin/stores` を開く | 店舗一覧が sort_order 順で表示される | 高 |
| STORE-002 | 新規作成（基本情報） | ログイン状態 | 店舗名・スラッグ・住所・電話・営業時間・定休日・アクセス・LINE ID・Google マップ URL を入力し保存 | 作成成功。各値が trim され保存。空欄は null | 高 |
| STORE-003 | 店舗名/スラッグ必須 | ログイン状態 | 名前またはスラッグ空で保存 | `{ error: '店舗名とスラッグは必須です' }`。作成されない | 高 |
| STORE-004 | スラッグ重複（UNIQUE） | 同一スラッグの店舗が既存 | 同じスラッグで保存 | UNIQUE 違反で error。作成されない | 高 |
| STORE-005 | ヒーロー画像・ロゴ・ギャラリー登録 | ログイン状態 | hero_image_url・logo_image_url・gallery_image_urls（複数）を設定し保存 | 各 URL が保存され、`gallery_image_urls` が配列で格納される | 中 |
| STORE-006 | ギャラリー空 | ログイン状態 | ギャラリー未設定で保存 | `gallery_image_urls` は空配列 `[]` で保存（null にならない） | 低 |
| STORE-007 | 公開フラグ OFF | ログイン状態 | `is_active=false` で保存 | フロント `/store` 一覧に表示されない（RLS で除外） | 高 |
| STORE-008 | Coming Soon フラグ | ログイン状態 | `is_coming_soon=true` で保存 | フラグが保存される（フロント表示は実機で確認＝要確認） | 中 |
| STORE-009 | 並び順変更 | 複数店舗 | `sort_order` を変更して保存 | 一覧および各フォームのプルダウンが新しい順序で並ぶ | 中 |
| STORE-010 | 編集（更新） | 既存店舗 | 住所・電話等を変更し保存 | 値更新・`revalidateStoreFronts` でフロント反映 | 高 |
| STORE-011 | 削除 | 既存店舗（紐づくメニュー等あり） | 削除を実行 | 店舗削除。CASCADE で `store_menus`/`courses`/`recruitments`/`takeout_slots` 等も削除（`takeout_orders` は RESTRICT のため注文があると削除拒否＝要確認） | 高 |
| STORE-012 | マスタ連動（プルダウン反映） | 店舗を1件追加 | メニュー/コース/テイクアウト/採用/受付枠の新規作成画面を開く | 追加した店舗が各プルダウン/チップに表示される（`getStoreRefs`） | 高 |
| STORE-013 | 未認証でアクション実行 | ログアウト状態 | `createStore`/`updateStore`/`deleteStore` を呼ぶ | `{ error: '認証が必要です' }`。DB 変更なし | 高 |

## 回帰テスト

| ID | テスト項目 | 前提条件 | 操作手順 | 期待結果 | 優先度 | 備考 |
|----|-----------|----------|----------|----------|--------|------|
| STORE-REG-001 | シード店舗名の表記 | seed 投入済 | 一覧の店舗名を確認 | 「平壌亭」表記で投入されている（仕様書の誤字「平壊亭」ではない） | 中 | ミスリスト 2026-06-11。実ブランド名で投入 |
| STORE-REG-002 | KOPU29（旧ヘイジョウテイ）連動 | KOPU29 店舗データあり | `/store` 一覧・`/store/[id]` 詳細を表示 | KOPUNIKU/KOPU29 表記・ロゴ表示。slug は `heijohtei` 据え置き | 中 | ミスリスト 2026-06-10 |
