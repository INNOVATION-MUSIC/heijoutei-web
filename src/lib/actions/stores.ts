'use server'

import { adminSupabase } from '@/lib/supabase/admin'
import { isAuthed } from '@/lib/auth-guard'
import { revalidatePath } from 'next/cache'
import type { TablesInsert } from '@/types/supabase'

export type StorePayload = {
  name: string
  slug: string
  name_en?: string | null
  address?: string | null
  phone?: string | null
  business_hours?: string | null
  closed_days?: string | null
  access?: string | null
  description?: string | null
  seat_count?: string | null
  seat_description?: string | null
  hero_image_url?: string | null
  logo_image_url?: string | null
  gallery_image_urls?: string[]
  line_id?: string | null
  google_map_url?: string | null
  is_active?: boolean
  is_coming_soon?: boolean
  sort_order?: number
}

// 店舗マスタ更新時に関連フロントページのキャッシュをクリアする
function revalidateStoreFronts() {
  revalidatePath('/')
  revalidatePath('/store')
  revalidatePath('/store/[id]', 'page')
  revalidatePath('/menu')
}

function normalize(payload: StorePayload): TablesInsert<'stores'> {
  return {
    name: payload.name.trim(),
    slug: payload.slug.trim(),
    name_en: payload.name_en?.trim() || null,
    address: payload.address?.trim() || null,
    phone: payload.phone?.trim() || null,
    business_hours: payload.business_hours?.trim() || null,
    closed_days: payload.closed_days?.trim() || null,
    access: payload.access?.trim() || null,
    description: payload.description?.trim() || null,
    seat_count: payload.seat_count?.trim() || null,
    seat_description: payload.seat_description?.trim() || null,
    hero_image_url: payload.hero_image_url?.trim() || null,
    logo_image_url: payload.logo_image_url?.trim() || null,
    gallery_image_urls: payload.gallery_image_urls ?? [],
    line_id: payload.line_id?.trim() || null,
    google_map_url: payload.google_map_url?.trim() || null,
    is_active: payload.is_active ?? true,
    is_coming_soon: payload.is_coming_soon ?? false,
    sort_order: payload.sort_order ?? 0,
  }
}

export async function createStore(payload: StorePayload) {
  if (!(await isAuthed())) return { error: '認証が必要です' }
  if (!payload.name?.trim() || !payload.slug?.trim()) {
    return { error: '店舗名とスラッグは必須です' }
  }
  const { error } = await adminSupabase.from('stores').insert(normalize(payload))
  if (error) return { error: error.message }
  revalidateStoreFronts()
  return { success: true }
}

export async function updateStore(id: string, payload: StorePayload) {
  if (!(await isAuthed())) return { error: '認証が必要です' }
  if (!payload.name?.trim() || !payload.slug?.trim()) {
    return { error: '店舗名とスラッグは必須です' }
  }
  const { error } = await adminSupabase.from('stores').update(normalize(payload)).eq('id', id)
  if (error) return { error: error.message }
  revalidateStoreFronts()
  return { success: true }
}

export async function deleteStore(id: string) {
  if (!(await isAuthed())) return { error: '認証が必要です' }
  const { error } = await adminSupabase.from('stores').delete().eq('id', id)
  if (error) return { error: error.message }
  revalidateStoreFronts()
  return { success: true }
}
