'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

// ログアウト：セッションを破棄してログイン画面へ
export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/admin/login')
}
