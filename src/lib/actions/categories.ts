'use server'

import { adminSupabase } from '@/lib/supabase/admin'
import { isAuthed } from '@/lib/auth-guard'
import { revalidatePath } from 'next/cache'

export type CategoryKind = 'menu' | 'takeout'
export type Category = {
  id: string
  name: string
  slug: string
  is_active: boolean | null
  sort_order: number | null
}

function tableFor(kind: CategoryKind) {
  return kind === 'menu' ? ('menu_categories' as const) : ('takeout_categories' as const)
}

// 紐づきメニューを数える対象テーブル
function linkedTableFor(kind: CategoryKind) {
  return kind === 'menu' ? ('store_menus' as const) : ('store_takeout_menus' as const)
}

function revalidateFor(kind: CategoryKind) {
  if (kind === 'menu') {
    revalidatePath('/menu')
    revalidatePath('/menu/[category]', 'page')
  } else {
    revalidatePath('/takeout')
    revalidatePath('/menu/takeout')
  }
}

function autoSlug(name: string): string {
  // 既に slug 指定が無いカテゴリ用。日本語で空になる場合はタイムスタンプで代替。
  const s = name
    .trim()
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '')
  return s || `cat-${Date.now()}`
}

export async function getCategories(kind: CategoryKind): Promise<Category[]> {
  let query = adminSupabase
    .from(tableFor(kind))
    .select('id, name, slug, is_active, sort_order')
    .order('sort_order', { ascending: true })
  // ランチは /admin/lunch 専用画面で管理し、フロントが slug='lunch' 固定で依存するため
  // カテゴリ管理（リネーム/削除/並べ替え）の対象から除外して事故を防ぐ
  if (kind === 'menu') query = query.neq('slug', 'lunch')
  const { data } = await query
  return data ?? []
}

export async function createCategory(kind: CategoryKind, name: string, slug?: string) {
  if (!(await isAuthed())) return { error: '認証が必要です' }
  if (!name.trim()) return { error: 'カテゴリ名は必須です' }
  const finalSlug = (slug?.trim() || autoSlug(name))
  // 末尾に追加するため現在の最大 sort_order を取得
  const { data: last } = await adminSupabase
    .from(tableFor(kind))
    .select('sort_order')
    .order('sort_order', { ascending: false })
    .limit(1)
    .maybeSingle()
  const nextOrder = (last?.sort_order ?? 0) + 1

  const { error } = await adminSupabase
    .from(tableFor(kind))
    .insert({ name: name.trim(), slug: finalSlug, sort_order: nextOrder })
  if (error) return { error: error.message }
  revalidateFor(kind)
  return { success: true }
}

export async function updateCategory(
  kind: CategoryKind,
  id: string,
  patch: { name?: string; slug?: string; is_active?: boolean }
) {
  if (!(await isAuthed())) return { error: '認証が必要です' }
  const update: { name?: string; slug?: string; is_active?: boolean } = {}
  if (patch.name !== undefined) update.name = patch.name.trim()
  if (patch.slug !== undefined) update.slug = patch.slug.trim()
  if (patch.is_active !== undefined) update.is_active = patch.is_active
  const { error } = await adminSupabase.from(tableFor(kind)).update(update).eq('id', id)
  if (error) return { error: error.message }
  revalidateFor(kind)
  return { success: true }
}

export async function deleteCategory(kind: CategoryKind, id: string) {
  if (!(await isAuthed())) return { error: '認証が必要です' }
  // 紐づくメニューが存在する場合は削除を拒否（警告）
  const { count } = await adminSupabase
    .from(linkedTableFor(kind))
    .select('id', { count: 'exact', head: true })
    .eq('category_id', id)
  if ((count ?? 0) > 0) {
    return { error: `このカテゴリには ${count} 件のメニューが紐づいています。先にメニューを別カテゴリへ移すか削除してください。` }
  }
  const { error } = await adminSupabase.from(tableFor(kind)).delete().eq('id', id)
  if (error) return { error: error.message }
  revalidateFor(kind)
  return { success: true }
}

export async function reorderCategories(kind: CategoryKind, orderedIds: string[]) {
  if (!(await isAuthed())) return { error: '認証が必要です' }
  // index を sort_order として一括更新
  await Promise.all(
    orderedIds.map((id, idx) =>
      adminSupabase.from(tableFor(kind)).update({ sort_order: idx + 1 }).eq('id', id)
    )
  )
  revalidateFor(kind)
  return { success: true }
}
