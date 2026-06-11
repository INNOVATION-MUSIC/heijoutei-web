# 採用情報管理 テストケース（RCRT）

対象: `/admin/recruitments`・`/admin/recruitments/new`・`/admin/recruitments/[id]/edit`。タグ（カラー付き複数）・募集要項テーブル（label/value 行）・summary・hero_image・本文・公開/非公開。

関連コード:
- `src/lib/actions/recruitments.ts`（`createRecruit`/`updateRecruit`/`deleteRecruit`/`replaceTags`/`replaceDetails`/`getRecruitTags`/`getRecruitDetails`）

設計メモ:
- `store_id`・`title` 必須。
- `is_published=true` のとき `published_at` は指定値 or 現在時刻。false のとき指定値 or null。
- タグは `recruitment_tags`、募集要項は `recruitment_details` を毎回 **総入れ替え**（空 label は除外・sort_order は配列順）。
- スキーマ拡張済: `summary`・`hero_image_url`（`007_recruit_presentation_cols.sql`）。
- 更新時 `revalidatePath('/recruit')` `/recruit/[id]`。
- フロント `/recruit` は `is_published=true` のみ（RLS `Public select recruitments`）。

| ID | テスト項目 | 前提条件 | 操作手順 | 期待結果 | 優先度 |
|----|-----------|----------|----------|----------|--------|
| RCRT-001 | 一覧表示 | ログイン・採用情報あり | `/admin/recruitments` を開く | 一覧が表示され公開/非公開が分かる | 高 |
| RCRT-002 | 新規作成（公開） | ログイン状態 | 店舗・タイトル・summary・hero_image・本文・タグ・募集要項行を入力し公開で保存 | 作成成功。`is_published=true`・`published_at`に時刻。details/tags が sort_order 順で保存 | 高 |
| RCRT-003 | 新規作成（非公開） | ログイン状態 | is_published=false で保存 | `is_published=false`・`published_at`=null。フロント `/recruit` に出ない | 高 |
| RCRT-004 | 店舗未選択 | ログイン状態 | 店舗を選ばず保存 | `{ error: '店舗を選択してください' }` | 高 |
| RCRT-005 | タイトル必須 | ログイン状態 | タイトル空で保存 | `{ error: 'タイトルは必須です' }` | 高 |
| RCRT-006 | 募集要項テーブル（行追加/削除） | ログイン状態 | label/value の行を複数追加し保存 → 編集で行を削除 | `recruitment_details` が総入れ替え。空 label 行は除外 | 中 |
| RCRT-007 | タグ複数・カラー | ログイン状態 | カラー付きタグを複数追加し保存 | `recruitment_tags` に sort_order 順で保存・color 反映 | 中 |
| RCRT-008 | summary / hero_image 保存 | ログイン状態 | summary・hero_image_url を入力し保存 | 両カラムが保存され、フロント一覧/詳細に反映（FRONT 側で確認） | 中 |
| RCRT-009 | 編集（更新） | 既存採用情報 | 本文・タグ・募集要項を変更し保存 | 値更新・tags/details 総入れ替え・revalidate | 高 |
| RCRT-010 | 削除 | 既存採用情報 | 削除を実行 | レコード削除（tags/details も CASCADE）・一覧から消える | 高 |
| RCRT-011 | 公開→非公開へ変更 | 公開済み | is_published=false に変更し保存 | フロント `/recruit` から消える | 中 |
| RCRT-012 | 未認証でアクション | ログアウト状態 | create/update/delete を呼ぶ | `{ error: '認証が必要です' }`。DB 変更なし | 高 |

## 回帰テスト

| ID | テスト項目 | 前提条件 | 操作手順 | 期待結果 | 優先度 | 備考 |
|----|-----------|----------|----------|----------|--------|------|
| RCRT-REG-001 | summary/hero_image_url カラムの存在 | DB マイグレーション適用済 | 採用情報を summary/hero_image 付きで保存 | カラム不在エラーにならず保存できる | 中 | ミスリスト 2026-06-11（`007` で回帰回避のためカラム追加） |
</content>
