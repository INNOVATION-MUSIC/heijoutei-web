'use server'

import { adminSupabase } from '@/lib/supabase/admin'
import { isAuthed } from '@/lib/auth-guard'
import { revalidatePath } from 'next/cache'

export type CalStatus = 'open' | 'closed' | 'special_closed' | 'limited'
export type CalDay = { date: string; status: CalStatus; note: string | null }

export async function getBusinessMonth(
  storeId: string,
  year: number,
  month: number
): Promise<Record<string, CalDay>> {
  const start = `${year}-${String(month).padStart(2, '0')}-01`
  const endDate = new Date(year, month, 0).getDate()
  const end = `${year}-${String(month).padStart(2, '0')}-${String(endDate).padStart(2, '0')}`
  const { data } = await adminSupabase
    .from('business_calendars')
    .select('date, status, note')
    .eq('store_id', storeId)
    .gte('date', start)
    .lte('date', end)
  const result: Record<string, CalDay> = {}
  for (const d of data ?? []) {
    result[d.date] = { date: d.date, status: d.status as CalStatus, note: d.note }
  }
  return result
}

export async function saveBusinessDay(storeId: string, date: string, status: CalStatus, note: string | null) {
  if (!(await isAuthed())) return { error: '認証が必要です' }
  const { error } = await adminSupabase
    .from('business_calendars')
    .upsert(
      { store_id: storeId, date, status, note: note?.trim() || null },
      { onConflict: 'store_id,date' }
    )
  if (error) return { error: error.message }
  revalidatePath('/')
  return { success: true }
}

export async function deleteBusinessDay(storeId: string, date: string) {
  if (!(await isAuthed())) return { error: '認証が必要です' }
  const { error } = await adminSupabase
    .from('business_calendars')
    .delete()
    .eq('store_id', storeId)
    .eq('date', date)
  if (error) return { error: error.message }
  revalidatePath('/')
  return { success: true }
}

// 指定月の特定曜日(0=日〜6=土)をまとめてステータス設定（例: 毎週火曜を定休日に）
export async function bulkSetWeekday(
  storeId: string,
  year: number,
  month: number,
  weekday: number,
  status: CalStatus
) {
  if (!(await isAuthed())) return { error: '認証が必要です' }
  const daysInMonth = new Date(year, month, 0).getDate()
  const rows: { store_id: string; date: string; status: CalStatus; note: null }[] = []
  for (let d = 1; d <= daysInMonth; d++) {
    if (new Date(year, month - 1, d).getDay() === weekday) {
      rows.push({
        store_id: storeId,
        date: `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`,
        status,
        note: null,
      })
    }
  }
  if (rows.length) {
    const { error } = await adminSupabase.from('business_calendars').upsert(rows, { onConflict: 'store_id,date' })
    if (error) return { error: error.message }
  }
  revalidatePath('/')
  return { success: true }
}
