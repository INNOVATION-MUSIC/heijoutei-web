'use client'

import { useEffect, useRef, useState } from 'react'
import type { StoreRef } from '@/lib/actions/refs'

/**
 * カテゴリの対象店舗マルチセレクト。
 * 選択なし（空配列）＝全店表示。1店舗以上選ぶとその店舗のみ /menu カテゴリ一覧に表示。
 */
export default function CategoryStoreCell({
  stores,
  value,
  onChange,
}: {
  stores: StoreRef[]
  value: string[] | null | undefined
  onChange: (ids: string[]) => void
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const selected = value ?? []

  useEffect(() => {
    if (!open) return
    function onDocClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDocClick)
    return () => document.removeEventListener('mousedown', onDocClick)
  }, [open])

  function toggle(id: string) {
    const next = selected.includes(id) ? selected.filter((x) => x !== id) : [...selected, id]
    onChange(next)
  }

  const label =
    selected.length === 0
      ? '全店'
      : stores
          .filter((s) => selected.includes(s.id))
          .map((s) => s.name)
          .join('・') || `${selected.length}店舗`

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full truncate rounded-md border border-[#2f2f3c] bg-[#0a0a0f] px-2.5 py-1.5 text-left text-sm text-[#ebe5db] hover:border-[#d9b86b] focus:border-[#d9b86b] focus:outline-none"
        title={label}
      >
        <span className={selected.length === 0 ? 'text-[#9a9aa8]' : ''}>{label}</span>
      </button>
      {open && (
        <div className="absolute left-0 top-full z-20 mt-1 min-w-[180px] rounded-lg border border-[#2f2f3c] bg-[#14141a] p-1.5 shadow-xl">
          <button
            type="button"
            onClick={() => onChange([])}
            className={`mb-1 block w-full rounded px-2 py-1.5 text-left text-xs ${
              selected.length === 0 ? 'bg-[#d9b86b]/15 text-[#d9b86b]' : 'text-[#9a9aa8] hover:bg-[#1f1f29]'
            }`}
          >
            全店に表示（選択なし）
          </button>
          <div className="my-1 border-t border-[#23232e]" />
          {stores.map((s) => (
            <label
              key={s.id}
              className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-sm text-[#ebe5db] hover:bg-[#1f1f29]"
            >
              <input
                type="checkbox"
                checked={selected.includes(s.id)}
                onChange={() => toggle(s.id)}
                className="accent-[#d9b86b]"
              />
              {s.name}
            </label>
          ))}
        </div>
      )}
    </div>
  )
}
