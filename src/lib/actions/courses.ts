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
