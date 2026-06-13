'use client'

import type { TagInput } from '@/lib/actions/recruitments'

const PRESETS: { label: string; color: string }[] = [
  { label: 'アルバイト', color: '#e18e3b' },
  { label: 'パート', color: '#e18e3b' },
  { label: '正社員', color: '#2563a0' },
  { label: '店舗', color: '#16871d' },
]
const PALETTE = ['#e18e3b', '#2563a0', '#16871d', '#da3425', '#d9b86b', '#6f6f80']

const inputClass = 'rounded-md border border-[#2f2f3c] bg-[#0a0a0f] px-2.5 py-1.5 text-sm text-[#ebe5db] focus:border-[#d9b86b] focus:outline-none'

export default function SimpleTagsEditor({ tags, onChange }: { tags: TagInput[]; onChange: (t: TagInput[]) => void }) {
  function update(idx: number, patch: Partial<TagInput>) {
    onChange(tags.map((t, i) => (i === idx ? { ...t, ...patch } : t)))
  }
  function remove(idx: number) {
    onChange(tags.filter((_, i) => i !== idx))
  }
  return (
    <div className="space-y-3">
      {tags.map((t, idx) => (
        <div key={idx} className="space-y-2 rounded-lg border border-[#23232e] bg-[#0f0f15] p-2.5">
          <div className="flex items-center gap-2">
            <span className="inline-flex flex-shrink-0 items-center rounded-full px-2.5 py-0.5 text-xs font-medium text-white" style={{ backgroundColor: t.color }}>{t.label || 'タグ'}</span>
            <input className={`${inputClass} min-w-0 flex-1`} value={t.label} onChange={(e) => update(idx, { label: e.target.value })} placeholder="ラベル" />
            <button type="button" onClick={() => remove(idx)} className="flex-shrink-0 text-xs text-red-400/80 hover:text-red-400">削除</button>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            {PALETTE.map((c) => (
              <button key={c} type="button" onClick={() => update(idx, { color: c })} className={`h-5 w-5 rounded-full border ${t.color === c ? 'border-white' : 'border-transparent'}`} style={{ backgroundColor: c }} aria-label={c} />
            ))}
          </div>
        </div>
      ))}
      <div className="flex flex-wrap gap-2">
        {PRESETS.map((p) => (
          <button key={p.label} type="button" onClick={() => onChange([...tags, { label: p.label, color: p.color }])} className="rounded-md border border-[#2f2f3c] px-2.5 py-1 text-xs text-[#9a9aa8] hover:text-[#ebe5db]">＋ {p.label}</button>
        ))}
        <button type="button" onClick={() => onChange([...tags, { label: '', color: '#d9b86b' }])} className="rounded-md border border-dashed border-[#2f2f3c] px-2.5 py-1 text-xs text-[#9a9aa8] hover:text-[#ebe5db]">＋ カスタム</button>
      </div>
    </div>
  )
}
