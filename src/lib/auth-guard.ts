import { cookies } from 'next/headers'

// Server Action 用のクッキーベース認証チェック。
// getUser() は環境によってネットワーク呼び出しで失敗しうるため、クッキーの有無で判定する。
export async function isAuthed(): Promise<boolean> {
  const cookieStore = await cookies()
  return cookieStore
    .getAll()
    .some((c) => c.name.startsWith('sb-') && c.name.endsWith('-auth-token'))
}
