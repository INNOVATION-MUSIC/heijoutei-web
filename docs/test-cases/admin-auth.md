# 管理画面 認証・ルートガード テストケース（AUTH）

対象: `/admin/login`、`(protected)` ルートグループ、ログイン/ログアウト、admin 限定ページ。

関連コード:
- `src/app/admin/(protected)/layout.tsx`（cookie ベースのガード・未ログイン時 `/admin/login` へ redirect）
- `src/app/admin/login/page.tsx`（`signInWithPassword`）
- `src/lib/auth-guard.ts`（`isAuthed` — `sb-*-auth-token` クッキーの有無）
- `src/lib/actions/auth.ts`（`signOut`）
- `src/lib/actions/users.ts`（`requireAdmin` — admin ロール確認）

設計メモ:
- 認証判定は **クッキー（`sb-` 始まり・`-auth-token` 終わり）の有無**。`getUser()` はネットワーク失敗を避けるため未使用。
- `/admin/login` は `(protected)` グループ **外** にあるため、未ログイン redirect の無限ループは発生しない。
- `(protected)/layout.tsx` は `export const dynamic = 'force-dynamic'`。

| ID | テスト項目 | 前提条件 | 操作手順 | 期待結果 | 優先度 |
|----|-----------|----------|----------|----------|--------|
| AUTH-001 | 未ログインで保護ページへアクセス | ログアウト状態（auth クッキーなし） | ブラウザで `/admin` を開く | `/admin/login` へリダイレクトされる（HTTP 307）。ダッシュボードは表示されない | 高 |
| AUTH-002 | 未ログインで各保護サブページへアクセス | ログアウト状態 | `/admin/news` `/admin/stores` `/admin/takeout-orders` 等を直接開く | いずれも `/admin/login` へ 307 リダイレクト | 高 |
| AUTH-003 | 正しい資格情報でログイン | 管理者ユーザー作成済 | `/admin/login` でメール `motoki.s@innovation-music.com` と正パスワードを入力し「ログイン」 | ログイン成功し `/admin`（ダッシュボード）へ遷移。サイドバー・トップバーが表示される | 高 |
| AUTH-004 | 誤った資格情報でログイン | — | 誤ったパスワードでログイン | 「メールアドレスまたはパスワードが正しくありません」が表示。遷移しない | 高 |
| AUTH-005 | 必須未入力でログイン | — | メール/パスワード空のまま送信 | HTML 必須バリデーション（`required`）で送信がブロックされる | 中 |
| AUTH-006 | ログイン中ボタン状態 | — | ログイン送信直後 | ボタンが「ログイン中...」になり `disabled` になる | 低 |
| AUTH-007 | ログアウト | ログイン状態 | トップバー等からログアウト（`signOut`）を実行 | セッション破棄され `/admin/login` へ redirect。以降の保護ページは AUTH-001 と同じ挙動 | 高 |
| AUTH-008 | ログイン済みでログインページ再訪 | ログイン状態 | `/admin/login` を開く | ログインフォームが表示される（※自動リダイレクトの有無は実機で確認＝要確認） | 低 |
| AUTH-009 | プロフィール/未読バッジ表示 | ログイン状態・未読の注文/問い合わせが存在 | `/admin` を開く | サイドバーに「注文受付」「お問い合わせ」の未読件数バッジが表示される（`takeout_orders`/`contact_messages` の `is_read=false` 件数） | 中 |
| AUTH-010 | サイドバーのロール表示 | editor ユーザーでログイン | `/admin` を開く | `userRole` が editor として渡る。admin 限定メニュー（ユーザー管理）の扱いを確認（下記 AUTH-012） | 中 |

## admin 限定（ユーザー管理）

| ID | テスト項目 | 前提条件 | 操作手順 | 期待結果 | 優先度 |
|----|-----------|----------|----------|----------|--------|
| AUTH-011 | admin がユーザー管理を操作 | admin でログイン | `/admin/users` で一覧表示・ユーザー作成/ロール変更/削除を実行 | 各操作が成功する（`requireAdmin` を通過） | 高 |
| AUTH-012 | editor がユーザー管理 Server Action を実行 | editor でログイン（または手動でアクション呼び出し） | `createUser` / `updateUserRole` / `deleteUser` を実行 | `{ error: '権限がありません（管理者のみ）' }` が返り、DB は変更されない | 高 |
| AUTH-013 | 未ログインでユーザー管理 Server Action | ログアウト状態 | `createUser` 等を直接呼び出し | `{ error: '認証が必要です' }` が返る | 高 |

## 回帰テスト

| ID | テスト項目 | 前提条件 | 操作手順 | 期待結果 | 優先度 | 備考 |
|----|-----------|----------|----------|----------|--------|------|
| AUTH-REG-001 | 管理画面の余白崩れ（Tailwind v4） | ログイン状態 | `/admin` および各管理ページを表示 | padding/margin/space/gap/角丸/グリッドが正しく効き、要素が詰まって表示されない | 高 | ミスリスト 2026-06-11。原因＝`globals.css` のレイヤー外 `*{margin:0;padding:0}` が Tailwind v4 ユーティリティを上書き。リセットを `@layer base{}` 内に移して解消 |
| AUTH-REG-002 | 未ログイン redirect の無限ループ回避 | ログアウト状態 | `/admin` → ログインページへ redirect 後、`/admin/login` がさらに redirect しないことを確認 | `/admin/login` で停止しループしない（login は `(protected)` 外） | 高 | layout.tsx コメント参照 |
</content>
