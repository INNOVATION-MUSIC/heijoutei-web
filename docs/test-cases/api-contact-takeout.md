# /api/contact・/api/takeout テストケース（API）

対象: お問い合わせ API `POST /api/contact`、テイクアウト注文 API `POST /api/takeout`。DB INSERT・メール best-effort・バリデーション・エラー時のフォーム表示。

関連コード:
- `src/app/api/contact/route.ts`
- `src/app/api/takeout/route.ts`
- `src/lib/supabase/admin.ts`（`adminSupabase` — Service Role で INSERT）
- `src/app/lib/contactMail.ts`・`src/app/lib/takeoutMail.ts`（メール本文生成）

共通設計:
- `runtime = "nodejs"`・`dynamic = "force-dynamic"`。
- メール送信は **best-effort**: SMTP_* 未設定なら transport=null で送信スキップ。送信失敗も try/catch で握り潰し、DB 受付済みなら `{ ok: true }` を返す。
- DB INSERT は `adminSupabase`（RLS バイパス）。

---

## お問い合わせ（/api/contact）— API-CNT

検証ロジック（`validate`）:
- JSON 不正 → 400「リクエストの解析に失敗しました。」
- name/kana 未入力 → 400「お名前・フリガナを入力してください。」
- email 形式不正 → 400「メールアドレスが正しくありません。」（`/^[^\s@]+@[^\s@]+\.[^\s@]+$/`）
- inquiryType / store 未選択 → 400「お問い合わせ種別・ご利用予定店舗を選択してください。」
- DB INSERT 失敗 → 500「送信に失敗しました。時間をおいて再度お試しください。」
- 成功 → `{ ok: true }`。`subject` は `種別（店舗）` 形式。通知先 `CONTACT_NOTIFY_TO`（未設定時 `ORDER_NOTIFY_TO` フォールバック）、Reply-To=お客様メール。

| ID | テスト項目 | 前提条件 | 操作手順 | 期待結果 | 優先度 |
|----|-----------|----------|----------|----------|--------|
| API-CNT-001 | 正常受付（DB INSERT） | dev 起動 | 必須項目を満たす JSON を POST | 200 `{ ok: true }`。`contact_messages` に1行 INSERT され管理画面に届く | 高 |
| API-CNT-002 | JSON 解析失敗 | — | 不正な body を POST | 400「リクエストの解析に失敗しました。」 | 中 |
| API-CNT-003 | 氏名/カナ未入力 | — | name または kana 空で POST | 400「お名前・フリガナを入力してください。」 | 高 |
| API-CNT-004 | メール形式不正 | — | email を `abc` で POST | 400「メールアドレスが正しくありません。」 | 高 |
| API-CNT-005 | 種別/店舗未選択 | — | inquiryType または store 空で POST | 400「お問い合わせ種別・ご利用予定店舗を選択してください。」 | 高 |
| API-CNT-006 | SMTP 未設定でも受付成立 | SMTP_* 未設定 | 正常 JSON を POST | 200 `{ ok: true }`。メールは送られないが DB は保存済み | 高 |
| API-CNT-007 | DB INSERT 失敗時 | DB を一時的に不可に（または権限不備を再現） | 正常 JSON を POST | 500「送信に失敗しました…」。フォームにエラー表示 | 中 |
| API-CNT-008 | subject 整形 | — | inquiryType と store を指定 | `subject` が `種別（店舗）` 形式で保存される | 低 |
| API-CNT-009 | フォーム経由のエラー表示 | — | フロント `/contact` から異常値を送信 | API のエラーメッセージがフォームに表示される | 中 |

---

## テイクアウト注文（/api/takeout）— API-TKO

検証ロジック（`validate`）:
- JSON 不正 → 400「リクエストの解析に失敗しました。」
- store/dateLabel 未選択 → 400「受取店舗・受取日時を選択してください。」
- items 空/非配列 → 400「商品が選択されていません。」
- total が数値でない → 400「合計金額が不正です。」
- customer.name/kana 未入力 → 400「お名前・フリガナを入力してください。」
- email 形式不正 → 400「メールアドレスが正しくありません。」
- 成功 → `{ ok: true }`。

DB 保存:
- `storeSlug` と `pickupDate` がある場合のみ、slug→store_id を解決し `takeout_orders` を INSERT → `takeout_order_items` を INSERT。
- store slug 未解決/日付欠落/INSERT エラーは **ログのみ**で注文フローは止めない（メールにフォールバック）。

