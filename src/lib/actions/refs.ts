'use server'

import { adminSupabase } from '@/lib/supabase/admin'

export type StoreRef = { id: string; name: string; slug: string }
export type CategoryRef = { id: string; name: string; slug: string }

// 各管理フォームのプルダウン用。店舗マスタが単一マスタなので各所で再利用する。
export async function getStoreRefs(): Promise<StoreRef[]> {
  // 非公開（is_active=false）の店舗は各フォームの選択肢に出さない。
  const { data } = await adminSupabase
    .from('stores')
    .select('id, name, slug')
    .eq('is_active', true)
    .order('sort_order', { ascending: true })
  return data ?? []
}

export async function getMenuCategoryRefs(): Promise<CategoryRef[]> {
  // ランチは専用画面（/admin/lunch）で管理するため通常メニューの選択肢から除外
  const { data } = await adminSupabase
    .from('menu_categories')
    .select('id, name, slug')
    .neq('slug', 'lunch')
    .order('sort_order', { ascending: true })
  return data ?? []
}

// ランチ専用画面用。slug='lunch' のカテゴリ（フロント /menu/lunch が依存する固定slug）を返す。
export async function getLunchCategory(): Promise<CategoryRef | null> {
  const { data } = await adminSupabase
    .from('menu_categories')
    .select('id, name, slug')
    .eq('slug', 'lunch')
    .maybeSingle()
  return data ?? null
}

export async function getTakeoutCategoryRefs(): Promise<CategoryRef[]> {
  const { data } = await adminSupabase
    .from('takeout_categories')
    .select('id, name, slug')
    .order('sort_order', { ascending: true })
  return data ?? []
}

// コース編集フォームのカテゴリ選択用（/menu/course のサブタブ）。
export async function getCourseCategoryRefs(): Promise<CategoryRef[]> {
  const { data } = await adminSupabase
    .from('course_categories')
    .select('id, name, slug')
    .order('sort_order', { ascending: true })
  return data ?? []
}

// ランチ品目編集の品目別カテゴリ選択用（/menu/lunch のサブタブ）。
// ※ getLunchCategory()（menu_categories slug='lunch' の固定コンテナ）とは別物。
export async function getLunchCategoryRefs(): Promise<CategoryRef[]> {
  const { data } = await adminSupabase
    .from('lunch_categories')
    .select('id, name, slug')
    .order('sort_order', { ascending: true })
  return data ?? []
}
