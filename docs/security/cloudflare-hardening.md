# セキュリティ強化・Cloudflare デプロイ手順書

heijoutei-web を Cloudflare にデプロイする前提での、セキュリティ設定とアカウント側の手順をまとめる。
コード側の対応（認証ハードニング・anon権限縮小・Brevo HTTP API化・Turnstile実装）は適用済み。本書は **あなたがダッシュボードで行う設定** と **必要な環境変数** を示す。

最終更新: 2026-06-19

---

## OpenNext デプロイ構成（2026-06-19 導入）

Next.js 16 を Cloudflare Workers で動かすため `@opennextjs/cloudflare` を導入済み。

### 追加・変更したファイル
- `wrangler.jsonc`（Worker 名 `heijoutei-web` / `main=.open-next/worker.js` / `nodejs_compat` / ASSETS バインディング）
- `open-next.config.ts`（最小構成。ISR を跨インスタンス永続化したくなったら R2 を追加）
- `next.config.ts`（`initOpenNextCloudflareForDev()` を追加。死んでいた `serverExternalPackages:["nodemailer"]` を削除）
- `package.json`（`preview`/`deploy`/`cf-typegen` スクリプト追加。未使用の `nodemailer`/`@types/nodemailer` を削除＝メールは Brevo HTTP API のみ）
- `.dev.vars.example`（ローカル `npm run preview` 用の env テンプレ。実値は `.dev.vars` にコピー＝gitignore 済）

### Cloudflare ダッシュボードの「Set up your application」での入力値
| 項目 | 値 |
|------|----|
| Project name | `heijoutei-web` |
| **Build command** | `npx opennextjs-cloudflare build` |
| **Deploy command** | `npx opennextjs-cloudflare deploy` |

> ウィザード既定の `npm run build` / `npx wrangler deploy` のままでは動かない（OpenNext のバンドルを経由しないため）。必ず上記に変更する。
> 環境変数は「Advanced settings」または作成後の Settings → Variables and Secrets で本書 §0 のとおり登録する。

### ⚠️ Proxy(middleware) を撤去した（重要・設計判断）
- **Next.js 16 の Proxy(旧 middleware) は Node.js ランタイム固定**で、`runtime:'edge'` を指定するとビルドエラー（`Proxy does not support Edge runtime`）。一方 **OpenNext(現行) は Node.js middleware 未対応**でビルドが弾かれる＝両立不可。
- 元の `src/proxy.ts` は **認可ではなく Supabase セッションの楽観的トークン更新だけ**（認可の本体は `layout` / 各 Server Action の `getUser()` 検証側）だったため **削除**した。**セキュリティ低下なし**（全保護リクエストは `getUser()` で署名/期限/失効を検証）。
- 代償は **セッション延命のみ**：アクセストークン失効（既定1時間）後、Server Action を伴わない GET 遷移ではリフレッシュ後の Cookie を Server Component が書けず、再ログインが要る場合がある。
  - **緩和（ダッシュボード設定のみ・コード不要）**：Supabase → Authentication → Sessions で **Refresh token reuse interval を延長**、必要なら **Refresh token rotation を無効化**（管理者専用 CMS のため実用上の影響は軽微）。
    - ✅ **2026-06-19 実施済み**：Supabase ダッシュボードでリフレッシュトークンの扱いを緩和し、proxy 撤去によるセッション延命問題に対応。
  - 将来 OpenNext が Node middleware に対応したら `git revert` で `proxy.ts` を復活できる。

### ローカル検証メモ
- `npx opennextjs-cloudflare build` は **Node 20 で成功**（`.open-next/worker.js` 生成）。
- ただし **wrangler 4.x は Node.js 22以上が必須**＝ローカルの `npm run preview` / `npm run deploy` は Node22 が要る（現環境は v20.19.4）。**Cloudflare の Workers Builds(CI) は Node22+ なのでデプロイ自体は問題なし**。ローカルでプレビューしたい場合のみ nvm/volta 等で Node22 を用意する。

---

## 0. 必要な環境変数（Cloudflare のプロジェクト設定 / Secrets に登録）

| 変数 | 用途 | 必須 | 備考 |
|------|------|------|------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 接続 | ○ | 既存 |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon（読み取り専用） | ○ | 既存。公開してよい |
| `SUPABASE_SERVICE_ROLE_KEY` | 管理操作・API の INSERT | ○ | **Secret。絶対公開しない** |
| `BREVO_API_KEY` | メール送信（HTTP API） | ○ | **新規。下記 1 で発行** |
| `MAIL_FROM` | 差出人（`焼肉平壌亭 <addr@domain>`） | ○ | 既存 |
| `ORDER_NOTIFY_TO` | 注文通知の宛先 | ○ | 既存 |
| `CONTACT_NOTIFY_TO` | 問い合わせ通知の宛先 | 任意 | 無ければ `ORDER_NOTIFY_TO` に集約 |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Turnstile ウィジェット | 任意 | **新規。下記 3。未設定ならCAPTCHA無効** |
| `TURNSTILE_SECRET_KEY` | Turnstile サーバー検証 | 任意 | **新規。Secret。未設定なら検証スキップ** |

