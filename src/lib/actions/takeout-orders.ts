'use server'

import { adminSupabase } from '@/lib/supabase/admin'
import { isAuthed, assertStoreAccess } from '@/lib/auth-guard'
import { revalidatePath } from 'next/cache'

export type OrderStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed'

async function orderStoreId(id: string): Promise<string | null> {
  const { data } = await adminSupabase.from('takeout_orders').select('store_id').eq('id', id).maybeSingle()
  return data?.store_id ?? null
}

export async function toggleOrderRead(id: string, isRead: boolean) {
  if (!(await isAuthed())) return { error: '認証が必要です' }
  const denied = await assertStoreAccess(await orderStoreId(id))
  if (denied) return { error: denied.error }
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
  const denied = await assertStoreAccess(await orderStoreId(id))
  if (denied) return { error: denied.error }
  const { error } = await adminSupabase.from('takeout_orders').update({ status }).eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/admin/takeout-orders')
  return { success: true }
}
