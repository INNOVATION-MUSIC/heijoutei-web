# 焼肉平壌亭 Web — テストケース仕様書（索引）

CMS 管理画面・Supabase 連携・フロント動的化など **実装/検証が完了済みの機能** を対象としたテストケース仕様書です。
未実装・据え置き・SP 未対応の機能（ミスリストの「未解決」項目）は対象外です。

最終更新: 2026-06-12

---

## テストの前提環境

| 項目 | 内容 |
|------|------|
| DB | 本番 Supabase プロジェクト `prj_heijoutei`（ref `ucapzxfkyqzwzdpsumwo`・東京リージョン） |
| 管理者ユーザー | `motoki.s@innovation-music.com`（`profiles.role = 'admin'`・作成済） |
| 起動 | リポジトリルートで `npm run dev` → `http://localhost:3000` |
| 管理画面ログイン | `http://localhost:3000/admin/login` |
| 管理画面 DB アクセス | 全 Server Action は `adminSupabase`（Service Role・RLS バイパス）+ cookie 認証チェック + `revalidatePath` |
| フロント DB アクセス | `createStaticClient`（anon）で SELECT。DB 空/失敗時は静的データへフォールバック |
| ISR | フロント各ページ `export const revalidate = 60`。管理更新時は `revalidatePath` で即時クリア |
| メール | SMTP_* 環境変数共用。未設定でも DB 受付は成立（best-effort 送信） |

### 補足（テスト時の注意）

- 本番 Supabase に直接書き込むため、テストデータの作成/削除は後始末すること（特に店舗・カテゴリ・公開お知らせ）。
- 認証はクッキー（`sb-*-auth-token`）の有無で判定する設計（`getUser()` のネットワーク失敗を避けるため）。テスト時はブラウザのクッキー状態に留意する。
- フロントの DB 反映確認は `revalidate=60`（最大60秒）または管理更新時の `revalidatePath` 即時クリアのいずれかで行う。

---

## テストケースの記法

各仕様書はテーブル形式。列は以下のとおり。

| 列 | 説明 |
|----|------|
| ID | 機能プレフィックス + 連番（例 `AUTH-001` / `NEWS-001`） |
| テスト項目 | 何を確認するか |
| 前提条件 | 実行前に整えておく状態 |
| 操作手順 | 実際の操作 |
| 期待結果 | 合格条件 |
| 優先度 | 高 / 中 / 低 |

- **回帰テスト** … ミスリストの「解決済み」に記録された不具合の再発防止ケース。ID に `-REG` を含め、備考にミスリスト日付を記載。
- **※要確認** … 実コード/仕様書で断定できなかった挙動。テスト実施時に実機で確認すること。

---

## 仕様書一覧

| ファイル | 機能領域 | 主なプレフィックス |
|----------|----------|--------------------|
| [admin-auth.md](./admin-auth.md) | 認証・ルートガード・パスワード再設定・表示トグル・ブランド UI | AUTH / PWRESET / PWUI / BRAND |
| [admin-news.md](./admin-news.md) | お知らせ CRUD（TipTap・タグ・公開状態）・ダッシュボード | NEWS / DASH |
| [admin-stores.md](./admin-stores.md) | 店舗 CRUD（画像・並び順・マスタ連動） | STORE |
| [admin-menu.md](./admin-menu.md) | メニュー / コース / テイクアウトメニュー / カテゴリ | MENU / COURSE / TKMENU / CAT |
| [admin-recruit.md](./admin-recruit.md) | 採用情報 CRUD | RCRT |
| [admin-takeout-orders-contact.md](./admin-takeout-orders-contact.md) | 注文受付・問い合わせ・受付枠・営業カレンダー | ORD / CNT / SLOT / BCAL |
| [admin-media-users.md](./admin-media-users.md) | メディア(Storage)・ユーザー管理(admin限定) | MEDIA / USER |
| [front-dynamic.md](./front-dynamic.md) | フロント動的化（DB描画・店舗別切替・フォールバック・ISR） | FRONT |
| [api-contact-takeout.md](./api-contact-takeout.md) | /api/contact・/api/takeout（INSERT・メール・検証） | API |
| [security.md](./security.md) | 認証ハードニング・RLS/anon権限・Turnstile・Brevo・Cloudflare強化 | SEC |

---

## 主要な回帰テスト（横断）

ミスリストの「解決済み」に記録された致命的不具合は、以下の各仕様書に回帰ケースとして配置しています。

| 内容 | 配置先 | ミスリスト日付 |
|------|--------|----------------|
| MCP 作成テーブルの GRANT 漏れ → service_role でも permission denied | admin-news / api-contact-takeout | 2026-06-11 |
| Tailwind v4 で管理画面の余白が全潰れ（リセットを @layer base に） | admin-auth | 2026-06-11 |
| 'use server' ファイルの同期 export 不可 | admin-menu | 2026-06-11 |
| .env の `$` 未エスケープで SMTP_PASS が欠落 | api-contact-takeout | 2026-06-08 |
| DB 空時の静的フォールバック | front-dynamic | 2026-06-11 |
| パスワード再設定失敗を一律「リンク失効」に丸めていた（真因は同一PW） | admin-auth | 2026-06-12 |
| 未登録メールでも成功扱い → 送信前にサーバー側で存在照合 | admin-auth | 2026-06-12 |
| `useSearchParams` を `Suspense` でラップせずビルドエラー | admin-auth | 2026-06-11 |
| Brevo SMTP リレー移行で実メールが受信トレイに届く（隔離解消） | api-contact-takeout | 2026-06-12 |
