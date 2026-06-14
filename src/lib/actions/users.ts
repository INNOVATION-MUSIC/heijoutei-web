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
  avatar_url: string | null
}

export async function getUsers(): Promise<AdminUserRow[]> {
  // 直接 Server Action として呼ばれた場合に備えガード（メール一覧の漏洩防止）
  const guard = await requireAdmin()
  if (!guard.ok) return []
  const { data: profiles } = await adminSupabase
    .from('profiles')
    .select('id, full_name, role, created_at, avatar_url')
    .order('created_at', { ascending: true })
  const { data: authData } = await adminSupabase.auth.admin.listUsers()
  const emailById = new Map((authData?.users ?? []).map((u) => [u.id, u.email ?? '']))
  return (profiles ?? []).map((p) => ({
    id: p.id,
    email: emailById.get(p.id) ?? '',
    full_name: p.full_name,
    role: p.role,
    created_at: p.created_at,
    avatar_url: p.avatar_url,
  }))
}

export async function createUser(input: { email: string; password: string; full_name: string; role: string; avatar_url?: string }) {
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
    .update({
      role: input.role === 'admin' ? 'admin' : 'editor',
      full_name: input.full_name?.trim() || null,
      avatar_url: input.avatar_url?.trim() || null,
    })
    .eq('id', data.user.id)
  revalidatePath('/admin/users')
  return { success: true }
}

// ユーザーのアイコン（プロフィール画像）を設定／削除する。
export async function updateUserAvatar(id: string, avatar_url: string) {
  const guard = await requireAdmin()
  if (!guard.ok) return { error: guard.error }
  const { error } = await adminSupabase.from('profiles').update({ avatar_url: avatar_url || null }).eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/admin/users')
  return { success: true }
}

// 編集画面用に1ユーザーを取得（プロフィール＋メール）。
export async function getUser(id: string): Promise<AdminUserRow | null> {
  const guard = await requireAdmin()
  if (!guard.ok) return null
  const { data: p } = await adminSupabase
    .from('profiles')
    .select('id, full_name, role, created_at, avatar_url')
    .eq('id', id)
    .single()
  if (!p) return null
  const { data: authUser } = await adminSupabase.auth.admin.getUserById(id)
  return {
    id: p.id,
    email: authUser?.user?.email ?? '',
    full_name: p.full_name,
    role: p.role,
    created_at: p.created_at,
    avatar_url: p.avatar_url,
  }
}

// スタッフ情報の更新（氏名・ロール・アイコン、任意でメール／パスワード）。
export async function updateUserProfile(
  id: string,
  input: { full_name: string; role: string; avatar_url?: string; email?: string; password?: string }
) {
  const guard = await requireAdmin()
  if (!guard.ok) return { error: guard.error }
  // Auth 側（メール／パスワード）をまとめて更新。管理者操作なので email_confirm で確認メール不要。
  const authUpdate: { email?: string; password?: string; email_confirm?: boolean } = {}
  if (input.email?.trim()) {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email.trim())) return { error: 'メールアドレスの形式が正しくありません' }
    authUpdate.email = input.email.trim()
    authUpdate.email_confirm = true
  }
  if (input.password) {
    if (input.password.length < 8) return { error: 'パスワードは8文字以上で入力してください' }
    authUpdate.password = input.password
  }
  if (Object.keys(authUpdate).length > 0) {
    const { error: authErr } = await adminSupabase.auth.admin.updateUserById(id, authUpdate)
    if (authErr) return { error: authErr.message }
  }
  const { error } = await adminSupabase
    .from('profiles')
    .update({
      full_name: input.full_name?.trim() || null,
      role: input.role === 'admin' ? 'admin' : 'editor',
      avatar_url: input.avatar_url?.trim() || null,
    })
    .eq('id', id)
  if (error) return { error: error.message }
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
