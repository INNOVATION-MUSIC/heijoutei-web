# 注文受付・お問い合わせ・受付枠・営業カレンダー テストケース

対象:
- 注文受付 `/admin/takeout-orders`（既読管理・ステータス）— ORD
- お問い合わせ `/admin/contact`（既読管理）— CNT
- テイクアウト受付枠 `/admin/takeout-slots`（カレンダー UI）— SLOT
- 営業カレンダー `/admin/business-calendar`（亀岡本店固定）— BCAL

関連コード:
- `src/lib/actions/takeout-orders.ts`（`toggleOrderRead`/`updateOrderStatus`）
- `src/lib/actions/contact.ts`（`toggleMessageRead`）
- `src/lib/actions/takeout-slots.ts`（`getMonthSlots`/`saveDaySlot`）
- `src/lib/actions/business-calendar.ts`（`getBusinessMonth`/`saveBusinessDay`/`deleteBusinessDay`/`bulkSetWeekday`）

---

## 注文受付（takeout_orders）— ORD

設計メモ:
- 既読切替 `toggleOrderRead`: `is_read` を反転し、true 時 `read_at` に現在時刻、false 時 null。`/admin/takeout-orders` を revalidate。
- ステータス `updateOrderStatus`: `pending`/`confirmed`/`cancelled`/`completed`。
- 未読件数はサイドバー/ダッシュボードに反映（`is_read=false` カウント）。
- **未読強調（2026-06-12）**: 未読行は「未読」テキストバッジ（青）＋タイトル太字（`font-bold`）＋行背景うっすら青（`bg-blue-500/[0.06]`）＋左に青ボーダー。既読行は通常表示（`font-medium`）。
- **未読/既読フィルター（2026-06-12）**: 一覧上部に「すべて／未読／既読」チップ（各件数つき・URL `?read=` 方式・アクティブはゴールド枠）。**店舗フィルター（`?store=`）と併用可**（`buildHref` が `store`/`read` を相互保持）。件数カウンターは常に全件基準。フィルタはメモリ内（追加クエリなし）。

| ID | テスト項目 | 前提条件 | 操作手順 | 期待結果 | 優先度 |
|----|-----------|----------|----------|----------|--------|
| ORD-001 | 注文一覧表示・未読強調 | ログイン・未読注文あり | `/admin/takeout-orders` を開く | 一覧表示。**未読行は「未読」青バッジ＋タイトル太字＋背景うっすら青＋左青ボーダー**、既読行は通常表示。上部に未読件数・本日件数/合計 | 高 |
| ORD-002 | 注文詳細表示 | 注文あり | 行をクリック | 受取日時・注文メニュー一覧・購入者情報が表示される | 高 |
| ORD-003 | 既読にする | 未読注文あり | 「既読にする」を実行 | `is_read=true`・`read_at`=時刻。未読バッジが減る・行の強調が解除される・revalidate | 高 |
| ORD-004 | 未読に戻す | 既読注文あり | トグルで未読へ | `is_read=false`・`read_at=null`・行が再び未読強調になる | 中 |
| ORD-005 | ステータス変更 | 注文あり | status を confirmed/cancelled/completed に変更 | `status` が更新される | 中 |
| ORD-006 | 店舗フィルター | 複数店舗の注文 | 店舗チップで絞り込み | `?store=` が付き該当店舗の注文のみ表示。アクティブ店舗チップがゴールド枠 | 中 |
| ORD-007 | 未認証でアクション | ログアウト状態 | `toggleOrderRead`/`updateOrderStatus` を呼ぶ | `{ error: '認証が必要です' }` | 高 |
| ORD-008 | 未読フィルター | 未読・既読が混在 | 上部チップ「未読」を押下 | `?read=unread`。未読注文のみ表示。「未読 (n)」チップがアクティブ（ゴールド枠）。チップの件数 n は全件基準で正しい | 高 |
| ORD-009 | 既読フィルター | 未読・既読が混在 | 「既読」チップを押下 | `?read=read`。既読注文のみ表示。「既読 (n)」がアクティブ | 中 |
| ORD-010 | すべてフィルター | フィルター適用中 | 「すべて」チップを押下 | `?read=` が外れ（`/admin/takeout-orders`）全件表示に戻る | 中 |
| ORD-011 | 店舗×未読の併用 | 複数店舗・未読混在 | 店舗チップ→「未読」チップの順に押下 | `?store=...&read=unread` の両方が URL に保持され、該当店舗かつ未読のみ表示（`buildHref` が相互保持） | 高 |
| ORD-012 | フィルター該当0件 | 全件は存在するが未読が0件 | 注文が全て既読の状態で「未読」チップ | 「該当する注文はありません。」が表示される（全件0件時の「注文はありません。」とは文言が異なる） | 中 |

---

## お問い合わせ（contact_messages）— CNT

設計メモ:
- `toggleMessageRead` で `is_read` 反転・`read_at` 設定/null。`/admin/contact` を revalidate。
- **未読強調（2026-06-12）**: 未読行は「未読」青バッジ＋タイトル（氏名）太字＋背景うっすら青＋左青ボーダー。既読行は通常表示。
- **未読/既読フィルター（2026-06-12）**: 一覧上部に「すべて／未読／既読」チップ（各件数つき・URL `?read=` 方式・アクティブはゴールド枠）。お問い合わせには店舗フィルターは無い。

