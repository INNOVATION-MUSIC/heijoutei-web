'use client'

import type { DetailInput } from '@/lib/actions/recruitments'

const inputClass = 'rounded-md border border-[#2f2f3c] bg-[#0a0a0f] px-2.5 py-1.5 text-sm text-[#ebe5db] focus:border-[#d9b86b] focus:outline-none'

const PRESET_LABELS = ['職種', '雇用形態', '仕事内容', '給与', '勤務地', '勤務曜日・時間', '資格・経験', '待遇']

export default function RecruitmentDetailTable({
  details,
  onChange,
}: {
  details: DetailInput[]
  onChange: (d: DetailInput[]) => void
}) {
  function update(idx: number, patch: Partial<DetailInput>) {
    onChange(details.map((d, i) => (i === idx ? { ...d, ...patch } : d)))
  }
  function add(label = '') {
    onChange([...details, { label, value: '' }])
  }
  function remove(idx: number) {
    onChange(details.filter((_, i) => i !== idx))
  }
  function move(idx: number, dir: -1 | 1) {
    const next = [...details]
    const t = idx + dir
    if (t < 0 || t >= next.length) return
    ;[next[idx], next[t]] = [next[t], next[idx]]
    onChange(next)
  }

  return (
    <div className="space-y-3">
      {details.map((d, idx) => (
        <div key={idx} className="flex items-start gap-2">
          <input className={`${inputClass} w-40`} value={d.label} onChange={(e) => update(idx, { label: e.target.value })} placeholder="項目（例: 給与）" />
          <textarea className={`${inputClass} min-h-9 flex-1`} value={d.value} onChange={(e) => update(idx, { value: e.target.value })} placeholder="内容" />
          <div className="flex flex-col gap-1 pt-1 text-xs">
            <button type="button" onClick={() => move(idx, -1)} disabled={idx === 0} className="text-[#9a9aa8] disabled:opacity-30">▲</button>
            <button type="button" onClick={() => move(idx, 1)} disabled={idx === details.length - 1} className="text-[#9a9aa8] disabled:opacity-30">▼</button>
          </div>
          <button type="button" onClick={() => remove(idx)} className="pt-1.5 text-xs text-red-400/80 hover:text-red-400">削除</button>
        </div>
      ))}
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={() => add()} className="rounded-md border border-dashed border-[#2f2f3c] px-2.5 py-1 text-xs text-[#9a9aa8] hover:text-[#ebe5db]">＋ 行を追加</button>
        {PRESET_LABELS.map((l) => (
          <button key={l} type="button" onClick={() => add(l)} className="rounded-md border border-[#2f2f3c] px-2.5 py-1 text-xs text-[#6f6f80] hover:text-[#ebe5db]">＋ {l}</button>
        ))}
      </div>
    </div>
  )
}
