'use server'

import { adminSupabase } from '@/lib/supabase/admin'
import { isAuthed } from '@/lib/auth-guard'
import { revalidatePath } from 'next/cache'
import type { Tables } from '@/types/supabase'

export type TagInput = { label: string; color: string }
export type DetailInput = { label: string; value: string }

export type RecruitPayload = {
  store_id: string
  title: string
  image_url?: string | null
  hero_image_url?: string | null
  summary?: string | null
  body?: string | null
  is_published?: boolean
  published_at?: string | null
  sort_order?: number
}

function revalidateRecruit() {
  revalidatePath('/recruit')
  revalidatePath('/recruit/[id]', 'page')
}

function normalize(p: RecruitPayload) {
  const isPub = p.is_published ?? false
  return {
    store_id: p.store_id,
    title: p.title.trim(),
    image_url: p.image_url?.trim() || null,
    hero_image_url: p.hero_image_url?.trim() || null,
    summary: p.summary?.trim() || null,
    body: p.body?.trim() || null,
    is_published: isPub,
    published_at: isPub ? (p.published_at || new Date().toISOString()) : (p.published_at || null),
    sort_order: p.sort_order ?? 0,
  }
}

async function replaceTags(recruitId: string, tags: TagInput[]) {
  await adminSupabase.from('recruitment_tags').delete().eq('recruitment_id', recruitId)
  const rows = tags.filter((t) => t.label.trim()).map((t, idx) => ({
    recruitment_id: recruitId, label: t.label.trim(), color: t.color || 'green', sort_order: idx,
  }))
  if (rows.length) await adminSupabase.from('recruitment_tags').insert(rows)
}

async function replaceDetails(recruitId: string, details: DetailInput[]) {
  await adminSupabase.from('recruitment_details').delete().eq('recruitment_id', recruitId)
  const rows = details.filter((d) => d.label.trim()).map((d, idx) => ({
    recruitment_id: recruitId, label: d.label.trim(), value: d.value.trim(), sort_order: idx,
  }))
  if (rows.length) await adminSupabase.from('recruitment_details').insert(rows)
}

export async function getRecruitTags(recruitId: string): Promise<Tables<'recruitment_tags'>[]> {
  if (!(await isAuthed())) return []
  const { data } = await adminSupabase.from('recruitment_tags').select('*').eq('recruitment_id', recruitId).order('sort_order')
  return data ?? []
}
export async function getRecruitDetails(recruitId: string): Promise<Tables<'recruitment_details'>[]> {
  if (!(await isAuthed())) return []
  const { data } = await adminSupabase.from('recruitment_details').select('*').eq('recruitment_id', recruitId).order('sort_order')
  return data ?? []
}

export async function createRecruit(p: RecruitPayload, tags: TagInput[], details: DetailInput[]) {
  if (!(await isAuthed())) return { error: '認証が必要です' }
  if (!p.store_id) return { error: '店舗を選択してください' }
  if (!p.title?.trim()) return { error: 'タイトルは必須です' }
  const { data, error } = await adminSupabase.from('recruitments').insert(normalize(p)).select('id').single()
  if (error || !data) return { error: error?.message ?? '作成に失敗しました' }
  await replaceTags(data.id, tags)
  await replaceDetails(data.id, details)
  revalidateRecruit()
  return { success: true }
}

export async function updateRecruit(id: string, p: RecruitPayload, tags: TagInput[], details: DetailInput[]) {
  if (!(await isAuthed())) return { error: '認証が必要です' }
  if (!p.title?.trim()) return { error: 'タイトルは必須です' }
  const { error } = await adminSupabase.from('recruitments').update(normalize(p)).eq('id', id)
  if (error) return { error: error.message }
  await replaceTags(id, tags)
  await replaceDetails(id, details)
  revalidateRecruit()
  return { success: true }
}

export async function deleteRecruit(id: string) {
  if (!(await isAuthed())) return { error: '認証が必要です' }
  const { error } = await adminSupabase.from('recruitments').delete().eq('id', id)
  if (error) return { error: error.message }
  revalidateRecruit()
  return { success: true }
}