| ID | テスト項目 | 前提条件 | 操作手順 | 期待結果 | 優先度 |
|----|-----------|----------|----------|----------|--------|
| CNT-001 | 一覧表示・未読強調 | ログイン・未読問い合わせあり | `/admin/contact` を開く | 一覧表示。**未読行は「未読」青バッジ＋氏名太字＋背景うっすら青＋左青ボーダー**、既読行は通常表示。上部に全件/未読件数 | 高 |
| CNT-002 | 詳細表示（phone 含む） | 問い合わせあり | 行をクリック | 氏名/カナ/メール/電話/種別/本文が表示される | 高 |
| CNT-003 | 既読にする | 未読あり | 既読切替 | `is_read=true`・`read_at`=時刻・行の強調が解除・revalidate | 高 |
| CNT-004 | 未読に戻す | 既読あり | トグルで未読へ | `is_read=false`・`read_at=null`・行が再び未読強調になる | 中 |
| CNT-005 | 未認証でアクション | ログアウト状態 | `toggleMessageRead` を呼ぶ | `{ error: '認証が必要です' }` | 高 |
| CNT-006 | 未読フィルター | 未読・既読が混在 | 上部チップ「未読」を押下 | `?read=unread`。未読のみ表示。「未読 (n)」がアクティブ（ゴールド枠）・件数は全件基準 | 高 |
| CNT-007 | 既読フィルター | 未読・既読が混在 | 「既読」チップを押下 | `?read=read`。既読のみ表示。「既読 (n)」がアクティブ | 中 |
| CNT-008 | すべてフィルター | フィルター適用中 | 「すべて」チップを押下 | `?read=` が外れ（`/admin/contact`）全件表示に戻る | 中 |
| CNT-009 | フィルター該当0件 | 全件は存在するが未読が0件 | 全件既読の状態で「未読」チップ | 「該当するお問い合わせはありません。」が表示される（全件0件時の「お問い合わせはありません。」とは文言が異なる） | 中 |

---

## テイクアウト受付枠（takeout_slots + takeout_slot_times）— SLOT

設計メモ:
- `getMonthSlots(storeId, year, month)`: 指定月の slot を date キーで返す（time は slot_times を別取得）。
- `saveDaySlot`: slot を `onConflict: store_id,available_date` で upsert → slot_times を **総入れ替え**（delete → insert・sort_order は配列順）。`/takeout` を revalidate。
- ※フロント `/takeout` 注文カレンダーへの連動は「未解決（据え置き）」のため本仕様の対象は **管理画面側の保存/取得まで**。

| ID | テスト項目 | 前提条件 | 操作手順 | 期待結果 | 優先度 |
|----|-----------|----------|----------|----------|--------|
| SLOT-001 | 月カレンダー表示 | ログイン状態 | `/admin/takeout-slots` で店舗タブを選び月を表示 | 受付あり=緑/停止=赤/未設定=ドットなしで表示（`getMonthSlots`） | 高 |
| SLOT-002 | 1日分の受付枠保存 | ログイン状態 | 日を選び時間枠 ON/OFF・定員を設定し保存 | slot が upsert され slot_times が総入れ替えで保存される | 高 |
| SLOT-003 | 同一日の再保存（upsert） | 既存 slot あり | 同じ日を再設定して保存 | UNIQUE(store_id,available_date) で重複行が増えず更新される | 高 |
| SLOT-004 | この日を受付停止 | 既存 slot | `is_closed=true` で保存 | カレンダーで赤表示。`is_closed` が保存される | 中 |
| SLOT-005 | 全枠を開く/停止 | 既存 slot | 一括 ON/OFF を保存 | 各 slot_time の `is_active` が一括変更される | 中 |
| SLOT-006 | 店舗切替 | 複数店舗 | 店舗タブを切替 | その店舗の月 slot が表示される | 中 |
| SLOT-007 | 未認証でアクション | ログアウト状態 | `saveDaySlot` を呼ぶ | `{ error: '認証が必要です' }` | 高 |

---

## 営業カレンダー（business_calendars・亀岡本店固定）— BCAL

設計メモ:
- 対象店舗は亀岡店（`stores.slug='kameoka'`）固定。
- ステータス: `open`/`closed`/`special_closed`/`limited`。
- `saveBusinessDay`: `onConflict: store_id,date` で upsert（note は trim・空は null）。`/` を revalidate。
- `deleteBusinessDay`: 指定日を削除。
- `bulkSetWeekday`: 指定月の特定曜日（0=日〜6=土）を一括 upsert。
- ※トップ `CalendarSection` への連動は「未解決（据え置き）」。本仕様は **管理画面側の保存/取得まで**。

| ID | テスト項目 | 前提条件 | 操作手順 | 期待結果 | 優先度 |
|----|-----------|----------|----------|----------|--------|
| BCAL-001 | 月カレンダー表示 | ログイン状態 | `/admin/business-calendar` で月を表示 | `getBusinessMonth` の結果に応じステータス色分け表示 | 高 |
| BCAL-002 | 1日のステータス保存 | ログイン状態 | 日を選びステータス+備考を保存 | upsert で保存・`/` を revalidate | 高 |
| BCAL-003 | 同一日再保存（upsert） | 既存日 | 同じ日を再設定 | UNIQUE(store_id,date) で重複せず更新 | 高 |
| BCAL-004 | 日の削除 | 設定済みの日 | `deleteBusinessDay` を実行 | 当該日のレコードが削除される | 中 |
| BCAL-005 | 曜日一括設定 | ログイン状態 | 「毎週○曜日を定休日に」で一括設定 | 当月の該当曜日が全て upsert される（`bulkSetWeekday`） | 中 |
| BCAL-006 | ステータス境界（4種） | ログイン状態 | open/closed/special_closed/limited を各々保存 | CHECK 制約内の値はすべて保存できる | 低 |
| BCAL-007 | 未認証でアクション | ログアウト状態 | `saveBusinessDay`/`deleteBusinessDay`/`bulkSetWeekday` を呼ぶ | `{ error: '認証が必要です' }` | 高 |
