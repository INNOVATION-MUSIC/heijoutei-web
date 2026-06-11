'use server'

import { adminSupabase } from '@/lib/supabase/admin'
import { isAuthed } from '@/lib/auth-guard'
import { revalidatePath } from 'next/cache'

export async function deleteMedia(path: string) {
  if (!(await isAuthed())) return { error: '認証が必要です' }
  const { error } = await adminSupabase.storage.from('media').remove([path])
  if (error) return { error: error.message }
  revalidatePath('/admin/media')
  return { success: true }
}
