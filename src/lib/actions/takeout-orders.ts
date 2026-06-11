'use server'

import { adminSupabase } from '@/lib/supabase/admin'
import { isAuthed } from '@/lib/auth-guard'
import { revalidatePath } from 'next/cache'

export type OrderStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed'

export async function toggleOrderRead(id: string, isRead: boolean) {
  if (!(await isAuthed())) return { error: '認証が必要です' }
  const { error } = await adminSupabase
    .from('takeout_orders')
    .update({ is_read: !isRead, read_at: !isRead ? new Date().toISOString() : null })
    .eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/admin/takeout-orders')
  return { success: true }
}

export async function updateOrderStatus(id: string, status: OrderStatus) {
  if (!(await isAuthed())) return { error: '認証が必要です' }
  const { error } = await adminSupabase.from('takeout_orders').update({ status }).eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/admin/takeout-orders')
  return { success: true }
}
