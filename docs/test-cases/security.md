# セキュリティ テストケース（SEC）

対象: 認証ハードニング（getUser）・RLS/anon権限・Turnstile・Brevo HTTP API・Cloudflare 強化。
2026-06-12 のセキュリティ対応（HIGH 認可バイパス解消・anon書込権限剥奪 ほか）の回帰テスト。

関連コード/マイグレーション:
- `src/lib/auth-guard.ts`（`isAuthed`/`requireAuth`/`requireAdmin` — `getUser()` 検証）
- `src/proxy.ts`（セッション更新・matcher は `/admin`・`/auth`）
- `src/app/lib/email.ts`（Brevo HTTP API）・`src/app/lib/turnstile.ts`（siteverify）・`src/app/components/Turnstile.tsx`
- `supabase/migrations/010_tighten_anon_privileges.sql`（anon を SELECT 専用化・匿名INSERTポリシー削除）
- `supabase/migrations/011_revoke_event_trigger_fn_execute.sql`（`rls_auto_enable()` の EXECUTE 剥奪）

設計メモ:
- 管理操作の認可は **`getUser()`（Auth サーバで署名/期限/失効を検証）** に統一。クッキー存在チェックは廃止。
- フロントの anon キーは **読み取り専用**。公開フォーム（問い合わせ/注文）は `/api/*`（service_role）が INSERT。
- Turnstile/Brevo は **鍵未設定時は無効（graceful）**＝鍵を入れた時点で有効化。

---

## 認証・認可（getUser 化）

| ID | テスト項目 | 前提条件 | 操作手順 | 期待結果 | 優先度 | 検証状況 |
|----|-----------|----------|----------|----------|--------|----------|
| SEC-001 | 偽装クッキーで保護ページ突破不可 | ログアウト状態 | `sb-fake-auth-token=garbage` を付与し `/admin` へアクセス | `/admin/login` へリダイレクト（getUser が無効トークンを拒否） | 高 | ✅ 2026-06-12 実証（Playwright） |
| SEC-002 | 未ログインで保護ページ | クッキーなし | `/admin` `/admin/news` 等へアクセス | `/admin/login` へリダイレクト | 高 | ✅ 実証 |
| SEC-003 | 正規ログインで通過 | 有効な管理者 | ログイン → `/admin` | ダッシュボード表示・getUser 通過（再読込 ~232ms） | 高 | ✅ 実証 |
| SEC-004 | 認証済みで Server Action 実行 | ログイン状態 | `toggleMessageRead` 等を実行 | 成功する（`isAuthed`=getUser 通過） | 高 | ✅ 実証 |
| SEC-005 | 未認証で Server Action 直接呼び出し | クッキーなし/偽装 | コンテンツ系 action（news/stores 等）を直接 POST | `{ error: '認証が必要です' }`・DB 変更なし | 高 | 要再現（getUser→null） |
| SEC-006 | 非adminがユーザー管理 action | editor でログイン | `createUser`/`updateUserRole`/`deleteUser`/`getUsers` | `requireAdmin` で拒否（`権限がありません` / `getUsers` は空配列） | 高 | コード確認済 |
| SEC-007 | `getUsers` の直接呼び出し | クッキーなし | `getUsers()` を Server Action として呼ぶ | ガードで空配列（メール一覧を漏らさない） | 中 | コード確認済（ガード追加） |

## RLS / anon 権限（migration 010）

