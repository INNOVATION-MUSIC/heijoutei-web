'use server'

import { adminSupabase } from '@/lib/supabase/admin'
import { requireAdmin } from '@/lib/auth-guard'
import { revalidatePath } from 'next/cache'

export type AdminUserRow = {
  id: string
  email: string
  full_name: string | null
  role: string
  created_at: string | null
}

export async function getUsers(): Promise<AdminUserRow[]> {
  // 直接 Server Action として呼ばれた場合に備えガード（メール一覧の漏洩防止）
  const guard = await requireAdmin()
  if (!guard.ok) return []
  const { data: profiles } = await adminSupabase
    .from('profiles')
    .select('id, full_name, role, created_at')
    .order('created_at', { ascending: true })
  const { data: authData } = await adminSupabase.auth.admin.listUsers()
  const emailById = new Map((authData?.users ?? []).map((u) => [u.id, u.email ?? '']))
  return (profiles ?? []).map((p) => ({
    id: p.id,
    email: emailById.get(p.id) ?? '',
    full_name: p.full_name,
    role: p.role,
    created_at: p.created_at,
  }))
}

export async function createUser(input: { email: string; password: string; full_name: string; role: string }) {
  const guard = await requireAdmin()
  if (!guard.ok) return { error: guard.error }
  if (!input.email?.trim() || !input.password || input.password.length < 8) {
    return { error: 'メールアドレスと8文字以上のパスワードが必要です' }
  }
  const { data, error } = await adminSupabase.auth.admin.createUser({
    email: input.email.trim(),
    password: input.password,
    user_metadata: { full_name: input.full_name?.trim() || null },
    email_confirm: true,
  })
  if (error || !data.user) return { error: error?.message ?? '作成に失敗しました' }
  await adminSupabase
    .from('profiles')
    .update({ role: input.role === 'admin' ? 'admin' : 'editor', full_name: input.full_name?.trim() || null })
    .eq('id', data.user.id)
  revalidatePath('/admin/users')
  return { success: true }
}

export async function updateUserRole(id: string, role: string) {
  const guard = await requireAdmin()
  if (!guard.ok) return { error: guard.error }
  const { error } = await adminSupabase.from('profiles').update({ role: role === 'admin' ? 'admin' : 'editor' }).eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/admin/users')
  return { success: true }
}

export async function deleteUser(id: string) {
  const guard = await requireAdmin()
  if (!guard.ok) return { error: guard.error }
  const { error } = await adminSupabase.auth.admin.deleteUser(id)
  if (error) return { error: error.message }
  revalidatePath('/admin/users')
  return { success: true }
}