> 旧 `SMTP_HOST/PORT/SECURE/USER/PASS` は **不要**（nodemailer/SMTP は Cloudflare Workers で動かないため廃止）。ローカルで使う場合のみ残してよいが、本番では `BREVO_API_KEY` を使う。

---

## 1. Brevo HTTP API キーの発行（メールが届くために必須）

> nodemailer/SMTP は Cloudflare では動かないため、Brevo の **HTTP API** に切替済み。SMTPキーとは別物の「APIキー」が必要。

1. Brevo 管理画面 → 右上アカウント → **SMTP & API** → **API Keys** タブ
2. **Generate a new API key** → 名前（例 `heijoutei-cloudflare`）→ 発行された `xkeysib-...` をコピー
3. Cloudflare のプロジェクト環境変数に `BREVO_API_KEY=xkeysib-...` を登録（Secret）
4. 送信ドメイン認証（SPF/DKIM）は既存の Brevo 設定を流用（移行済み）。`MAIL_FROM` のドメインが Brevo で認証済みであること

---

## 2. Cloudflare WAF レート制限（フォーム連投対策・コード不要）

> 対象は **アプリを通る** `/api/contact`・`/api/takeout` のみ。ログイン/パスワード再設定はSupabaseへ直接飛ぶため、ここでは止められない（→ 4 を参照）。

Cloudflare ダッシュボード → 対象ゾーン → **Security → WAF → Rate limiting rules** → **Create rule**

- **Rule name**: `form-abuse`
- **If incoming requests match**（Edit expression）:
  ```
  (http.request.uri.path in {"/api/contact" "/api/takeout"} and http.request.method eq "POST")
  ```
- **Rate**: `5` requests per `1 minute`
- **Counting characteristics**: `IP`
- **Then take action**: `Block`（または `Managed Challenge`）/ **Duration**: `10 minutes`

> 目安は5回/分。実運用で誤検知が出れば緩める。

---

## 3. Cloudflare Turnstile（CAPTCHA・ボット根絶／コードは実装済み）

1. Cloudflare ダッシュボード → **Turnstile** → **Add widget**
   - **Widget name**: `heijoutei-forms`
   - **Hostname**: 本番ドメイン（＋必要なら `localhost`）
   - **Widget Mode**: `Managed`（推奨）
2. 発行された **Site Key** と **Secret Key** を控える
3. Cloudflare のプロジェクト環境変数に登録:
   - `NEXT_PUBLIC_TURNSTILE_SITE_KEY=0x...`（公開可）
   - `TURNSTILE_SECRET_KEY=0x...`（Secret）
4. これだけで `/contact`・`/takeout` の確認画面にウィジェットが出現し、サーバー側で検証される。
   **未設定の間はウィジェット非表示・検証スキップ**（＝今は無効、鍵を入れた瞬間に有効化）。

> 動作確認用のテスト鍵（Cloudflare公式）: 常に成功 `1x00000000000000000000AA` / 常に失敗 `2x00000000000000000000AA`（Secretは末尾AA違い）。本番では必ず実鍵に。

---

## 4. Supabase Auth のレート制限・パスワード保護（ログイン総当たり対策）

> ログイン（`signInWithPassword`）・再設定（`resetPasswordForEmail`）は Supabase へ直接通信するため、Supabase 側で設定する。

Supabase ダッシュボード → **Authentication**:
- **Rate Limits**: sign-in / token / password-recovery / email の上限を引き下げ（既定より厳しめに）
- **Policies / Passwords**: **Leaked password protection を有効化**（HaveIBeenPwned 照合）／最小文字数を 8 以上に

> **実施記録（2026-06-19）**
> - ✅ Minimum password length を 8 以上に設定（Auth Providers → Email）
> - ✅ Allow new users to sign up を **OFF**（公開サインアップ無効化。管理者は service role スクリプトで作成するため影響なし）
> - 🔶 **保留：Prevent use of leaked passwords（漏洩PW保護）** — 既存ユーザーへの影響があるため**先方確認後に対応**
> - 🔶 未対応：Rate Limits の引き下げ

---

## 5.（任意）media バケットの一覧禁止

公開バケット `media` は広い SELECT ポリシーで匿名のファイル一覧が可能。公開URL配信には不要なので、対策する場合は次を適用（画像配信・管理画面のメディア一覧＝service_role には影響なし）:

```sql
DROP POLICY IF EXISTS "Public can read media" ON storage.objects;
```

> **実施記録（2026-06-19）**：✅ 本番DBに適用済み（SQL Editor で実行・`Success. No rows returned`）。再現性のため `supabase/migrations/012_media_no_anon_list.sql` としてコミット。匿名の一覧列挙のみ禁止＝公開画像配信・管理画面のメディア一覧（service_role）・アップロード（INSERT ポリシー）には影響なし。

---

## 適用後の確認
- メール: `/contact`・`/takeout` から実送信 → 受信トレイ着信（Brevo HTTP API）
- Turnstile: 鍵設定後、確認画面にウィジェット表示 → 未操作だと送信ボタン無効
- WAF: `/api/*` に短時間で連投 → ブロック/チャレンジ
- 既存の認証/RLS 回帰は `docs/test-cases/security.md`（SEC-xxx）を参照
