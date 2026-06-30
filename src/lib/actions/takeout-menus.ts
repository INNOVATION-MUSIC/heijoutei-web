'use server'

import { adminSupabase } from '@/lib/supabase/admin'
import { isAuthed } from '@/lib/auth-guard'
import { revalidatePath } from 'next/cache'

export type TakeoutMenuPayload = {
  category_id: string | null
  name: string
  description?: string | null
  image_url?: string | null
  price: number
  is_active?: boolean
  sort_order?: number
  store_ids: string[]
}

function revalidateTakeout() {
  revalidatePath('/takeout')
  revalidatePath('/menu/takeout')
}

function normalize(p: TakeoutMenuPayload) {
  return {
    category_id: p.category_id || null,
    name: p.name.trim(),
    description: p.description?.trim() || null,
    image_url: p.image_url?.trim() || null,
    price: Math.max(0, Math.round(p.price || 0)),
    is_active: p.is_active ?? true,
    sort_order: p.sort_order ?? 0,
  }
}

async function syncStores(menuId: string, storeIds: string[]) {
  // 中間テーブルを総入れ替え
  await adminSupabase.from('store_takeout_menu_stores').delete().eq('takeout_menu_id', menuId)
  if (storeIds.length) {
    await adminSupabase
      .from('store_takeout_menu_stores')
      .insert(storeIds.map((store_id) => ({ takeout_menu_id: menuId, store_id })))
  }
}

export async function getTakeoutMenuStoreIds(menuId: string): Promise<string[]> {
  const { data } = await adminSupabase
    .from('store_takeout_menu_stores')
    .select('store_id')
    .eq('takeout_menu_id', menuId)
  return (data ?? []).map((r) => r.store_id)
}

export async function createTakeoutMenu(p: TakeoutMenuPayload) {
  if (!(await isAuthed())) return { error: '認証が必要です' }
  if (!p.name?.trim()) return { error: 'メニュー名は必須です' }
  const { data, error } = await adminSupabase
    .from('store_takeout_menus')
    .insert(normalize(p))
    .select('id')
    .single()
  if (error || !data) return { error: error?.message ?? '作成に失敗しました' }
  await syncStores(data.id, p.store_ids)
  revalidateTakeout()
  return { success: true }
}

export async function updateTakeoutMenu(id: string, p: TakeoutMenuPayload) {
  if (!(await isAuthed())) return { error: '認証が必要です' }
  if (!p.name?.trim()) return { error: 'メニュー名は必須です' }
  const { error } = await adminSupabase.from('store_takeout_menus').update(normalize(p)).eq('id', id)
  if (error) return { error: error.message }
  await syncStores(id, p.store_ids)
  revalidateTakeout()
  return { success: true }
}

export async function deleteTakeoutMenu(id: string) {
  if (!(await isAuthed())) return { error: '認証が必要です' }
  const { error } = await adminSupabase.from('store_takeout_menus').delete().eq('id', id)
  if (error) return { error: error.message }
  revalidateTakeout()
  return { success: true }
}

// メニューを複製する。末尾に配置し、誤公開を避けるため非公開で作成する。取扱店舗も引き継ぐ。
export async function duplicateTakeoutMenu(id: string) {
  if (!(await isAuthed())) return { error: '認証が必要です' }
  try {
    const { data: src, error: e1 } = await adminSupabase
      .from('store_takeout_menus')
      .select('*')
      .eq('id', id)
      .single()
    if (e1 || !src) return { error: e1?.message ?? '複製元が見つかりません' }
    const { data: last } = await adminSupabase
      .from('store_takeout_menus')
      .select('sort_order')
      .order('sort_order', { ascending: false })
      .limit(1)
      .maybeSingle()
    const nextOrder = (last?.sort_order ?? 0) + 1
    const { data: created, error: e2 } = await adminSupabase
      .from('store_takeout_menus')
      .insert({
        category_id: src.category_id,
        name: `${src.name}（複製）`,
        description: src.description,
        image_url: src.image_url,
        price: src.price,
        is_active: false, // 複製直後は非公開（編集して公開）
        sort_order: nextOrder,
      })
      .select('id')
      .single()
    if (e2 || !created) return { error: e2?.message ?? '複製に失敗しました' }
    const storeIds = await getTakeoutMenuStoreIds(id)
    await syncStores(created.id, storeIds)
    revalidateTakeout()
    return { success: true }
  } catch (e) {
    return { error: e instanceof Error ? e.message : '複製に失敗しました' }
  }
}

// 一覧のドラッグ並べ替え。渡された順に sort_order=1..n を振り直す。
export async function reorderTakeoutMenus(orderedIds: string[]) {
  if (!(await isAuthed())) return { error: '認証が必要です' }
  await Promise.all(
    orderedIds.map((id, idx) =>
      adminSupabase.from('store_takeout_menus').update({ sort_order: idx + 1 }).eq('id', id),
    ),
  )
  revalidateTakeout()
  return { success: true }
}
