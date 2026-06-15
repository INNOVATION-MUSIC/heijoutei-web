'use server'

import { adminSupabase } from '@/lib/supabase/admin'
import { isAuthed } from '@/lib/auth-guard'
import { revalidatePath } from 'next/cache'
import { generateSlug } from '@/lib/slug'
import type { Tables } from '@/types/supabase'

export type NewsTagInput = { label: string; color: string }
export type NewsStatus = 'draft' | 'published' | 'scheduled'

export type NewsPayload = {
  title: string
  slug: string
  body?: string | null
  thumbnail_url?: string | null
  status: NewsStatus
  published_at?: string | null // ISO（status=scheduled/published 用）
}

function revalidateNews() {
  revalidatePath('/')
  revalidatePath('/news')
  revalidatePath('/news/[id]', 'page')
}

function resolvePublish(p: NewsPayload): { is_published: boolean; published_at: string | null } {
  if (p.status === 'draft') return { is_published: false, published_at: p.published_at || null }
  if (p.status === 'scheduled') return { is_published: true, published_at: p.published_at || new Date().toISOString() }
  // published
  return { is_published: true, published_at: p.published_at || new Date().toISOString() }
}

// slug の一意性を保証する。既存と衝突する場合は `-2`, `-3` … を付与（WordPress 同様）。
// excludeId は更新時に自分自身を除外するため。news は小規模なので全 slug を取得して JS で判定。
async function uniqueSlug(base: string, excludeId?: string): Promise<string> {
  const clean = (base || `news-${Date.now()}`).slice(0, 100)
  const { data } = await adminSupabase.from('news').select('id, slug')
  const taken = new Set((data ?? []).filter((r) => r.id !== excludeId).map((r) => r.slug))
  if (!taken.has(clean)) return clean
  for (let i = 2; i < 1000; i++) {
    const cand = `${clean.slice(0, 96)}-${i}`
    if (!taken.has(cand)) return cand
  }
  return `${clean.slice(0, 80)}-${Date.now()}`
}

async function replaceTags(newsId: string, tags: NewsTagInput[]) {
  await adminSupabase.from('news_tags').delete().eq('news_id', newsId)
  const rows = tags
    .filter((t) => t.label.trim())
    .map((t, idx) => ({ news_id: newsId, label: t.label.trim(), color: t.color || 'green', sort_order: idx }))
  if (rows.length) await adminSupabase.from('news_tags').insert(rows)
}

export async function getNewsTags(newsId: string): Promise<Tables<'news_tags'>[]> {
  const { data } = await adminSupabase.from('news_tags').select('*').eq('news_id', newsId).order('sort_order')
  return data ?? []
}

export async function createNews(p: NewsPayload, tags: NewsTagInput[]) {
  if (!(await isAuthed())) return { error: '認証が必要です' }
  if (!p.title?.trim()) return { error: 'タイトルは必須です' }
  let slug = await uniqueSlug(p.slug?.trim() || generateSlug(p.title))
  const { is_published, published_at } = resolvePublish(p)
  const base = { title: p.title.trim(), body: p.body || null, thumbnail_url: p.thumbnail_url || null, is_published, published_at }
  let { data, error } = await adminSupabase.from('news').insert({ ...base, slug }).select('id').single()
  // 同時実行などで一意制約に衝突した場合はタイムスタンプ付きで1回だけ再試行
  if (error?.code === '23505') {
    slug = `${slug.slice(0, 80)}-${Date.now()}`
    ;({ data, error } = await adminSupabase.from('news').insert({ ...base, slug }).select('id').single())
  }
  if (error || !data) return { error: error?.message ?? '作成に失敗しました' }
  await replaceTags(data.id, tags)
  revalidateNews()
  return { success: true }
}

export async function updateNews(id: string, p: NewsPayload, tags: NewsTagInput[]) {
  if (!(await isAuthed())) return { error: '認証が必要です' }
  if (!p.title?.trim()) return { error: 'タイトルは必須です' }
  const slug = await uniqueSlug(p.slug?.trim() || generateSlug(p.title), id)
  const { is_published, published_at } = resolvePublish(p)
  const { error } = await adminSupabase
    .from('news')
    .update({ title: p.title.trim(), slug, body: p.body || null, thumbnail_url: p.thumbnail_url || null, is_published, published_at })
    .eq('id', id)
  if (error) return { error: error.message }
  await replaceTags(id, tags)
  revalidateNews()
  return { success: true }
}

export async function deleteNews(id: string) {
  if (!(await isAuthed())) return { error: '認証が必要です' }
  const { error } = await adminSupabase.from('news').delete().eq('id', id)
  if (error) return { error: error.message }
  revalidateNews()
  return { success: true }
}
