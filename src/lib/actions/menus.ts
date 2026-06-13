'use server'

import { adminSupabase } from '@/lib/supabase/admin'
import { isAuthed } from '@/lib/auth-guard'
import { revalidatePath } from 'next/cache'
import type { Tables } from '@/types/supabase'

export type MenuItemInput = {
  name: string
  description?: string | null
  price_label?: string | null
  image_url?: string | null
}

export type StoreMenuPayload = {
  store_id: string
  category_id: string | null
  is_active?: boolean
  sort_order?: number
}

function revalidateMenus() {
  revalidatePath('/menu')
  revalidatePath('/menu/[category]', 'page')
  revalidatePath('/menu/lunch')
  revalidatePath('/menu/takeout')
  revalidatePath('/menu/course')
}

function normalize(p: StoreMenuPayload) {
  return {
    store_id: p.store_id,
    category_id: p.category_id || null,
    is_active: p.is_active ?? true,
    sort_order: p.sort_order ?? 0,
  }
}

async function replaceItems(storeMenuId: string, items: MenuItemInput[]) {
  await adminSupabase.from('menu_items').delete().eq('store_menu_id', storeMenuId)
  const rows = items
    .filter((it) => it.name.trim())
    .map((it, idx) => ({
      store_menu_id: storeMenuId,
      name: it.name.trim(),
      description: it.description?.trim() || null,
      price_label: it.price_label?.trim() || null,
      image_url: it.image_url?.trim() || null,
      sort_order: idx,
    }))
  if (rows.length) await adminSupabase.from('menu_items').insert(rows)
}

export async function getMenuItems(storeMenuId: string): Promise<Tables<'menu_items'>[]> {
  const { data } = await adminSupabase
    .from('menu_items')
    .select('*')
    .eq('store_menu_id', storeMenuId)
    .order('sort_order')
  return data ?? []
}

export async function createStoreMenu(p: StoreMenuPayload, items: MenuItemInput[]) {
  if (!(await isAuthed())) return { error: '認証が必要です' }
  if (!p.store_id) return { error: '店舗を選択してください' }
  const { data, error } = await adminSupabase
    .from('store_menus')
    .insert(normalize(p))
    .select('id')
    .single()
  if (error || !data) return { error: error?.message ?? '作成に失敗しました' }
  await replaceItems(data.id, items)
  revalidateMenus()
  return { success: true }
}

export async function updateStoreMenu(id: string, p: StoreMenuPayload, items: MenuItemInput[]) {
  if (!(await isAuthed())) return { error: '認証が必要です' }
  const { error } = await adminSupabase.from('store_menus').update(normalize(p)).eq('id', id)
  if (error) return { error: error.message }
  await replaceItems(id, items)
  revalidateMenus()
  return { success: true }
}

export async function deleteStoreMenu(id: string) {
  if (!(await isAuthed())) return { error: '認証が必要です' }
  const { error } = await adminSupabase.from('store_menus').delete().eq('id', id)
  if (error) return { error: error.message }
  revalidateMenus()
  return { success: true }
}
