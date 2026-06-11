# メニュー / コース / テイクアウトメニュー / カテゴリ管理 テストケース

対象:
- メニュー `/admin/menus`（店舗×カテゴリ・項目行・誘導バナー）
- コース `/admin/courses`
- テイクアウトメニュー `/admin/takeout-menus`（取扱店舗チップ）
- カテゴリ管理 `/admin/settings/categories`（@dnd-kit 並び替え）

関連コード:
- `src/lib/actions/menus.ts`（`createStoreMenu`/`updateStoreMenu`/`deleteStoreMenu`/`replaceItems`/`getMenuItems`）
- `src/lib/actions/courses.ts`（`createCourse`/`updateCourse`/`deleteCourse`）
- `src/lib/actions/takeout-menus.ts`（`createTakeoutMenu`/`updateTakeoutMenu`/`deleteTakeoutMenu`/`syncStores`/`getTakeoutMenuStoreIds`）
- `src/lib/actions/categories.ts`（`createCategory`/`updateCategory`/`deleteCategory`/`reorderCategories`/`getCategories`）
- `src/components/admin/DraggableCategoryTable.tsx`（@dnd-kit）
- `src/lib/slug.ts`・`src/lib/takeout-times.ts`（'use server' から分離した同期ヘルパー）

---

## メニュー（store_menus + menu_items）— MENU

設計メモ:
- 店舗プルダウン + カテゴリプルダウンで絞り込み。`store_id` 必須。
- メニュー項目（name/description/price_label/image_url）は `replaceItems` で総入れ替え（空 name は除外・sort_order は配列順）。
- 誘導バナー: `has_detail_page=true` のレコードで detail_image_url/detail_description 等を管理。
- 更新時 `revalidatePath('/menu')` `/menu/[category]` `/menu/lunch` `/menu/takeout` `/menu/course`。

| ID | テスト項目 | 前提条件 | 操作手順 | 期待結果 | 優先度 |
|----|-----------|----------|----------|----------|--------|
| MENU-001 | 一覧表示・絞り込み | ログイン・店舗/カテゴリ seed あり | `/admin/menus` で店舗・カテゴリで絞り込む | 該当する store_menus が一覧表示される | 高 |
| MENU-002 | 新規作成（項目あり） | ログイン状態 | 店舗・カテゴリ選択し、項目行を複数追加して保存 | store_menu と menu_items が作成される。項目は sort_order 順 | 高 |
| MENU-003 | 店舗未選択 | ログイン状態 | 店舗を選ばず保存 | `{ error: '店舗を選択してください' }`。作成されない | 高 |
| MENU-004 | 項目の空 name 除外 | ログイン状態 | name 空の行を混在させて保存 | 空 name 行は保存されない（trim 後に除外） | 中 |
| MENU-005 | 項目の総入れ替え | 項目付き store_menu | 編集で項目を削除/追加して保存 | 旧 menu_items が全削除され新項目のみ残る | 中 |
| MENU-006 | 誘導バナー（has_detail_page） | ログイン状態 | has_detail_page=true・detail_image_url/detail_description を設定し保存 | バナー用データが保存され、`/menu` 下部の誘導バナー（ランチ/テイクアウト/コース）に反映 | 中 |
| MENU-007 | カテゴリ未選択（NULL 許容） | ログイン状態 | category_id 空で保存 | `category_id=null` で保存される（許容） | 低 |
| MENU-008 | 編集・削除 | 既存 store_menu | 更新/削除を実行 | 値更新 or 削除（menu_items は CASCADE 削除）・revalidate | 高 |
| MENU-009 | 未認証でアクション | ログアウト状態 | create/update/delete を呼ぶ | `{ error: '認証が必要です' }` | 高 |

---

## コース（courses）— COURSE

設計メモ: 店舗別・カード一覧完結（slug 不要）。`store_id`・`name` 必須。更新時 `/menu` `/menu/course` を revalidate。

| ID | テスト項目 | 前提条件 | 操作手順 | 期待結果 | 優先度 |
|----|-----------|----------|----------|----------|--------|
| COURSE-001 | 新規作成 | ログイン状態 | 店舗・コース名・種別ラベル・価格表示・説明・注意事項・画像を入力し保存 | 作成成功。各値 trim 保存 | 高 |
| COURSE-002 | 店舗未選択 | ログイン状態 | 店舗を選ばず保存 | `{ error: '店舗を選択してください' }` | 高 |
| COURSE-003 | コース名必須 | ログイン状態 | コース名空で保存 | `{ error: 'コース名は必須です' }` | 高 |
| COURSE-004 | 編集・削除 | 既存コース | 更新/削除 | 値更新 or 削除・`/menu/course` revalidate | 高 |
| COURSE-005 | is_active OFF | ログイン状態 | `is_active=false` で保存 | フロント `/menu/course` に出ない（RLS `is_active=true`） | 中 |
| COURSE-006 | 未認証でアクション | ログアウト状態 | create/update/delete | `{ error: '認証が必要です' }` | 高 |

---

## テイクアウトメニュー（store_takeout_menus + 中間テーブル）— TKMENU

