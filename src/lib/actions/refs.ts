'use server'

import { adminSupabase } from '@/lib/supabase/admin'
import { isAuthed, scopedStoreIds } from '@/lib/auth-guard'

export type StoreRef = { id: string; name: string; slug: string }
// store_ids はメニューカテゴリのみ設定される（対象店舗）。null/空=全店。
export type CategoryRef = { id: string; name: string; slug: string; store_ids?: string[] | null }

// 各管理フォームのプルダウン用。店舗マスタが単一マスタなので各所で再利用する。
// 店舗スタッフには担当店舗のみ返す（フォームの店舗選択肢が自動的に絞られる）。
export async function getStoreRefs(): Promise<StoreRef[]> {
  if (!(await isAuthed())) return []
  const allowed = await scopedStoreIds()
  // 非公開（is_active=false）の店舗は各フォームの選択肢に出さない。
  const q = adminSupabase
    .from('stores')
    .select('id, name, slug')
    .eq('is_active', true)
    .order('sort_order', { ascending: true })
  if (allowed) q.in('id', allowed)
  const { data } = await q
  return data ?? []
}

export async function getMenuCategoryRefs(): Promise<CategoryRef[]> {
  if (!(await isAuthed())) return []
  // ランチは専用画面（/admin/lunch）で管理するため通常メニューの選択肢から除外
  const { data } = await adminSupabase
    .from('menu_categories')
    .select('id, name, slug, store_ids')
    .neq('slug', 'lunch')
    .order('sort_order', { ascending: true })
  return data ?? []
}

// ランチ専用画面用。slug='lunch' のカテゴリ（フロント /menu/lunch が依存する固定slug）を返す。
export async function getLunchCategory(): Promise<CategoryRef | null> {
  if (!(await isAuthed())) return null
  const { data } = await adminSupabase
    .from('menu_categories')
    .select('id, name, slug')
    .eq('slug', 'lunch')
    .maybeSingle()
  return data ?? null
}

export async function getTakeoutCategoryRefs(): Promise<CategoryRef[]> {
  if (!(await isAuthed())) return []
  const { data } = await adminSupabase
    .from('takeout_categories')
    .select('id, name, slug, store_ids')
    .order('sort_order', { ascending: true })
  return (data ?? []) as unknown as CategoryRef[]
}

// コース編集フォームのカテゴリ選択用（/menu/course のサブタブ）。
export async function getCourseCategoryRefs(): Promise<CategoryRef[]> {
  if (!(await isAuthed())) return []
  const { data } = await adminSupabase
    .from('course_categories')
    .select('id, name, slug')
    .order('sort_order', { ascending: true })
  return data ?? []
}

// ランチ品目編集の品目別カテゴリ選択用（/menu/lunch のサブタブ）。
// ※ getLunchCategory()（menu_categories slug='lunch' の固定コンテナ）とは別物。
export async function getLunchCategoryRefs(): Promise<CategoryRef[]> {
  if (!(await isAuthed())) return []
  const { data } = await adminSupabase
    .from('lunch_categories')
    .select('id, name, slug')
    .order('sort_order', { ascending: true })
  return data ?? []
}
