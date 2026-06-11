'use client'

import { useEffect, useState, useCallback } from 'react'
import { getMonthSlots, saveDaySlot, type DaySlot, type SlotTime } from '@/lib/actions/takeout-slots'
import { defaultTimeLabels } from '@/lib/takeout-times'
import type { StoreRef } from '@/lib/actions/refs'

const WEEK = ['日', '月', '火', '水', '木', '金', '土']
const DEFAULT_CAPACITY = 5

function iso(y: number, m: number, d: number) {
  return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`
}

function freshDay(date: string): DaySlot {
  return {
    date,
    is_closed: false,
    default_capacity: DEFAULT_CAPACITY,
    times: defaultTimeLabels().map((time_label) => ({ time_label, capacity: DEFAULT_CAPACITY, is_active: true })),
  }
}

// 保存済みの DaySlot を全デフォルト枠に揃える（未保存ラベルは非アクティブ扱い）
function normalizeDay(saved: DaySlot): DaySlot {
  const map = new Map(saved.times.map((t) => [t.time_label, t]))
  const times: SlotTime[] = defaultTimeLabels().map((label) => {
    const hit = map.get(label)
    return hit ?? { time_label: label, capacity: saved.default_capacity, is_active: false }
  })
  return { ...saved, times }
}

export default function TakeoutCalendar({ stores }: { stores: StoreRef[] }) {
  const [storeId, setStoreId] = useState(stores[0]?.id ?? '')
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth() + 1) // 1-12
  const [monthData, setMonthData] = useState<Record<string, DaySlot>>({})
  const [selected, setSelected] = useState<string | null>(null)
  const [editing, setEditing] = useState<DaySlot | null>(null)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [bulkCap, setBulkCap] = useState(DEFAULT_CAPACITY)

  const load = useCallback(async () => {
    if (!storeId) return
    setLoading(true)
    const data = await getMonthSlots(storeId, year, month)
    setMonthData(data)
    setLoading(false)
  }, [storeId, year, month])

  useEffect(() => {
    load()
    setSelected(null)
    setEditing(null)
  }, [load])

  function selectDay(date: string) {
    setSelected(date)
    const saved = monthData[date]
    setEditing(saved ? normalizeDay(saved) : freshDay(date))
  }

  function prevMonth() {
    if (month === 1) { setYear(year - 1); setMonth(12) } else setMonth(month - 1)
  }
  function nextMonth() {
    if (month === 12) { setYear(year + 1); setMonth(1) } else setMonth(month + 1)
  }

  function toggleTime(idx: number) {
    if (!editing) return
    setEditing({ ...editing, times: editing.times.map((t, i) => (i === idx ? { ...t, is_active: !t.is_active } : t)) })
  }
  function setAllActive(active: boolean) {
    if (!editing) return
    setEditing({ ...editing, is_closed: active ? editing.is_closed : editing.is_closed, times: editing.times.map((t) => ({ ...t, is_active: active })) })
  }
  function applyBulkCapacity() {
    if (!editing) return
    setEditing({ ...editing, default_capacity: bulkCap, times: editing.times.map((t) => ({ ...t, capacity: bulkCap })) })
  }

  async function handleSave() {
    if (!editing) return
    setSaving(true)
    const result = await saveDaySlot(storeId, editing)
    setSaving(false)
    if (result?.error) { alert(result.error); return }
    await load()
  }

  // カレンダーセル
  const firstDow = new Date(year, month - 1, 1).getDay()
  const daysInMonth = new Date(year, month, 0).getDate()
  const cells: (number | null)[] = []
  for (let i = 0; i < firstDow; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)

  function dot(date: string) {
    const s = monthData[date]
    if (!s) return null
    if (s.is_closed) return 'bg-red-500'
    const hasActive = s.times.some((t) => t.is_active)
    return hasActive ? 'bg-green-500' : 'bg-[#5a5a6a]'
  }

  return (
    <div className="space-y-4">
      {/* 店舗タブ */}
      <div className="flex flex-wrap gap-2">
        {stores.map((s) => (
          <button
            key={s.id}
            onClick={() => setStoreId(s.id)}
            className={`rounded-lg px-3 py-1.5 text-sm transition-colors ${
              storeId === s.id ? 'bg-[#d9b86b] font-medium text-[#1a1410]' : 'border border-[#2f2f3c] text-[#9a9aa8] hover:text-[#ebe5db]'
            }`}
          >
            {s.name}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* カレンダー */}
        <div className="rounded-xl border border-[#23232e] bg-[#14141a] p-5">
          <div className="mb-4 flex items-center justify-between">
            <button onClick={prevMonth} className="rounded-md border border-[#2f2f3c] px-2 py-1 text-sm text-[#9a9aa8] hover:text-[#ebe5db]">◀</button>
            <p className="text-sm font-medium text-[#ebe5db]">{year}年 {month}月{loading && ' …'}</p>
            <button onClick={nextMonth} className="rounded-md border border-[#2f2f3c] px-2 py-1 text-sm text-[#9a9aa8] hover:text-[#ebe5db]">▶</button>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center">
            {WEEK.map((w, i) => (
              <div key={w} className={`py-1 text-xs ${i === 0 ? 'text-red-400' : i === 6 ? 'text-blue-400' : 'text-[#6f6f80]'}`}>{w}</div>
            ))}
            {cells.map((d, i) => {
              if (d === null) return <div key={i} />
              const date = iso(year, month, d)
              const isSel = selected === date
              const dotColor = dot(date)
              return (
                <button
                  key={i}
                  onClick={() => selectDay(date)}
                  className={`relative flex h-11 flex-col items-center justify-center rounded-lg text-sm transition-colors ${
                    isSel ? 'bg-[#d9b86b]/20 text-[#ebe5db] ring-1 ring-[#d9b86b]' : 'text-[#c8c8d0] hover:bg-white/5'
                  }`}
                >
                  {d}
                  {dotColor && <span className={`absolute bottom-1 h-1.5 w-1.5 rounded-full ${dotColor}`} />}
                </button>
              )
            })}
          </div>
          <div className="mt-4 flex gap-4 text-xs text-[#6f6f80]">
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-green-500" />受付あり</span>
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-red-500" />停止</span>
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-[#5a5a6a]" />全枠OFF</span>
          </div>
        </div>

        {/* 選択日の設定 */}
        <div className="rounded-xl border border-[#23232e] bg-[#14141a] p-5">
          {!editing ? (
            <p className="py-10 text-center text-sm text-[#6f6f80]">日付を選択してください</p>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-[#ebe5db]">{editing.date} の受付設定</p>
                <label className="flex items-center gap-1.5 text-xs text-[#ebe5db]">
                  <input type="checkbox" checked={editing.is_closed} onChange={(e) => setEditing({ ...editing, is_closed: e.target.checked })} className="accent-red-500" />
                  この日を受付停止
                </label>
              </div>

              <div className="flex flex-wrap gap-2">
                <button onClick={() => setAllActive(true)} className="rounded-md border border-[#2f2f3c] px-3 py-1 text-xs text-[#9a9aa8] hover:text-[#ebe5db]">全枠を開く</button>
                <button onClick={() => setAllActive(false)} className="rounded-md border border-[#2f2f3c] px-3 py-1 text-xs text-[#9a9aa8] hover:text-[#ebe5db]">全枠を停止</button>
                <div className="flex items-center gap-1">
                  <input type="number" value={bulkCap} onChange={(e) => setBulkCap(Number(e.target.value))} className="w-16 rounded-md border border-[#2f2f3c] bg-[#0a0a0f] px-2 py-1 text-xs text-[#ebe5db]" min={0} />
                  <button onClick={applyBulkCapacity} className="rounded-md border border-[#2f2f3c] px-2 py-1 text-xs text-[#9a9aa8] hover:text-[#ebe5db]">定員一括</button>
                </div>
              </div>

              <div className={`grid grid-cols-3 gap-1.5 ${editing.is_closed ? 'pointer-events-none opacity-40' : ''}`}>
                {editing.times.map((t, idx) => (
                  <button
                    key={t.time_label}
                    onClick={() => toggleTime(idx)}
                    className={`rounded-md border px-1 py-1.5 text-xs transition-colors ${
                      t.is_active ? 'border-[#d9b86b] bg-[#d9b86b]/15 text-[#ebe5db]' : 'border-[#2f2f3c] text-[#6f6f80]'
                    }`}
                  >
                    {t.time_label.replace(/ /g, '')}
                  </button>
                ))}
              </div>

              <button onClick={handleSave} disabled={saving} className="w-full rounded-lg bg-[#d9b86b] py-2.5 text-sm font-medium text-[#1a1410] hover:opacity-90 disabled:opacity-50">
                {saving ? '保存中...' : 'この日を保存'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
