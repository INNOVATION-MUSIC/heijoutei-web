# 管理画面 認証・ルートガード テストケース（AUTH / PWRESET）

対象: `/admin/login`、`(protected)` ルートグループ、ログイン/ログアウト、admin 限定ページ、**パスワード再設定フロー（PWRESET）**、**パスワード表示トグル（PWUI）**。

関連コード:
- `src/app/admin/(protected)/layout.tsx`（cookie ベースのガード・未ログイン時 `/admin/login` へ redirect）
- `src/app/admin/login/page.tsx`（`signInWithPassword`・`?error=auth` 表示・「パスワードをお忘れの方」リンク・`Suspense` ラップ）
- `src/app/admin/forgot-password/page.tsx`（`adminEmailExists` 前段チェック → `resetPasswordForEmail`）
- `src/app/auth/callback/route.ts`（`exchangeCodeForSession` でセッション交換 → `next` へ遷移）
- `src/app/admin/reset-password/page.tsx`（`getSession` でリカバリーセッション確認 → `updateUser({password})`・`error.code` で出し分け）
- `src/components/admin/PasswordInput.tsx`（目アイコン表示トグル・`type` 以外の input 属性を透過）
- `src/lib/auth-guard.ts`（`isAuthed` — `sb-*-auth-token` クッキーの有無）
- `src/lib/actions/auth.ts`（`signOut` / `adminEmailExists` — Service Role `listUsers` でページング照合）
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

## パスワード再設定フロー（PWRESET）

設計メモ:
- フロー＝`/admin/login`「パスワードをお忘れの方」→ `/admin/forgot-password`（メール入力）→ メール内リンク → `/auth/callback`（`code` をセッション交換）→ `/admin/reset-password`（新パスワード入力）→ `/admin`。
- **PKCE / `@supabase/ssr` の標準リセットフロー**。`resetPasswordForEmail` の `redirectTo` は `${origin}/auth/callback?next=/admin/reset-password`。
- 実メール送信は **Brevo SMTP** で稼働（Supabase Dashboard → Authentication → Emails → SMTP Settings に Brevo 登録／URL Configuration の Redirect URLs に `/auth/callback` 登録済）。
- `forgot-password` は送信前に **`adminEmailExists`（Service Role `listUsers` 照合）** で未登録メールを弾く（管理者専用 CMS のため列挙対策より利便性を優先・コメント明記）。
- `reset-password` の `updateUser` 失敗は `error.code` で出し分け（`same_password` / `weak_password` / その他＝リンク失効等）。

### forgot-password（メール送信）

| ID | テスト項目 | 前提条件 | 操作手順 | 期待結果 | 優先度 |
|----|-----------|----------|----------|----------|--------|
| PWRESET-001 | お忘れリンクから遷移 | — | `/admin/login` で「パスワードをお忘れの方」をクリック | `/admin/forgot-password` が開き、ロゴ＋メール入力フォームが表示される | 中 |
| PWRESET-002 | 登録済みメールで送信 | 管理者 `motoki.s@innovation-music.com` 登録済 | 登録済みメールを入力し「再設定メールを送信」 | `adminEmailExists` が true → `resetPasswordForEmail` 実行。送信完了画面「パスワード再設定用のメールを送信しました。」が表示される。実メールが受信トレイに届く（Brevo） | 高 |
| PWRESET-003 | 未登録メールで送信 | — | 登録されていないメールを入力し送信 | 「このメールアドレスは登録されていません。」が表示され、**メールは送信されない**（送信前に弾く） | 高 |
| PWRESET-004 | 必須未入力で送信 | — | メール空のまま送信 | HTML 必須バリデーション（`required`・`type=email`）で送信がブロックされる | 低 |
| PWRESET-005 | 送信中ボタン状態 | — | 送信直後 | ボタンが「送信中...」になり `disabled` になる | 低 |
| PWRESET-006 | 送信失敗時の表示 | レート制限等の発生時（再現可能なら） | 短時間に連続送信してレート制限を誘発 | 「送信に失敗しました。しばらく時間をおいて再度お試しください。」が表示される（※実機/Brevo 状況依存＝要確認） | 低 |
| PWRESET-007 | ログイン画面に戻る | — | 入力画面/送信完了画面の「ログイン画面に戻る」を押下 | `/admin/login` に戻る | 低 |

