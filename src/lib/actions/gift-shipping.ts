'use server'

import { adminSupabase } from '@/lib/supabase/admin'
import { isAuthed } from '@/lib/auth-guard'
import { revalidatePath } from 'next/cache'

export type GiftShippingInput = {
  region: string
  prefectures: string[]
  fee?: string | null
}

// 送料金表を一括保存する。渡された順（表示順）で全置換する。
export async function saveGiftShipping(areas: GiftShippingInput[]) {
  if (!(await isAuthed())) return { error: '認証が必要です' }

  const rows = areas
    .map((a, idx) => ({
      region: (a.region ?? '').trim(),
      prefectures: (a.prefectures ?? []).map((p) => p.trim()).filter(Boolean),
      fee: a.fee?.trim() || null,
      sort_order: idx + 1,
    }))
    .filter((a) => a.region) // 地域名が空の行は保存しない

  // 全置換（単一管理者運用のため delete → insert のシンプルな方式）
  const { error: delErr } = await adminSupabase.from('gift_shipping_areas').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  if (delErr) return { error: delErr.message }

  if (rows.length > 0) {
    const { error: insErr } = await adminSupabase.from('gift_shipping_areas').insert(rows)
    if (insErr) return { error: insErr.message }
  }

  revalidatePath('/gift')
  return { success: true }
}
