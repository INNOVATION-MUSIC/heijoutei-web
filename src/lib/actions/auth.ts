'use server'

import { createClient } from '@/lib/supabase/server'
import { adminSupabase } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'

// ログアウト：セッションを破棄してログイン画面へ
export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/admin/login')
}

// パスワード再設定の前段チェック：入力メールが登録ユーザーかどうかを返す。
// ※管理者専用CMS（公開サインアップ無し）のため、利便性優先で存在有無を返す。
//   一般公開フォームでは列挙対策のため秘匿すべき点に注意。
export async function adminEmailExists(email: string): Promise<boolean> {
  const target = email.trim().toLowerCase()
  if (!target) return false
  const perPage = 200
  for (let page = 1; page <= 25; page++) {
    const { data, error } = await adminSupabase.auth.admin.listUsers({ page, perPage })
    if (error || !data) return false
    if (data.users.some((u) => u.email?.toLowerCase() === target)) return true
    if (data.users.length < perPage) break
  }
  return false
}