| ID | テスト項目 | 前提条件 | 操作手順 | 期待結果 | 優先度 |
|----|-----------|----------|----------|----------|--------|
| API-TKO-001 | 正常受付（DB INSERT） | dev 起動・storeSlug が DB の店舗と一致 | 正常 JSON を POST | 200 `{ ok: true }`。`takeout_orders`+`takeout_order_items` に INSERT され注文受付に届く | 高 |
| API-TKO-002 | JSON 解析失敗 | — | 不正 body を POST | 400「リクエストの解析に失敗しました。」 | 中 |
| API-TKO-003 | 店舗/受取日時未選択 | — | store または dateLabel 空 | 400「受取店舗・受取日時を選択してください。」 | 高 |
| API-TKO-004 | 商品なし（空配列） | — | items=[] で POST | 400「商品が選択されていません。」 | 高 |
| API-TKO-005 | 合計金額が数値でない | — | total を文字列で POST | 400「合計金額が不正です。」 | 中 |
| API-TKO-006 | 氏名/カナ未入力 | — | customer.name/kana 空 | 400「お名前・フリガナを入力してください。」 | 高 |
| API-TKO-007 | メール形式不正 | — | customer.email 不正 | 400「メールアドレスが正しくありません。」 | 高 |
| API-TKO-008 | store slug 未解決でも注文成立 | storeSlug が DB に無い | 正常 JSON を POST | 200 `{ ok: true }`（DB INSERT はスキップ・警告ログのみ）。メールにフォールバック | 中 |
| API-TKO-009 | SMTP 未設定でも受付成立 | SMTP_* 未設定 | 正常 JSON を POST | 200 `{ ok: true }`。メール送信スキップ・注文は保存済み | 高 |
| API-TKO-010 | メール送信失敗でも受付成立 | SMTP 設定だが送信失敗 | 正常 JSON を POST | 200 `{ ok: true }`（失敗は握り潰し・注文保存済み） | 中 |
| API-TKO-011 | order_items 複数行 | — | items を複数で POST | 各 item が item_name/price/quantity で複数行 INSERT される | 中 |

## 回帰テスト

| ID | テスト項目 | 前提条件 | 操作手順 | 期待結果 | 優先度 | 備考 |
|----|-----------|----------|----------|----------|--------|------|
| API-REG-001 | service_role で INSERT 成功（GRANT） | dev 起動 | `/api/contact`・`/api/takeout` に正常 POST | permission denied (42501) にならず INSERT 成功する | 高 | ミスリスト 2026-06-11。MCP 作成テーブルの GRANT 漏れを `006_grants.sql` で解消 |
| API-REG-002 | .env の `$` エスケープで SMTP_PASS が正しく読まれる | SMTP_PASS に `$` を含む値 | `.env.local` で `$` を `\$` にエスケープし dev 起動 | パスワードが欠落せず正しい文字数で認証される（535 認証失敗にならない） | 中 | ミスリスト 2026-06-08。dotenv-expand が `$xxx` を変数展開し空になる問題 |
| API-REG-003 | SMTP 接続方式（465=SSL/587=STARTTLS） | SMTP 設定済 | 465 と 587 でそれぞれ送信 | `secure = SMTP_SECURE==="true" || port===465` の判定で正しく接続される | 低 | ミスリスト 2026-06-08 |
| API-REG-004 | お問い合わせ通知先フォールバック | `CONTACT_NOTIFY_TO` 未設定・`ORDER_NOTIFY_TO` 設定 | `/api/contact` に正常 POST | 通知先が `ORDER_NOTIFY_TO` にフォールバックされる | 低 | ミスリスト/ドキュメント 2026-06-08 |
| API-REG-005 | Brevo SMTP リレーで実送信が受信トレイに届く | `.env.local` に Brevo 設定（`SMTP_HOST=smtp-relay.brevo.com`/`PORT=587`/`SECURE=false`/`USER=...@smtp-brevo.com`/`PASS=<SMTPキー>`/`MAIL_FROM=焼肉平壌亭 <motoki.s@innovation-music.com>`）・Brevo でドメイン認証済 | `/api/takeout`・`/api/contact` に実 POST | お客様控え＋通知の計 4 通が**迷惑メールに入らず受信トレイ**に届く（Google Workspace 直送の隔離問題が解消） | 高 | ミスリスト 2026-06-12。コード無改修（env 駆動）。送信ドメインは SPF を 1 レコードに `include:spf.brevo.com` 追記＋DKIM CNAME×2＋確認 TXT、DMARC は既存据え置き |
| API-REG-006 | 管理画面パスワード再設定メールが Brevo 経由で到達 | Supabase Dashboard → Authentication → Emails → SMTP Settings に Brevo 登録・URL Configuration の Redirect URLs に `/auth/callback` 登録済 | `/admin/forgot-password` から再設定メールを送信 | リカバリーメールが受信トレイに届き、リンク → `/auth/callback` → セッション確立まで通る | 高 | ミスリスト 2026-06-12。アプリ側（Nodemailer）とは別に **Supabase Auth 側の SMTP** も Brevo に設定が必要（PWRESET-002/008 参照） |
