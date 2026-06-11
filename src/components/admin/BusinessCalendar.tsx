'use client'

import { useEffect, useState, useCallback } from 'react'
import {
  getBusinessMonth,
  saveBusinessDay,
  deleteBusinessDay,
  bulkSetWeekday,
  type CalDay,
  type CalStatus,
} from '@/lib/actions/business-calendar'

const WEEK = ['日', '月', '火', '水', '木', '金', '土']

const STATUS_META: Record<CalStatus, { label: string; dot: string; mark: string }> = {
  open: { label: '通常営業', dot: 'bg-[#5a5a6a]', mark: '○' },
  closed: { label: '定休日', dot: 'bg-red-500', mark: '×' },
  special_closed: { label: '臨時休業', dot: 'bg-orange-500', mark: '△' },
  limited: { label: '時短・特別営業', dot: 'bg-[#d9b86b]', mark: '○' },
}

// 管理画面で選択可能なステータス（トップ Business days は定休日のみ表示するため、
// 通常営業 open / 時短・特別営業 limited は選択肢から除外）。
const SELECTABLE_STATUSES: CalStatus[] = ['closed', 'special_closed']

function iso(y: number, m: number, d: number) {
  return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`
}

export default function BusinessCalendar({ storeId, storeName }: { storeId: string; storeName: string }) {
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [data, setData] = useState<Record<string, CalDay>>({})
  const [selected, setSelected] = useState<string | null>(null)
  const [status, setStatus] = useState<CalStatus>('closed')
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setData(await getBusinessMonth(storeId, year, month))
    setLoading(false)
  }, [storeId, year, month])

  useEffect(() => {
    load()
    setSelected(null)
  }, [load])

  function selectDay(date: string) {
    setSelected(date)
    const d = data[date]
    setStatus(d?.status ?? 'closed')
    setNote(d?.note ?? '')
  }

  function prevMonth() { if (month === 1) { setYear(year - 1); setMonth(12) } else setMonth(month - 1) }
  function nextMonth() { if (month === 12) { setYear(year + 1); setMonth(1) } else setMonth(month + 1) }

  async function handleSave() {
    if (!selected) return
    setSaving(true)
    const result = await saveBusinessDay(storeId, selected, status, note)
    setSaving(false)
    if (result?.error) { alert(result.error); return }
    await load()
  }
  async function handleReset() {
    if (!selected) return
    setSaving(true)
    await deleteBusinessDay(storeId, selected)
    setSaving(false)
    await load()
  }
  async function handleBulkTuesday() {
    if (!confirm(`${year}年${month}月の毎週火曜日を定休日に設定します。よろしいですか？`)) return
    setSaving(true)
    await bulkSetWeekday(storeId, year, month, 2, 'closed')
    setSaving(false)
    await load()
  }

  const firstDow = new Date(year, month - 1, 1).getDay()
  const daysInMonth = new Date(year, month, 0).getDate()
  const cells: (number | null)[] = []
  for (let i = 0; i < firstDow; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-[#23232e] bg-[#14141a] px-4 py-2.5 text-sm text-[#9a9aa8]">
        対象店舗：<span className="text-[#ebe5db]">{storeName}</span>（トップページの Business days セクションに連動）
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
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
              const cd = data[date]
              const isSel = selected === date
              return (
                <button
                  key={i}
                  onClick={() => selectDay(date)}
                  className={`relative flex h-11 flex-col items-center justify-center rounded-lg text-sm transition-colors ${
                    isSel ? 'bg-[#d9b86b]/20 text-[#ebe5db] ring-1 ring-[#d9b86b]' : 'text-[#c8c8d0] hover:bg-white/5'
                  }`}
                >
                  {d}
                  {cd && <span className={`absolute bottom-1 h-1.5 w-1.5 rounded-full ${STATUS_META[cd.status].dot}`} />}
                </button>
              )
            })}
          </div>
          <div className="mt-4 flex flex-wrap gap-3 text-xs text-[#6f6f80]">
            {SELECTABLE_STATUSES.map((s) => (
              <span key={s} className="flex items-center gap-1"><span className={`h-2 w-2 rounded-full ${STATUS_META[s].dot}`} />{STATUS_META[s].label}</span>
            ))}
          </div>
          <button onClick={handleBulkTuesday} disabled={saving} className="mt-4 rounded-md border border-[#2f2f3c] px-3 py-1.5 text-xs text-[#9a9aa8] hover:text-[#ebe5db] disabled:opacity-50">
            毎週火曜日を定休日に設定（{month}月）
          </button>
        </div>

        <div className="rounded-xl border border-[#23232e] bg-[#14141a] p-5">
          {!selected ? (
            <p className="py-10 text-center text-sm text-[#6f6f80]">日付を選択してください</p>
          ) : (
            <div className="space-y-4">
              <p className="text-sm font-medium text-[#ebe5db]">{selected} の設定</p>
              <div>
                <label className="mb-1.5 block text-xs text-[#9a9aa8]">ステータス</label>
                <select value={status} onChange={(e) => setStatus(e.target.value as CalStatus)} className="w-full rounded-lg border border-[#2f2f3c] bg-[#0a0a0f] px-3 py-2 text-sm text-[#ebe5db]">
                  {SELECTABLE_STATUSES.map((s) => (
                    <option key={s} value={s}>{STATUS_META[s].label}（{STATUS_META[s].mark}）</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-xs text-[#9a9aa8]">備考（「貸切」等）</label>
                <input value={note} onChange={(e) => setNote(e.target.value)} className="w-full rounded-lg border border-[#2f2f3c] bg-[#0a0a0f] px-3 py-2 text-sm text-[#ebe5db]" />
              </div>
              <div className="flex gap-2">
                <button onClick={handleSave} disabled={saving} className="flex-1 rounded-lg bg-[#d9b86b] py-2.5 text-sm font-medium text-[#1a1410] hover:opacity-90 disabled:opacity-50">
                  {saving ? '保存中...' : '保存'}
                </button>
                <button onClick={handleReset} disabled={saving} className="rounded-lg border border-[#2f2f3c] px-4 py-2.5 text-sm text-[#9a9aa8] hover:text-[#ebe5db] disabled:opacity-50">
                  設定解除
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
