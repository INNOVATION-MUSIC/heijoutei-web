'use server'

import { adminSupabase } from '@/lib/supabase/admin'
import { isAuthed } from '@/lib/auth-guard'
import { revalidatePath } from 'next/cache'

export async function toggleMessageRead(id: string, isRead: boolean) {
  if (!(await isAuthed())) return { error: '認証が必要です' }
  const { error } = await adminSupabase
    .from('contact_messages')
    .update({ is_read: !isRead, read_at: !isRead ? new Date().toISOString() : null })
    .eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/admin/contact')
  return { success: true }
}
