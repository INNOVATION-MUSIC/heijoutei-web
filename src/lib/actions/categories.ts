'use server'

import { adminSupabase } from '@/lib/supabase/admin'
import { isAuthed } from '@/lib/auth-guard'
import { revalidatePath } from 'next/cache'

export type CategoryKind = 'menu' | 'takeout' | 'course' | 'lunch'
export type Category = {
  id: string
  name: string
  slug: string
  is_active: boolean | null
  sort_order: number | null
  // メニューカテゴリのみ。フロント /menu のカテゴリカード画像。他カテゴリには列なし。
  card_image_url?: string | null
  // メニュー／テイクアウトカテゴリ。対象店舗（stores.id の配列）。null/空=全店表示。
  store_ids?: string[] | null
}

function tableFor(kind: CategoryKind) {
  if (kind === 'menu') return 'menu_categories' as const
  if (kind === 'course') return 'course_categories' as const
  if (kind === 'lunch') return 'lunch_categories' as const
  return 'takeout_categories' as const
}

// 紐づき件数を数える対象テーブル（course は courses.course_category_id を別途参照するため対象外）
function linkedTableFor(kind: Exclude<CategoryKind, 'course'>) {
  return kind === 'menu' ? ('store_menus' as const) : ('store_takeout_menus' as const)
}

function revalidateFor(kind: CategoryKind) {
  if (kind === 'menu') {
    revalidatePath('/menu')
    revalidatePath('/menu/[category]', 'page')
  } else if (kind === 'course') {
    revalidatePath('/menu')
    revalidatePath('/menu/course')
  } else if (kind === 'lunch') {
    revalidatePath('/menu')
    revalidatePath('/menu/lunch')
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
  // card_image_url はメニューのみ。store_ids はメニュー／テイクアウトが持つ（対象店舗）
  const cols =
    kind === 'menu'
      ? 'id, name, slug, is_active, sort_order, card_image_url, store_ids'
      : kind === 'takeout'
        ? 'id, name, slug, is_active, sort_order, store_ids'
        : 'id, name, slug, is_active, sort_order'
  let query = adminSupabase
    .from(tableFor(kind))
    .select(cols)
    .order('sort_order', { ascending: true })
  // ランチは /admin/lunch 専用画面で管理し、フロントが slug='lunch' 固定で依存するため
  // カテゴリ管理（リネーム/削除/並べ替え）の対象から除外して事故を防ぐ
  if (kind === 'menu') query = query.neq('slug', 'lunch')
  const { data } = await query
  return (data ?? []) as unknown as Category[]
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

  // 作成行（実 id / sort_order）を返す。クライアントはこの実 id で以後の
  // 対象店舗・画像・名前などのインライン編集(updateCategory)を行うため、
  // 仮 id を使うと .eq('id', 仮id) が 0 件更新になり保存されない。
  const { data, error } = await adminSupabase
    .from(tableFor(kind))
    .insert({ name: name.trim(), slug: finalSlug, sort_order: nextOrder })
    .select('id, name, slug, is_active, sort_order')
    .single()
  if (error) return { error: error.message }
  revalidateFor(kind)
  return { success: true, category: data as unknown as Category }
}

export async function updateCategory(
  kind: CategoryKind,
  id: string,
  patch: { name?: string; slug?: string; is_active?: boolean; card_image_url?: string | null; store_ids?: string[] | null }
) {
  if (!(await isAuthed())) return { error: '認証が必要です' }
  const update: { name?: string; slug?: string; is_active?: boolean; card_image_url?: string | null; store_ids?: string[] | null } = {}
  if (patch.name !== undefined) update.name = patch.name.trim()
  if (patch.slug !== undefined) update.slug = patch.slug.trim()
  if (patch.is_active !== undefined) update.is_active = patch.is_active
  // card_image_url はメニューのみ。store_ids はメニュー／テイクアウトが持つ（他カテゴリのテーブルには列が無いため除外）
  if (patch.card_image_url !== undefined && kind === 'menu') update.card_image_url = patch.card_image_url || null
  // store_ids: 空配列は「全店表示」に正規化して NULL 保存
  if (patch.store_ids !== undefined && (kind === 'menu' || kind === 'takeout'))
    update.store_ids = patch.store_ids && patch.store_ids.length > 0 ? patch.store_ids : null
  // tableFor が union 型のため、共通列だけの型にキャストして update（card_image_url/store_ids は menu のみ実行時に含まれる）
  const baseUpdate = update as { name?: string; slug?: string; is_active?: boolean }
  const { error } = await adminSupabase.from(tableFor(kind)).update(baseUpdate).eq('id', id)
  if (error) return { error: error.message }
  revalidateFor(kind)
  return { success: true }
}

export async function deleteCategory(kind: CategoryKind, id: string) {
  if (!(await isAuthed())) return { error: '認証が必要です' }
  // 紐づくメニュー／コース／ランチ品目が存在する場合は削除を拒否（警告）
  // ※ course は courses.course_category_id、lunch は menu_items.lunch_category_id、
  //   menu/takeout は <linked>.category_id を参照（列名が異なるため分岐）
  let count: number | null
  if (kind === 'course') {
    const r = await adminSupabase.from('courses').select('id', { count: 'exact', head: true }).eq('course_category_id', id)
    count = r.count
  } else if (kind === 'lunch') {
    const r = await adminSupabase.from('menu_items').select('id', { count: 'exact', head: true }).eq('lunch_category_id', id)
    count = r.count
  } else {
    const r = await adminSupabase.from(linkedTableFor(kind)).select('id', { count: 'exact', head: true }).eq('category_id', id)
    count = r.count
  }
  if ((count ?? 0) > 0) {
    const unit = kind === 'course' ? 'コース' : kind === 'lunch' ? 'ランチ品目' : 'メニュー'
    return { error: `このカテゴリには ${count} 件の${unit}が紐づいています。先に別カテゴリへ移すか削除してください。` }
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
