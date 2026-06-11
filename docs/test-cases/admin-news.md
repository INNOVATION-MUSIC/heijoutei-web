# お知らせ管理 テストケース（NEWS）

対象: `/admin/news`・`/admin/news/new`・`/admin/news/[id]/edit`。TipTap 本文・タグ（カラー付き複数）・公開/下書き/予約公開・スラッグ・revalidate。

関連コード:
- `src/lib/actions/news.ts`（`createNews` / `updateNews` / `deleteNews` / `getNewsTags`）
- `src/lib/slug.ts`（`generateSlug` — タイトルからスラッグ自動生成）
- `src/app/admin/(protected)/news/*`

設計メモ:
- `status`: `draft` / `published` / `scheduled`。
  - `draft` → `is_published=false`、`published_at` は指定値 or null
  - `published` / `scheduled` → `is_published=true`、`published_at` は指定値 or 現在時刻
- スラッグ未入力時は `generateSlug(title)` で自動生成。`news.slug` は UNIQUE 制約。
- タグは `news_tags` を毎回 **総入れ替え**（delete → insert、空ラベルは除外、`color` 既定 `green`、`sort_order` は配列順）。
- 更新後 `revalidatePath('/')` `/news` `/news/[id]`。
- 全アクションは冒頭で `isAuthed()` チェック。`title` 必須。

| ID | テスト項目 | 前提条件 | 操作手順 | 期待結果 | 優先度 |
|----|-----------|----------|----------|----------|--------|
| NEWS-001 | 一覧表示 | ログイン状態・news が複数件 | `/admin/news` を開く | お知らせ一覧が表示され、各行に公開/下書きバッジが出る | 高 |
| NEWS-002 | 新規作成（公開） | ログイン状態 | `/admin/news/new` でタイトル・本文（TipTap）・タグを入力し status=公開で保存 | 作成成功。`is_published=true`、`published_at` に時刻が入る。一覧に公開で表示 | 高 |
| NEWS-003 | 新規作成（下書き） | ログイン状態 | status=下書きで保存 | `is_published=false`。フロント `/news` には出ない | 高 |
| NEWS-004 | 予約公開 | ログイン状態 | status=予約公開 + 未来の `published_at` を指定して保存 | `is_published=true`・`published_at`=未来時刻で保存。フロント一覧は `published_at <= now` で絞るため未来分は非表示（FRONT 側で確認） | 高 |
| NEWS-005 | タイトル必須バリデーション | ログイン状態 | タイトル空で保存 | `{ error: 'タイトルは必須です' }`。作成されない | 高 |
| NEWS-006 | スラッグ自動生成 | ログイン状態 | スラッグ空でタイトルのみ入力し保存 | `generateSlug(title)` でスラッグが自動生成され保存される | 中 |
| NEWS-007 | スラッグ手動指定 | ログイン状態 | スラッグを明示入力し保存 | 入力したスラッグ（trim 済み）で保存される | 中 |
| NEWS-008 | 重複スラッグ（UNIQUE 違反） | 同一スラッグの news が既存 | 同じスラッグで別記事を保存 | UNIQUE 制約違反で `{ error: <DBメッセージ> }` を返す。作成されない | 高 |
| NEWS-009 | TipTap 本文の保存と再表示 | ログイン状態 | 見出し・太字・リスト等を含む本文を保存し、編集画面を再度開く | 入力した HTML がそのまま保存・復元される。フロント詳細でそのまま描画（FRONT 側で確認） | 高 |
| NEWS-010 | タグ複数・カラー指定 | ログイン状態 | カラー付きタグを複数追加して保存 | `news_tags` に sort_order 順で複数行 insert。color が反映 | 中 |
| NEWS-011 | タグ削除（総入れ替え） | タグ付き記事 | 編集でタグを削除/変更して保存 | 旧タグが全削除され新タグのみ残る。空ラベルのタグは保存されない | 中 |
| NEWS-012 | 編集（更新） | 既存記事 | タイトル・本文・status を変更し保存 | 値が更新され、`revalidatePath` でフロントへ反映 | 高 |
| NEWS-013 | 削除 | 既存記事 | 一覧/編集から削除 | レコード削除・`news_tags` も CASCADE 削除。一覧から消える | 高 |
| NEWS-014 | 未認証でアクション実行 | ログアウト状態 | `createNews`/`updateNews`/`deleteNews` を呼ぶ | `{ error: '認証が必要です' }`。DB 変更なし | 高 |
| NEWS-015 | 公開→下書きへ戻す | 公開済み記事 | status を下書きに変更して保存 | `is_published=false`。フロント一覧から消える | 中 |

## 回帰テスト

| ID | テスト項目 | 前提条件 | 操作手順 | 期待結果 | 優先度 | 備考 |
|----|-----------|----------|----------|----------|--------|------|
| NEWS-REG-001 | service_role での DB 操作成功（GRANT） | ログイン状態 | お知らせを新規作成・更新・削除 | permission denied (42501) にならず成功する | 高 | ミスリスト 2026-06-11。MCP 作成テーブルへの GRANT 漏れを `006_grants.sql` で解消（service_role に GRANT ALL） |
</content>
