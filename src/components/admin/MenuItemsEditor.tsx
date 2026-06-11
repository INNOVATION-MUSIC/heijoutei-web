'use client'

import ImageUploader from '@/components/admin/ImageUploader'
import type { MenuItemInput } from '@/lib/actions/menus'

const inputClass =
  'w-full rounded-lg border border-[#2f2f3c] bg-[#0a0a0f] px-3 py-2 text-sm text-[#ebe5db] focus:border-[#d9b86b] focus:outline-none'

export default function MenuItemsEditor({
  items,
  onChange,
}: {
  items: MenuItemInput[]
  onChange: (items: MenuItemInput[]) => void
}) {
  function update(idx: number, patch: Partial<MenuItemInput>) {
    onChange(items.map((it, i) => (i === idx ? { ...it, ...patch } : it)))
  }
  function add() {
    onChange([...items, { name: '', description: '', price_label: '', image_url: '' }])
  }
  function remove(idx: number) {
    onChange(items.filter((_, i) => i !== idx))
  }
  function move(idx: number, dir: -1 | 1) {
    const next = [...items]
    const t = idx + dir
    if (t < 0 || t >= next.length) return
    ;[next[idx], next[t]] = [next[t], next[idx]]
    onChange(next)
  }

  return (
    <div className="space-y-3">
      {items.map((it, idx) => (
        <div key={idx} className="rounded-lg border border-[#2a2a36] bg-[#0f0f15] p-4">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-xs text-[#6f6f80]">項目 {idx + 1}</span>
            <div className="flex items-center gap-2 text-xs">
              <button type="button" onClick={() => move(idx, -1)} disabled={idx === 0} className="text-[#9a9aa8] disabled:opacity-30">▲</button>
              <button type="button" onClick={() => move(idx, 1)} disabled={idx === items.length - 1} className="text-[#9a9aa8] disabled:opacity-30">▼</button>
              <button type="button" onClick={() => remove(idx)} className="text-red-400/80 hover:text-red-400">削除</button>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-3">
              <input className={inputClass} value={it.name} onChange={(e) => update(idx, { name: e.target.value })} placeholder="品名 *" />
              <input className={inputClass} value={it.price_label ?? ''} onChange={(e) => update(idx, { price_label: e.target.value })} placeholder="価格表示（例: 1,200円 / 時価）" />
              <textarea className={`${inputClass} min-h-16`} value={it.description ?? ''} onChange={(e) => update(idx, { description: e.target.value })} placeholder="説明" />
            </div>
            <ImageUploader label="品目画像" value={it.image_url ?? ''} onChange={(url) => update(idx, { image_url: url })} />
          </div>
        </div>
      ))}
      <button type="button" onClick={add} className="rounded-lg border border-dashed border-[#2f2f3c] px-4 py-2 text-sm text-[#9a9aa8] hover:border-[#d9b86b]/40">
        ＋ 品目を追加
      </button>
    </div>
  )
}
