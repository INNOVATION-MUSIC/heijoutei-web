import { createClient } from '@/lib/supabase/server'
import { adminSupabase } from '@/lib/supabase/admin'

// 認証ガード。getUser() は Supabase Auth サーバにトークンを問い合わせ、
// 署名・期限・失効を検証する（getSession / クッキー存在チェックと違い偽装不可）。
export type Guard =
  | { ok: true; userId: string; role: string }
  | { ok: false; error: string }

// ログイン済みユーザーを検証し、profiles のロールを返す。
export async function requireAuth(): Promise<Guard> {
  const supabase = await createClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()
  if (error || !user) return { ok: false, error: '認証が必要です' }
  const { data: profile } = await adminSupabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()
  return { ok: true, userId: user.id, role: profile?.role ?? 'editor' }
}

// admin ロール必須（ユーザー管理など）。
export async function requireAdmin(): Promise<Guard> {
  const g = await requireAuth()
  if (!g.ok) return g
  if (g.role !== 'admin') return { ok: false, error: '権限がありません（管理者のみ）' }
  return g
}

// 既存の各 Server Action が使う簡易ブール版。実体は getUser 検証に統一。
export async function isAuthed(): Promise<boolean> {
  return (await requireAuth()).ok
}
