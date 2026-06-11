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

| ID | テスト項目 | 前提条件 | 操作手順 | 期待結果 | 優先度 |
|----|-----------|----------|----------|----------|--------|
| ORD-001 | 注文一覧表示 | ログイン・注文あり | `/admin/takeout-orders` を開く | 一覧表示。未読は青ライン/青ドット。上部に未読件数・本日件数/合計 | 高 |
| ORD-002 | 注文詳細表示 | 注文あり | 行をクリック | 受取日時・注文メニュー一覧・購入者情報が表示される | 高 |
| ORD-003 | 既読にする | 未読注文あり | 「既読にする」を実行 | `is_read=true`・`read_at`=時刻。未読バッジが減る・revalidate | 高 |
| ORD-004 | 未読に戻す | 既読注文あり | トグルで未読へ | `is_read=false`・`read_at=null` | 中 |
| ORD-005 | ステータス変更 | 注文あり | status を confirmed/cancelled/completed に変更 | `status` が更新される | 中 |
| ORD-006 | 店舗フィルター | 複数店舗の注文 | 店舗チップで絞り込み | 該当店舗の注文のみ表示（※UI 動作は実機確認） | 中 |
| ORD-007 | 未認証でアクション | ログアウト状態 | `toggleOrderRead`/`updateOrderStatus` を呼ぶ | `{ error: '認証が必要です' }` | 高 |

---

## お問い合わせ（contact_messages）— CNT

設計メモ: `toggleMessageRead` で `is_read` 反転・`read_at` 設定/null。`/admin/contact` を revalidate。

| ID | テスト項目 | 前提条件 | 操作手順 | 期待結果 | 優先度 |
|----|-----------|----------|----------|----------|--------|
| CNT-001 | 一覧表示 | ログイン・問い合わせあり | `/admin/contact` を開く | 一覧表示。未読は青ドット。未読件数表示 | 高 |
| CNT-002 | 詳細表示（phone 含む） | 問い合わせあり | 行をクリック | 氏名/カナ/メール/電話/件名/本文が表示される | 高 |
| CNT-003 | 既読にする | 未読あり | 既読切替 | `is_read=true`・`read_at`=時刻・revalidate | 高 |
| CNT-004 | 未読に戻す | 既読あり | トグルで未読へ | `is_read=false`・`read_at=null` | 中 |
| CNT-005 | 未認証でアクション | ログアウト状態 | `toggleMessageRead` を呼ぶ | `{ error: '認証が必要です' }` | 高 |

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