設計メモ:
- カテゴリプルダウン + 取扱店舗チップ（複数）→ `store_takeout_menu_stores` を `syncStores` で総入れ替え。
- 価格は INT。`normalize` で `Math.max(0, Math.round(price))`（負値は 0、小数は四捨五入）。
- `name` 必須。更新時 `/takeout` `/menu/takeout` を revalidate。

| ID | テスト項目 | 前提条件 | 操作手順 | 期待結果 | 優先度 |
|----|-----------|----------|----------|----------|--------|
| TKMENU-001 | 新規作成（店舗チップ複数） | ログイン状態 | カテゴリ・名前・価格・取扱店舗チップを複数選択し保存 | menu 作成 + 中間テーブルに店舗分 insert | 高 |
| TKMENU-002 | メニュー名必須 | ログイン状態 | 名前空で保存 | `{ error: 'メニュー名は必須です' }` | 高 |
| TKMENU-003 | 価格境界値（負・小数・0） | ログイン状態 | price に -100 / 1700.6 / 0 を入力し保存 | -100→0、1700.6→1701、0→0 で保存（`Math.max(0, Math.round())`） | 中 |
| TKMENU-004 | 取扱店舗の総入れ替え | 店舗紐付け済メニュー | 編集で店舗チップを変更して保存 | 中間テーブルが新選択のみに置換される（`syncStores`） | 中 |
| TKMENU-005 | 取扱店舗0件 | ログイン状態 | 店舗チップを全解除して保存 | 中間テーブルは空。メニュー自体は保存される | 低 |
| TKMENU-006 | 編集・削除 | 既存メニュー | 更新/削除 | 値更新 or 削除（中間テーブル CASCADE）・revalidate | 高 |
| TKMENU-007 | 未認証でアクション | ログアウト状態 | create/update/delete | `{ error: '認証が必要です' }` | 高 |

---

## カテゴリ管理（menu_categories / takeout_categories）— CAT

設計メモ:
- 通常メニュー / テイクアウト のタブで `kind`（'menu' / 'takeout'）を切替。
- 作成時、`sort_order` は現在の最大値 +1（末尾追加）。slug 未指定時は `autoSlug`（日本語等で空なら `cat-<timestamp>`）。
- 削除時、紐づくメニュー（`store_menus` / `store_takeout_menus`）が1件以上あれば **削除拒否**（警告メッセージ）。
- 並び替えは `reorderCategories`（@dnd-kit でドラッグ → 配列順を sort_order=index+1 で一括更新）。

| ID | テスト項目 | 前提条件 | 操作手順 | 期待結果 | 優先度 |
|----|-----------|----------|----------|----------|--------|
| CAT-001 | 一覧表示（タブ切替） | ログイン・カテゴリ seed あり | `/admin/settings/categories` で通常/テイクアウトタブを切替 | 各 kind のカテゴリが sort_order 順で表示 | 高 |
| CAT-002 | 新規作成（末尾追加） | ログイン状態 | カテゴリ名を入力し追加 | 最大 sort_order +1 で末尾に追加される | 高 |
| CAT-003 | カテゴリ名必須 | ログイン状態 | 名前空で作成 | `{ error: 'カテゴリ名は必須です' }` | 高 |
| CAT-004 | slug 自動生成（日本語） | ログイン状態 | 日本語名のみで slug 未指定で作成 | `autoSlug` で空になるため `cat-<timestamp>` が付与される | 中 |
| CAT-005 | slug 手動指定 | ログイン状態 | slug を明示して作成 | 指定 slug（trim）で保存 | 中 |
| CAT-006 | 表示 ON/OFF 更新 | 既存カテゴリ | `is_active` を切替 | 値更新。OFF はフロントに出ない（RLS `is_active=true`） | 中 |
| CAT-007 | ドラッグ並び替え | カテゴリ複数 | @dnd-kit で行をドラッグして並べ替え | `sort_order` が index+1 で一括更新され、保存後も順序維持 | 高 |
| CAT-008 | 紐づきありカテゴリの削除拒否 | メニューが紐づくカテゴリ | 削除を実行 | `{ error: 'このカテゴリには N 件のメニューが紐づいています…' }`。削除されない | 高 |
| CAT-009 | 紐づきなしカテゴリの削除 | 紐づきゼロのカテゴリ | 削除を実行 | 削除成功・revalidate | 中 |
| CAT-010 | 未認証でアクション | ログアウト状態 | create/update/delete/reorder | `{ error: '認証が必要です' }` | 高 |

## 回帰テスト

| ID | テスト項目 | 前提条件 | 操作手順 | 期待結果 | 優先度 | 備考 |
|----|-----------|----------|----------|----------|--------|------|
| MENU-REG-001 | 'use server' 同期 export ビルド失敗の回避 | — | `npm run build` を実行 | `generateSlug`/`defaultTimeLabels` 等の同期ヘルパーが `src/lib/slug.ts`・`src/lib/takeout-times.ts` に分離され、ビルドが成功する（Turbopack エラーなし） | 高 | ミスリスト 2026-06-11。'use server' は全 export が async 必須 |
</content>
