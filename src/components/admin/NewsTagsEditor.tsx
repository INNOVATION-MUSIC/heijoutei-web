'use client'

import type { NewsTagInput } from '@/lib/actions/news'

// フロント newsData.ts と統一したタグ色プリセット
const PRESETS: { label: string; color: string }[] = [
  { label: 'お知らせ', color: '#e18e3b' },
  { label: 'ブログ', color: '#2563a0' },
  { label: '店舗', color: '#16871d' },
  { label: 'NEW', color: '#da3425' },
]
const PALETTE = ['#e18e3b', '#2563a0', '#16871d', '#da3425', '#d9b86b', '#6f6f80']

const inputClass = 'rounded-md border border-[#2f2f3c] bg-[#0a0a0f] px-2.5 py-1.5 text-sm text-[#ebe5db] focus:border-[#d9b86b] focus:outline-none'

export default function NewsTagsEditor({
  tags,
  onChange,
}: {
  tags: NewsTagInput[]
  onChange: (tags: NewsTagInput[]) => void
}) {
  function update(idx: number, patch: Partial<NewsTagInput>) {
    onChange(tags.map((t, i) => (i === idx ? { ...t, ...patch } : t)))
  }
  function remove(idx: number) {
    onChange(tags.filter((_, i) => i !== idx))
  }

  return (
    <div className="space-y-3">
      {tags.map((t, idx) => (
        <div key={idx} className="flex items-center gap-2">
          <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium text-white" style={{ backgroundColor: t.color }}>
            {t.label || 'タグ'}
          </span>
          <input className={`${inputClass} flex-1`} value={t.label} onChange={(e) => update(idx, { label: e.target.value })} placeholder="ラベル" />
          <div className="flex items-center gap-1">
            {PALETTE.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => update(idx, { color: c })}
                className={`h-5 w-5 rounded-full border ${t.color === c ? 'border-white' : 'border-transparent'}`}
                style={{ backgroundColor: c }}
                aria-label={c}
              />
            ))}
          </div>
          <button type="button" onClick={() => remove(idx)} className="text-xs text-red-400/80 hover:text-red-400">削除</button>
        </div>
      ))}

      <div className="flex flex-wrap gap-2">
        {PRESETS.map((p) => (
          <button
            key={p.label}
            type="button"
            onClick={() => onChange([...tags, { label: p.label, color: p.color }])}
            className="rounded-md border border-[#2f2f3c] px-2.5 py-1 text-xs text-[#9a9aa8] hover:text-[#ebe5db]"
          >
            ＋ {p.label}
          </button>
        ))}
        <button
          type="button"
          onClick={() => onChange([...tags, { label: '', color: '#d9b86b' }])}
          className="rounded-md border border-dashed border-[#2f2f3c] px-2.5 py-1 text-xs text-[#9a9aa8] hover:text-[#ebe5db]"
        >
          ＋ カスタム
        </button>
      </div>
    </div>
  )
}
