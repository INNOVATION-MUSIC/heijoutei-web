# 管理画面 店舗スコープ権限 テストケース（SCOPE）

対象: 店舗別管理アカウント（`profiles.store_ids` を持つ editor）。自店のデータのみ閲覧・編集でき、他店・本部専用機能には触れられないこと。

関連コード:
- `supabase/migrations/023_store_scoped_accounts.sql`（`profiles.store_ids` / `contact_messages.store_id`）
- `src/lib/auth-guard.ts`（`requireAuth().storeIds` / `scopedStoreIds` / `canAccessStore` / `assertStoreAccess` / `assertAllStores` / `requireAllStores`）
- `src/app/admin/(protected)/layout.tsx`（担当店舗の解決・サイドバーへの受け渡し・未読バッジのスコープ）
- `src/components/admin/Sidebar.tsx`（`hqOnly` フィルタ・担当店舗バッジ）
- 各一覧/編集ページ・各 `src/lib/actions/*.ts`
- `src/lib/actions/refs.ts` `getStoreRefs()`（フォームの店舗選択肢をスコープ）
- `src/lib/actions/users.ts` + `src/components/admin/StoreScopePicker.tsx`（担当店舗の割当 UI）

設計メモ:
- 認可はすべてアプリ層（管理画面は `adminSupabase` = service_role で RLS バイパス）。
- `role='admin'` または `store_ids` 未設定の editor = 全店（本部）。`storeIds === null` で表す。
- 前提テストデータ: editor `sonobe-test@example.com` に `store_ids = [園部店の uuid]` を設定。検証後に削除。

| ID | テスト項目 | 前提条件 | 操作手順 | 期待結果 | 優先度 |
|----|-----------|----------|----------|----------|--------|
| SCOPE-001 | サイドバーの担当店舗バッジ | 園部スタッフでログイン | `/admin` を開く | サイドバー上部に「担当店舗 平壌亭 園部店」が表示される | 中 |
| SCOPE-002 | 本部専用メニューの非表示 | 園部スタッフ | `/admin` サイドバーを確認 | 「ギフト」「送料金表」「カテゴリ管理」「ユーザー管理」が表示されない。お知らせ・店舗・メニュー・ランチ・コース・営業カレンダー・テイクアウト各種・採用・お問い合わせ・メディアは表示される | 高 |
| SCOPE-003 | ダッシュボードのスコープ集計 | 園部スタッフ・複数店の注文が存在 | `/admin` を開く | 未読の注文・本日/今月の売上・最新の注文/問い合わせが園部店分のみ。公開中のお知らせは全体値 | 中 |
| SCOPE-004 | メニュー一覧のスコープ | 園部スタッフ | `/admin/menus` を開く | 園部店のセクションのみ表示。店舗フィルタの選択肢が「すべて / 平壌亭 園部店」だけ | 高 |
| SCOPE-005 | 他店メニューの編集ページ直打ち | 園部スタッフ | 亀岡店の `store_menus.id` で `/admin/menus/<id>/edit` を開く | 404（`notFound()`）。フォームは表示されない | 高 |
| SCOPE-006 | 他店 store_id を差し込んだ Server Action | 園部スタッフ | フォーム改ざん等で `createStoreMenu` / `updateStoreMenu` / `deleteStoreMenu` / `reorderStoreMenus` に亀岡の `store_id`（または id）を渡す | `{ error: '権限がありません（担当店舗外の操作です）' }`。DB 変更なし | 高 |
| SCOPE-007 | コース / 採用 / 注文受付の一覧スコープ | 園部スタッフ | 各一覧を開く | 園部店分のみ表示。店舗セレクトも園部のみ | 高 |
| SCOPE-007b | 受付枠管理・営業カレンダーは亀岡専用 | 園部スタッフ（亀岡の担当でない） | サイドバー確認 / `/admin/takeout-slots` `/admin/business-calendar` を直打ち | サイドバーに両メニューが出ない。直打ちすると「本部で管理しています」の案内のみ表示。亀岡担当の店舗スタッフ・本部には従来どおり表示 | 高 |
| SCOPE-008 | コース / 採用 / テイクアウトメニューの複製・並べ替え | 園部スタッフ | 自店の行で複製 / ドラッグ並べ替え | 成功する（自店の範囲内） | 中 |
| SCOPE-009 | 他店注文の既読切替・状態変更 | 園部スタッフ | 亀岡の `takeout_orders.id` で `toggleOrderRead` / `updateOrderStatus` を呼ぶ | `{ error }` が返り DB 変更なし | 高 |
| SCOPE-010 | テイクアウトメニュー（M:N）のスコープ | 園部スタッフ | `/admin/takeout-menus` を開く / 亀岡専用メニューの編集を直打ち | 一覧は「紐づく店舗がすべて園部」のメニューのみ。他店を含むメニューの編集は 404 | 高 |
| SCOPE-011 | 店舗マスタ — 自店編集 | 園部スタッフ | `/admin/stores` → 園部の「編集」→ 営業時間等を変更して保存 | 一覧に園部のみ表示・「＋新規店舗」ボタンなし・「削除」なし。自店の保存は成功 | 高 |
| SCOPE-012 | 店舗マスタ — 他店編集 / 新規 / 削除 | 園部スタッフ | 亀岡の `/admin/stores/<id>/edit` 直打ち / `/admin/stores/new` 直打ち / `createStore` `deleteStore` `updateStore(他店)` を呼ぶ | 編集/新規ページは 404。アクションは `{ error }` で DB 変更なし | 高 |
| SCOPE-013 | 本部専用ページの直打ち | 園部スタッフ | `/admin/gifts` `/admin/gifts/new` `/admin/gift-shipping` `/admin/settings/categories` を開く | すべて 404 | 高 |
| SCOPE-014 | 本部専用 Server Action | 園部スタッフ | `createGift` / `updateGift` / `deleteGift` / `duplicateGift` / `reorderGifts` / `saveGiftShipping` / `createCategory` / `updateCategory` / `deleteCategory` / `reorderCategories` を呼ぶ | いずれも `{ error: '権限がありません（本部のみ）' }`。DB 変更なし | 高 |
| SCOPE-015 | お知らせ・メディアは共通 | 園部スタッフ | `/admin/news` で新規作成・編集、`/admin/media` で画像アップロード | どちらも成功する（店舗区分なし・共通運用） | 中 |
| SCOPE-016 | お問い合わせのスコープ | 園部スタッフ | `/admin/contact` を開く | 園部店宛（`contact_messages.store_id` = 園部）のみ表示。`store_id` 未設定の古い行は本部のみ閲覧 | 中 |
| SCOPE-017 | 担当店舗の割当 UI（admin のみ） | admin でログイン | `/admin/users/new` / `/admin/users/<id>/edit` で「担当店舗」にチェック→保存 | `profiles.store_ids` に保存される。ロールを「管理者」にすると担当店舗欄が非活性化し、保存時 `store_ids` は null | 高 |
| SCOPE-018 | 複数店舗の割当 | admin | あるユーザーに亀岡＋ゆらのを割当 | そのユーザーは両店の一覧・編集ができ、他店（園部・福知山・KOPU29）は不可 | 中 |
| SCOPE-019 | 既存アカウントの互換 | `store_ids` 未設定の editor / admin でログイン | 各画面を確認 | 全店が従来どおり見え、本部専用機能も使える（担当店舗バッジは非表示） | 高 |
| SCOPE-020 | 未読バッジのスコープ | 園部スタッフ | サイドバーの「注文受付」「お問い合わせ」バッジ | 園部店分の未読件数のみカウント | 低 |
