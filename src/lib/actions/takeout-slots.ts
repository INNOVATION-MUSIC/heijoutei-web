'use server'

import { adminSupabase } from '@/lib/supabase/admin'
import { isAuthed } from '@/lib/auth-guard'
import { defaultTimeLabels } from '@/lib/takeout-times'
import { revalidatePath } from 'next/cache'

export type SlotTime = { time_label: string; capacity: number; is_active: boolean }
export type DaySlot = {
  date: string // YYYY-MM-DD
  is_closed: boolean
  default_capacity: number
  times: SlotTime[]
}

// 指定月の受付枠を取得（date → DaySlot）
export async function getMonthSlots(
  storeId: string,
  year: number,
  month: number // 1-12
): Promise<Record<string, DaySlot>> {
  if (!(await isAuthed())) return {}
  const start = `${year}-${String(month).padStart(2, '0')}-01`
  const endDate = new Date(year, month, 0).getDate()
  const end = `${year}-${String(month).padStart(2, '0')}-${String(endDate).padStart(2, '0')}`

  const { data: slots } = await adminSupabase
    .from('takeout_slots')
    .select('id, available_date, default_capacity, is_closed')
    .eq('store_id', storeId)
    .gte('available_date', start)
    .lte('available_date', end)

  const slotIds = (slots ?? []).map((s) => s.id)
  const timesBySlot = new Map<string, SlotTime[]>()
  if (slotIds.length) {
    const { data: times } = await adminSupabase
      .from('takeout_slot_times')
      .select('slot_id, time_label, capacity, is_active, sort_order')
      .in('slot_id', slotIds)
      .order('sort_order')
    for (const t of times ?? []) {
      const arr = timesBySlot.get(t.slot_id) ?? []
      arr.push({ time_label: t.time_label, capacity: t.capacity, is_active: t.is_active ?? true })
      timesBySlot.set(t.slot_id, arr)
    }
  }

  const result: Record<string, DaySlot> = {}
  for (const s of slots ?? []) {
    result[s.available_date] = {
      date: s.available_date,
      is_closed: s.is_closed ?? false,
      default_capacity: s.default_capacity,
      times: timesBySlot.get(s.id) ?? [],
    }
  }
  return result
}

// 1日分の受付枠を upsert（slot を upsert し、slot_times を総入れ替え）
export async function saveDaySlot(storeId: string, day: DaySlot) {
  if (!(await isAuthed())) return { error: '認証が必要です' }

  const { data: slot, error } = await adminSupabase
    .from('takeout_slots')
    .upsert(
      {
        store_id: storeId,
        available_date: day.date,
        default_capacity: day.default_capacity,
        is_closed: day.is_closed,
      },
      { onConflict: 'store_id,available_date' }
    )
    .select('id')
    .single()
  if (error || !slot) return { error: error?.message ?? '保存に失敗しました' }

  await adminSupabase.from('takeout_slot_times').delete().eq('slot_id', slot.id)
  const rows = day.times.map((t, idx) => ({
    slot_id: slot.id,
    time_label: t.time_label,
    capacity: t.capacity,
    is_active: t.is_active,
    sort_order: idx,
  }))
  if (rows.length) await adminSupabase.from('takeout_slot_times').insert(rows)

  revalidatePath('/takeout')
  return { success: true }
}

// 指定月の全日をまとめて受付 or 停止に設定する（「全日を開く／停止」一括操作）。
// mode='open': 全日 is_closed=false ＋ 既定の全時間枠を有効化／'closed': 全日 is_closed=true。
export async function saveMonthSlots(
  storeId: string,
  year: number,
  month: number, // 1-12
  mode: 'open' | 'closed',
  capacity = 5
) {
  if (!(await isAuthed())) return { error: '認証が必要です' }
  if (!storeId) return { error: '店舗を選択してください' }

  const daysInMonth = new Date(year, month, 0).getDate()
  const dates: string[] = []
  for (let d = 1; d <= daysInMonth; d++) {
    dates.push(`${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`)
  }

  // 全日分の slot をまとめて upsert
  const slotRows = dates.map((available_date) => ({
    store_id: storeId,
    available_date,
    default_capacity: capacity,
    is_closed: mode === 'closed',
  }))
  const { data: slots, error } = await adminSupabase
    .from('takeout_slots')
    .upsert(slotRows, { onConflict: 'store_id,available_date' })
    .select('id')
  if (error || !slots) return { error: error?.message ?? '一括保存に失敗しました' }

  // 既存の時間枠を総入れ替え
  const slotIds = slots.map((s) => s.id)
  if (slotIds.length) await adminSupabase.from('takeout_slot_times').delete().in('slot_id', slotIds)

  if (mode === 'open') {
    const labels = defaultTimeLabels()
    const timeRows = slots.flatMap((s) =>
      labels.map((time_label, idx) => ({
        slot_id: s.id,
        time_label,
        capacity,
        is_active: true,
        sort_order: idx,
      }))
    )
    if (timeRows.length) await adminSupabase.from('takeout_slot_times').insert(timeRows)
  }

  revalidatePath('/takeout')
  return { success: true }
}