| ID | テスト項目 | 前提条件 | 操作手順 | 期待結果 | 優先度 | 検証状況 |
|----|-----------|----------|----------|----------|--------|----------|
| SEC-010 | anon の直接 INSERT 拒否 | 公開 anon キー | anon で `contact_messages`/`takeout_orders` に INSERT | `DENIED(42501)`（権限剥奪） | 高 | ✅ 実証 |
| SEC-011 | anon の直接 UPDATE/DELETE 拒否 | 公開 anon キー | anon で `news` 等を UPDATE | `DENIED(42501)` | 高 | ✅ 実証（UPDATE） |
| SEC-012 | anon の SELECT は維持 | 公開 anon キー | anon で公開 `news` を SELECT | 取得できる（フロント描画が継続） | 高 | ✅ 実証 |
| SEC-013 | anon は注文/問い合わせを読めない | 公開 anon キー | anon で `takeout_orders`/`contact_messages` を SELECT | 0 件（SELECT ポリシー無し＝情報漏洩なし） | 高 | ✅ 実証 |
| SEC-014 | 公開フォームは /api 経由で成立 | dev/prod 起動 | `/api/contact`・`/api/takeout` に正常 POST | 200・service_role で INSERT 成功（anon 剥奪後も動作） | 高 | ✅ 実証（200） |
| SEC-015 | 権限縮小の権限表 | — | `information_schema.role_table_grants` を確認 | anon: INSERT/UPDATE/DELETE=0・SELECT=21・service_role INSERT=21 | 中 | ✅ 実証 |
| SEC-016 | SECURITY DEFINER 関数の実行剥奪 | — | Supabase security advisor を実行 | `rls_auto_enable()` の anon/authenticated 実行 WARN が出ない | 中 | ✅ 実証（advisor 解消） |
| SEC-017 | フォーム3テーブルの RLS デフォルト拒否 | — | advisor の `rls_enabled_no_policy`(INFO) | contact_messages/takeout_orders/takeout_order_items はポリシー無し＝service_role 専用（意図どおり） | 低 | ✅ 想定どおり |

## Turnstile（CAPTCHA・鍵設定時のみ有効）

| ID | テスト項目 | 前提条件 | 操作手順 | 期待結果 | 優先度 | 検証状況 |
|----|-----------|----------|----------|----------|--------|----------|
| SEC-020 | 鍵未設定時は無効（graceful） | 鍵未設定 | `/contact`・`/takeout` から送信 | ウィジェット非表示・検証スキップ・送信成立（200） | 高 | ✅ 実証 |
| SEC-021 | 鍵設定時に無効トークン拒否 | `TURNSTILE_SECRET_KEY` 設定 | トークン無し/無効で `/api/*` に POST | 400「認証に失敗しました…」 | 高 | ✅ siteverify ロジック実証（常に失敗鍵→false） |
| SEC-022 | 鍵設定時に有効トークン通過 | 有効鍵+正規操作 | ウィジェット通過後に送信 | 検証成功し受付成立 | 高 | ✅ siteverify ロジック実証（常に成功鍵→true） |
| SEC-023 | ウィジェット未通過は送信不可 | 鍵設定 | 確認画面でウィジェット未操作 | 送信ボタンが `disabled` | 中 | コード確認済（`turnstileReady` ゲート） |

## メール（Brevo HTTP API・Cloudflare 互換）

| ID | テスト項目 | 前提条件 | 操作手順 | 期待結果 | 優先度 | 検証状況 |
|----|-----------|----------|----------|----------|--------|----------|
| SEC-030 | nodemailer/SMTP 非依存 | — | `/api/*` のコードを確認 | nodemailer import なし・`fetch` で Brevo API（Workers 互換） | 高 | ✅ コード確認 |
| SEC-031 | メール失敗でも受付成立（best-effort） | `BREVO_API_KEY` 未設定 or 送信失敗 | `/api/contact`・`/api/takeout` に正常 POST | 200・DB 保存済み（メールはスキップ/握り潰し） | 高 | ✅ 実証（200） |
| SEC-032 | 任意フィールド欠落で 500 にしない | storeTel 等を欠いた POST | `/api/*` に POST | 200（`escapeHtml` null安全＋try/catch） | 中 | ✅ 実証（回帰: 旧コードは try 内で隠蔽） |
| SEC-033 | 実送信（受信トレイ） | Brevo 本番キー | フォーム送信 | お客様控え＋通知が受信トレイ着信 | 高 | ⏭️ 手動（受信確認） |

## Cloudflare 設定（手順書側・手動）

| ID | テスト項目 | 期待結果 | 優先度 | 検証状況 |
|----|-----------|----------|--------|----------|
| SEC-040 | WAF レート制限 | `/api/contact`・`/api/takeout` の連投がブロック/チャレンジ | 中 | ⏭️ 手動（CFダッシュボード設定後） |
| SEC-041 | Supabase Auth レート制限 | login/recovery の連打が制限される | 中 | ⏭️ 手動 |
| SEC-042 | 漏洩パスワード保護 | 既知漏洩パスワードを拒否 | 中 | ⏭️ 手動（advisor WARN 解消で確認） |

> ✅=今回自動検証で実証 / コード確認済=実装レビューで確認 / ⏭️=手動・アカウント設定後に確認
