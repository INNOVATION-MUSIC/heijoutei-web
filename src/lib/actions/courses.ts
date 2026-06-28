'use server'

import { adminSupabase } from '@/lib/supabase/admin'
import { isAuthed } from '@/lib/auth-guard'
import { revalidatePath } from 'next/cache'

export type CoursePayload = {
  store_id: string
  name: string
  type_label?: string | null
  price_label?: string | null
  description?: string | null
  notes?: string | null
  image_url?: string | null
  course_category_id?: string | null
  with_rice?: boolean
  is_active?: boolean
  sort_order?: number
}

function revalidateCourses() {
  revalidatePath('/menu')
  revalidatePath('/menu/course')
}

function normalize(p: CoursePayload) {
  return {
    store_id: p.store_id,
    name: p.name.trim(),
    type_label: p.type_label?.trim() || null,
    price_label: p.price_label?.trim() || null,
    description: p.description?.trim() || null,
    notes: p.notes?.trim() || null,
    image_url: p.image_url?.trim() || null,
    course_category_id: p.course_category_id || null,
    with_rice: p.with_rice ?? false,
    is_active: p.is_active ?? true,
    sort_order: p.sort_order ?? 0,
  }
}

export async function createCourse(p: CoursePayload) {
  if (!(await isAuthed())) return { error: '認証が必要です' }
  if (!p.store_id) return { error: '店舗を選択してください' }
  if (!p.name?.trim()) return { error: 'コース名は必須です' }
  const { error } = await adminSupabase.from('courses').insert(normalize(p))
  if (error) return { error: error.message }
  revalidateCourses()
  return { success: true }
}

export async function updateCourse(id: string, p: CoursePayload) {
  if (!(await isAuthed())) return { error: '認証が必要です' }
  if (!p.name?.trim()) return { error: 'コース名は必須です' }
  const { error } = await adminSupabase.from('courses').update(normalize(p)).eq('id', id)
  if (error) return { error: error.message }
  revalidateCourses()
  return { success: true }
}

export async function deleteCourse(id: string) {
  if (!(await isAuthed())) return { error: '認証が必要です' }
  const { error } = await adminSupabase.from('courses').delete().eq('id', id)
  if (error) return { error: error.message }
  revalidateCourses()
  return { success: true }
}

// コースを複製する。同店舗の末尾に配置し、誤公開を避けるため非公開で作成する。
export async function duplicateCourse(id: string) {
  if (!(await isAuthed())) return { error: '認証が必要です' }
  const { data: src, error: e1 } = await adminSupabase.from('courses').select('*').eq('id', id).single()
  if (e1 || !src) return { error: e1?.message ?? '複製元が見つかりません' }
  // 同店舗の末尾に配置
  const { data: last } = await adminSupabase
    .from('courses')
    .select('sort_order')
    .eq('store_id', src.store_id)
    .order('sort_order', { ascending: false })
    .limit(1)
    .maybeSingle()
  const nextOrder = (last?.sort_order ?? 0) + 1
  const { error: e2 } = await adminSupabase.from('courses').insert({
    store_id: src.store_id,
    name: `${src.name}（複製）`,
    type_label: src.type_label,
    price_label: src.price_label,
    description: src.description,
    notes: src.notes,
    image_url: src.image_url,
    course_category_id: src.course_category_id,
    with_rice: src.with_rice,
    is_active: false, // 複製直後は非公開（編集して公開）
    sort_order: nextOrder,
  })
  if (e2) return { error: e2.message }
  revalidateCourses()
  return { success: true }
}

// 一覧のドラッグ並べ替え。渡された順に sort_order=1..n を振り直す（店舗ごとに呼ぶ）。
export async function reorderCourses(orderedIds: string[]) {
  if (!(await isAuthed())) return { error: '認証が必要です' }
  await Promise.all(
    orderedIds.map((id, idx) => adminSupabase.from('courses').update({ sort_order: idx + 1 }).eq('id', id)),
  )
  revalidateCourses()
  return { success: true }
}
