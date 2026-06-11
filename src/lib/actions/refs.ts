'use server'

import { adminSupabase } from '@/lib/supabase/admin'

export type StoreRef = { id: string; name: string; slug: string }
export type CategoryRef = { id: string; name: string; slug: string }

// 各管理フォームのプルダウン用。店舗マスタが単一マスタなので各所で再利用する。
export async function getStoreRefs(): Promise<StoreRef[]> {
  const { data } = await adminSupabase
    .from('stores')
    .select('id, name, slug')
    .order('sort_order', { ascending: true })
  return data ?? []
}

export async function getMenuCategoryRefs(): Promise<CategoryRef[]> {
  const { data } = await adminSupabase
    .from('menu_categories')
    .select('id, name, slug')
    .order('sort_order', { ascending: true })
  return data ?? []
}

export async function getTakeoutCategoryRefs(): Promise<CategoryRef[]> {
  const { data } = await adminSupabase
    .from('takeout_categories')
    .select('id, name, slug')
    .order('sort_order', { ascending: true })
  return data ?? []
}
