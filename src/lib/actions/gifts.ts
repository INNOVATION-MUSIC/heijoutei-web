'use server'

import { adminSupabase } from '@/lib/supabase/admin'
import { isAuthed } from '@/lib/auth-guard'
import { revalidatePath } from 'next/cache'
import type { Json } from '@/types/supabase'

export type GiftSpec = { label: string; value: string }

export type GiftPayload = {
  subtitle?: string | null
  title: string
  price_amount?: string | null
  price_note?: string | null
  image_url?: string | null
  description?: string | null
  content_label?: string | null
  content?: string | null
  specs?: GiftSpec[]
  is_short?: boolean
  is_active?: boolean
  sort_order?: number
}

function revalidateGift() {
  revalidatePath('/gift')
}

function normalize(p: GiftPayload) {
  const specs = (p.specs ?? [])
    .map((s) => ({ label: (s.label ?? '').trim(), value: (s.value ?? '').trim() }))
    .filter((s) => s.label || s.value)
  return {
    subtitle: p.subtitle?.trim() || null,
    title: p.title.trim(),
    price_amount: p.price_amount?.trim() || null,
    price_note: p.price_note?.trim() || null,
    image_url: p.image_url?.trim() || null,
    description: p.description?.trim() || null,
    content_label: p.content_label?.trim() || null,
    content: p.content?.trim() || null,
    specs: specs as unknown as Json,
    is_short: p.is_short ?? false,
    is_active: p.is_active ?? true,
    sort_order: p.sort_order ?? 0,
  }
}

export async function createGift(p: GiftPayload) {
  if (!(await isAuthed())) return { error: '認証が必要です' }
  if (!p.title?.trim()) return { error: '商品名は必須です' }
  const { error } = await adminSupabase.from('gift_products').insert(normalize(p))
  if (error) return { error: error.message }
  revalidateGift()
  return { success: true }
}

export async function updateGift(id: string, p: GiftPayload) {
  if (!(await isAuthed())) return { error: '認証が必要です' }
  if (!p.title?.trim()) return { error: '商品名は必須です' }
  const { error } = await adminSupabase.from('gift_products').update(normalize(p)).eq('id', id)
  if (error) return { error: error.message }
  revalidateGift()
  return { success: true }
}

export async function deleteGift(id: string) {
  if (!(await isAuthed())) return { error: '認証が必要です' }
  const { error } = await adminSupabase.from('gift_products').delete().eq('id', id)
  if (error) return { error: error.message }
  revalidateGift()
  return { success: true }
}

// ギフト商品を複製する。末尾に配置し、誤公開を避けるため非公開で作成する。
export async function duplicateGift(id: string) {
  if (!(await isAuthed())) return { error: '認証が必要です' }
  try {
    const { data: src, error: e1 } = await adminSupabase.from('gift_products').select('*').eq('id', id).single()
    if (e1 || !src) return { error: e1?.message ?? '複製元が見つかりません' }
    const { data: last } = await adminSupabase
      .from('gift_products')
      .select('sort_order')
      .order('sort_order', { ascending: false })
      .limit(1)
      .maybeSingle()
    const nextOrder = (last?.sort_order ?? 0) + 1
    const { error: e2 } = await adminSupabase.from('gift_products').insert({
      subtitle: src.subtitle,
      title: `${src.title}（複製）`,
      price_amount: src.price_amount,
      price_note: src.price_note,
      image_url: src.image_url,
      description: src.description,
      content_label: src.content_label,
      content: src.content,
      specs: src.specs,
      is_short: src.is_short,
      is_active: false, // 複製直後は非公開（編集して公開）
      sort_order: nextOrder,
    })
    if (e2) return { error: e2.message }
    revalidateGift()
    return { success: true }
  } catch (e) {
    return { error: e instanceof Error ? e.message : '複製に失敗しました' }
  }
}

// 一覧のドラッグ並べ替え。渡された順に sort_order=1..n を振り直す。
export async function reorderGifts(orderedIds: string[]) {
  if (!(await isAuthed())) return { error: '認証が必要です' }
  await Promise.all(
    orderedIds.map((id, idx) => adminSupabase.from('gift_products').update({ sort_order: idx + 1 }).eq('id', id)),
  )
  revalidateGift()
  return { success: true }
}