### auth/callback（セッション交換）

| ID | テスト項目 | 前提条件 | 操作手順 | 期待結果 | 優先度 |
|----|-----------|----------|----------|----------|--------|
| PWRESET-008 | 正常なリカバリーリンク | 有効な再設定メールを受信 | メール内リンク（`/auth/callback?code=...&next=/admin/reset-password`）を開く | `exchangeCodeForSession` 成功 → `/admin/reset-password` へ redirect。リカバリーセッションが確立される | 高 |
| PWRESET-009 | code 無し / 交換失敗 | — | `/auth/callback`（code なし）または失効した code でアクセス | `/admin/login?error=auth` へ redirect。ログイン画面に「リンクが無効か、有効期限が切れています。再度お試しください。」が表示される | 高 |

### reset-password（新パスワード設定）

| ID | テスト項目 | 前提条件 | 操作手順 | 期待結果 | 優先度 |
|----|-----------|----------|----------|----------|--------|
| PWRESET-010 | セッション確認中表示 | リンク経由で遷移直後 | `/admin/reset-password` を開く | `getSession` 解決まで「確認中...」が表示される | 低 |
| PWRESET-011 | リカバリーセッションありで表示 | PWRESET-008 を経由 | reset-password を開く | 「新しいパスワードの設定」フォーム（新PW＋確認の 2 欄）が表示される | 高 |
| PWRESET-012 | セッション無し（リンク失効） | callback を経ずに直接 `/admin/reset-password` を開く | ページを開く | 「リンクが無効か、有効期限が切れています。」＋「パスワード再設定に戻る」リンクが表示される（フォームは出ない） | 高 |
| PWRESET-013 | 8文字未満 | リカバリーセッションあり | 7文字以下のパスワードを入力し送信 | 「パスワードは8文字以上で入力してください。」が表示され `updateUser` は呼ばれない | 中 |
| PWRESET-014 | 確認不一致 | リカバリーセッションあり | 新PWと確認PWを別の値にして送信 | 「パスワードが一致しません。」が表示され `updateUser` は呼ばれない | 中 |
| PWRESET-015 | 現在と同じパスワード | リカバリーセッションあり | 現行と同一のパスワードを入力し送信 | `updateUser` が `same_password` で失敗 → 「現在と同じパスワードは使用できません。別のパスワードを入力してください。」が表示される | 高 |
| PWRESET-016 | 脆弱なパスワード | リカバリーセッションあり・Supabase 側で強度ポリシー有効時 | 脆弱なパスワードを入力し送信 | `updateUser` が `weak_password` で失敗 → 「パスワードが脆弱です。より複雑なパスワードを入力してください。」が表示される（※ポリシー設定依存＝要確認） | 中 |
| PWRESET-017 | 更新成功 | リカバリーセッションあり・新規かつ 8 文字以上一致 | 有効な新パスワードを入力し送信 | 「パスワードを変更しました。」が表示され「管理画面へ」ボタンから `/admin` へ遷移。**新パスワードでログインできる** | 高 |
| PWRESET-018 | 更新中ボタン状態 | リカバリーセッションあり | 送信直後 | ボタンが「更新中...」になり `disabled` になる | 低 |

## パスワード表示トグル（PWUI）

設計メモ: `PasswordInput` は右端の目アイコンで `type` を `password`↔`text` に切替。`tabIndex=-1`・`aria-label` 切替・`pr-11` で余白確保。使用箇所＝`/admin/login`（1欄）・`/admin/reset-password`（新PW/確認の 2 欄）の計 3 欄。

