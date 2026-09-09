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
  store_ids: string[] | null
}

// 担当店舗を正規化。admin は常に全店なので null。editor は指定 UUID の配列（空なら null=本部）。
function normalizeStoreIds(role: string, storeIds?: string[] | null): string[] | null {
  if (role === 'admin') return null
  const clean = [...new Set((storeIds ?? []).map((s) => String(s).trim()).filter(Boolean))]
  return clean.length > 0 ? clean : null
}

export async function getUsers(): Promise<AdminUserRow[]> {
  // 直接 Server Action として呼ばれた場合に備えガード（メール一覧の漏洩防止）
  const guard = await requireAdmin()
  if (!guard.ok) return []
  const { data: profiles } = await adminSupabase
    .from('profiles')
    .select('id, full_name, role, created_at, avatar_url, store_ids')
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
    store_ids: p.store_ids,
  }))
}

export async function createUser(input: { email: string; password: string; full_name: string; role: string; avatar_url?: string; store_ids?: string[] | null }) {
  const guard = await requireAdmin()
  if (!guard.ok) return { error: guard.error }
  if (!input.email?.trim() || !input.password || input.password.length < 8) {
    return { error: 'メールアドレスと8文字以上のパスワードが必要です' }
  }
  const role = input.role === 'admin' ? 'admin' : 'editor'
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
      role,
      full_name: input.full_name?.trim() || null,
      avatar_url: input.avatar_url?.trim() || null,
      store_ids: normalizeStoreIds(role, input.store_ids),
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
    .select('id, full_name, role, created_at, avatar_url, store_ids')
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
    store_ids: p.store_ids,
  }
}

// スタッフ情報の更新（氏名・ロール・アイコン、任意でメール／パスワード）。
export async function updateUserProfile(
  id: string,
  input: { full_name: string; role: string; avatar_url?: string; email?: string; password?: string; store_ids?: string[] | null }
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
  const role = input.role === 'admin' ? 'admin' : 'editor'
  const { error } = await adminSupabase
    .from('profiles')
    .update({
      full_name: input.full_name?.trim() || null,
      role,
      avatar_url: input.avatar_url?.trim() || null,
      store_ids: normalizeStoreIds(role, input.store_ids),
    })
    .eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/admin/users')
  return { success: true }
}

export async function updateUserRole(id: string, role: string) {
  const guard = await requireAdmin()
  if (!guard.ok) return { error: guard.error }
  // admin へ変更した場合は担当店舗の制限を解除（常に全店）
  const patch = role === 'admin' ? { role: 'admin', store_ids: null } : { role: 'editor' }
  const { error } = await adminSupabase.from('profiles').update(patch).eq('id', id)
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
