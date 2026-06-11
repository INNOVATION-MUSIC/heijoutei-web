# メディア・ユーザー管理 テストケース（MEDIA / USER）

対象:
- メディア `/admin/media`（Supabase Storage バケット `media`）
- ユーザー管理 `/admin/users`・`/admin/users/new`（**admin 限定**）

関連コード:
- `src/lib/actions/media.ts`（`deleteMedia`）
- `src/lib/actions/users.ts`（`getUsers`/`createUser`/`updateUserRole`/`deleteUser`/`requireAdmin`）

設計メモ（メディア）:
- Storage バケット `media` は Public（`004_storage_media.sql`）。
- `deleteMedia(path)`: 認証チェック後 `storage.from('media').remove([path])`。`/admin/media` を revalidate。

設計メモ（ユーザー）:
- 全アクションは `requireAdmin`（認証 + `profiles.role==='admin'`）を通過必須。
- `createUser`: メール必須・パスワード8文字以上。`auth.admin.createUser`（`email_confirm:true`）後、`profiles` の role/full_name を更新。role は admin/editor 以外は editor に正規化。
- `getUsers`: `profiles` と `auth.admin.listUsers` を突き合わせ email を補完。
- `updateUserRole` / `deleteUser` も admin 限定。

---

## メディア（MEDIA）

| ID | テスト項目 | 前提条件 | 操作手順 | 期待結果 | 優先度 |
|----|-----------|----------|----------|----------|--------|
| MEDIA-001 | メディア一覧表示 | ログイン・media に画像あり | `/admin/media` を開く | Storage の画像一覧が表示される | 高 |
| MEDIA-002 | 画像アップロード | ログイン状態 | 画像をアップロード | `media` バケットに保存され一覧に表示・Public URL で参照可（※アップロード UI 経路は実機確認） | 高 |
| MEDIA-003 | 画像削除 | media に画像あり | `deleteMedia(path)` を実行 | Storage から削除・一覧から消える・revalidate | 高 |
| MEDIA-004 | 未認証で削除 | ログアウト状態 | `deleteMedia` を呼ぶ | `{ error: '認証が必要です' }`。削除されない | 高 |
| MEDIA-005 | Public 参照 | media に画像あり | 画像の公開 URL に直接アクセス | 認証不要で画像が表示される（Public バケット） | 中 |

---

## ユーザー管理（USER・admin 限定）

| ID | テスト項目 | 前提条件 | 操作手順 | 期待結果 | 優先度 |
|----|-----------|----------|----------|----------|--------|
| USER-001 | 一覧表示（email 補完） | admin でログイン | `/admin/users` を開く | profiles + auth から email 付きで一覧表示（created_at 昇順） | 高 |
| USER-002 | ユーザー新規作成 | admin でログイン | メール・8文字以上パスワード・氏名・role を入力し作成 | auth ユーザー作成 + profiles の role/full_name 更新・一覧に追加 | 高 |
| USER-003 | パスワード8文字未満 | admin でログイン | 7文字以下のパスワードで作成 | `{ error: 'メールアドレスと8文字以上のパスワードが必要です' }` | 高 |
| USER-004 | メール空 | admin でログイン | メール空で作成 | 同上エラー。作成されない | 高 |
| USER-005 | role 正規化 | admin でログイン | role に admin/editor 以外を渡す | editor に正規化されて保存される | 中 |
| USER-006 | ロール変更 | admin でログイン | 既存ユーザーの role を変更 | `profiles.role` が更新される（admin/editor へ正規化） | 中 |
| USER-007 | ユーザー削除 | admin でログイン | 既存ユーザーを削除 | `auth.admin.deleteUser` で削除・一覧から消える | 中 |
| USER-008 | editor が操作（権限なし） | editor でログイン | create/update/delete を実行 | `{ error: '権限がありません（管理者のみ）' }`。DB 変更なし | 高 |
| USER-009 | 未認証で操作 | ログアウト状態 | create/update/delete を実行 | `{ error: '認証が必要です' }` | 高 |