| ID | テスト項目 | 前提条件 | 操作手順 | 期待結果 | 優先度 |
|----|-----------|----------|----------|----------|--------|
| PWUI-001 | ログイン欄の表示トグル | `/admin/login` | パスワード入力後に目アイコンを押下 | 入力値が平文表示（`type=text`）になる。再押下で再びマスク（`type=password`） | 中 |
| PWUI-002 | aria-label の切替 | `/admin/login` | 目アイコンの状態を切替 | `aria-label` が「パスワードを表示」↔「パスワードを隠す」で切替わる | 低 |
| PWUI-003 | Tab フォーカスから除外 | `/admin/login` | フォーム内で Tab 移動 | 目アイコンボタンは `tabIndex=-1` でフォーカスされない（入力→ログインボタンへ移動） | 低 |
| PWUI-004 | reset-password の 2 欄独立トグル | `/admin/reset-password`（セッションあり） | 新PW欄・確認欄それぞれの目アイコンを押下 | 各欄が独立して表示/非表示を切替できる | 低 |

## 管理画面ブランド UI（PWUI 以外・2026-06-11）

設計メモ: ログイン/サイドバーの「平壌亭CMS」テキストを白ロゴ `/images/logo.webp` に差替（ログイン＝ロゴのみ・サイドバー＝104×54センター）。サイドメニュー全14項目の絵文字を **白モノクロの Lucide 系 SVG ラインアイコン**（`stroke=currentColor` で文字色追従・`ICON_PATHS`+`NavIcon`）に統一。

| ID | テスト項目 | 前提条件 | 操作手順 | 期待結果 | 優先度 |
|----|-----------|----------|----------|----------|--------|
| BRAND-001 | ログイン画面のロゴ | — | `/admin/login` を開く | 「平壌亭CMS」テキストではなく白ロゴ `/images/logo.webp` が中央表示される | 低 |
| BRAND-002 | サイドバーのロゴ | ログイン状態 | `/admin` を開く | サイドバー上部に白ロゴ（104×54・センター）が表示される | 低 |
| BRAND-003 | サイドメニューの白アイコン | ログイン状態 | サイドバーを確認 | 全14項目が白モノクロの SVG ラインアイコンで統一され、絵文字が残っていない（`currentColor` 追従） | 低 |

## 回帰テスト

| ID | テスト項目 | 前提条件 | 操作手順 | 期待結果 | 優先度 | 備考 |
|----|-----------|----------|----------|----------|--------|------|
| AUTH-REG-001 | 管理画面の余白崩れ（Tailwind v4） | ログイン状態 | `/admin` および各管理ページを表示 | padding/margin/space/gap/角丸/グリッドが正しく効き、要素が詰まって表示されない | 高 | ミスリスト 2026-06-11。原因＝`globals.css` のレイヤー外 `*{margin:0;padding:0}` が Tailwind v4 ユーティリティを上書き。リセットを `@layer base{}` 内に移して解消 |
| AUTH-REG-002 | 未ログイン redirect の無限ループ回避 | ログアウト状態 | `/admin` → ログインページへ redirect 後、`/admin/login` がさらに redirect しないことを確認 | `/admin/login` で停止しループしない（login は `(protected)` 外） | 高 | layout.tsx コメント参照 |
| AUTH-REG-003 | 再設定失敗の誤メッセージ（同一PW） | リカバリーセッションあり | 現行と同じパスワードで更新 | 「リンク失効」ではなく「現在と同じパスワードは使用できません」が出る | 高 | ミスリスト 2026-06-12。真因は `updateUser` の `422 same_password` を一律「リンク失効」に丸めていた誤認。`error.code` で出し分けて解消（PWRESET-015） |
| AUTH-REG-004 | 未登録メールの区別 | — | `/admin/forgot-password` に未登録メールを入力 | 「登録されていません」が表示され送信されない（Supabase 既定は存在有無に関わらず成功を返すため、送信前にサーバー側で照合） | 中 | ミスリスト 2026-06-12。`adminEmailExists`（PWRESET-003） |
| AUTH-REG-005 | `useSearchParams` のビルドエラー回避 | — | `npm run build` を実行 | `/admin/login` の `useSearchParams` が `Suspense` でラップされ、ビルドが通る（prerender エラーが出ない） | 中 | ミスリスト 2026-06-11。`?error=auth` 表示のため導入 |
