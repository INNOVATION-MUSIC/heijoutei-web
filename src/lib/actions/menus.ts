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
  // ランチ品目のみ使用。/menu/lunch のサブタブ（lunch_categories）への割当。通常メニューは null。
  lunch_category_id?: string | null
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

async function replaceItems(storeMenuId: string, items: MenuItemInput[]): Promise<{ error?: string }> {
  const { error: delErr } = await adminSupabase.from('menu_items').delete().eq('store_menu_id', storeMenuId)
  if (delErr) return { error: delErr.message }
  const rows = items
    .filter((it) => it.name.trim())
    .map((it, idx) => ({
      store_menu_id: storeMenuId,
      name: it.name.trim(),
      description: it.description?.trim() || null,
      price_label: it.price_label?.trim() || null,
      image_url: it.image_url?.trim() || null,
      lunch_category_id: it.lunch_category_id || null,
      sort_order: idx,
    }))
  if (rows.length) {
    const { error: insErr } = await adminSupabase.from('menu_items').insert(rows)
    if (insErr) return { error: insErr.message }
  }
  return {}
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
  const itemsResult = await replaceItems(data.id, items)
  if (itemsResult.error) return { error: `品目の保存に失敗しました: ${itemsResult.error}` }
  revalidateMenus()
  return { success: true }
}

export async function updateStoreMenu(id: string, p: StoreMenuPayload, items: MenuItemInput[]) {
  if (!(await isAuthed())) return { error: '認証が必要です' }
  const { error } = await adminSupabase.from('store_menus').update(normalize(p)).eq('id', id)
  if (error) return { error: error.message }
  const itemsResult = await replaceItems(id, items)
  if (itemsResult.error) return { error: `品目の保存に失敗しました: ${itemsResult.error}` }
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

// 一覧のドラッグ並べ替え。渡された順に sort_order=1..n を振り直す（店舗ごとに呼ぶ）。
// ※ store_menus.sort_order はフロント表示順に影響せず、管理画面の一覧並びのみに作用する。
export async function reorderStoreMenus(orderedIds: string[]) {
  if (!(await isAuthed())) return { error: '認証が必要です' }
  await Promise.all(
    orderedIds.map((id, idx) => adminSupabase.from('store_menus').update({ sort_order: idx + 1 }).eq('id', id)),
  )
  revalidatePath('/admin/menus')
  return { success: true }
}
