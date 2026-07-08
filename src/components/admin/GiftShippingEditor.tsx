'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import SaveSuccessBanner from '@/components/admin/SaveSuccessBanner'
import { saveGiftShipping } from '@/lib/actions/gift-shipping'
import type { GiftShippingArea } from '@/app/lib/giftData'

const fieldBase =
  'rounded-lg border border-[#2f2f3c] bg-[#0a0a0f] px-3 py-2 text-sm text-[#ebe5db] focus:border-[#d9b86b] focus:outline-none focus:ring-1 focus:ring-[#d9b86b]/30'

type Row = { key: string; region: string; prefecturesText: string; fee: string }

function newKey() {
  return typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : String(Math.random())
}

function EditorRow({
  row,
  index,
  onChange,
  onRemove,
}: {
  row: Row
  index: number
  onChange: (k: keyof Omit<Row, 'key'>, v: string) => void
  onRemove: () => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: row.key })
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 }
  return (
    <div ref={setNodeRef} style={style} className="flex items-start gap-2 rounded-lg border border-[#23232e] bg-[#14141a] p-3">
      <button
        type="button"
        {...attributes}
        {...listeners}
        className="mt-2 cursor-grab px-1 text-[#5a5a6a] hover:text-[#9a9aa8] active:cursor-grabbing"
        aria-label="ドラッグで並び替え"
      >
        ⠿
      </button>
      <span className="mt-2 w-5 flex-shrink-0 text-xs text-[#6f6f80]">{index + 1}</span>
      <div className="flex-shrink-0">
        <label className="mb-1 block text-[10px] text-[#6f6f80]">地域名</label>
        <input className={`${fieldBase} w-24`} value={row.region} onChange={(e) => onChange('region', e.target.value)} placeholder="関東" />
      </div>
      <div className="min-w-0 flex-1">
        <label className="mb-1 block text-[10px] text-[#6f6f80]">都道府県（1行に1つ）</label>
        <textarea className={`${fieldBase} min-h-24 w-full`} value={row.prefecturesText} onChange={(e) => onChange('prefecturesText', e.target.value)} placeholder={'東京都\n神奈川県'} />
      </div>
      <div className="flex-shrink-0">
        <label className="mb-1 block text-[10px] text-[#6f6f80]">送料</label>
        <input className={`${fieldBase} w-24`} value={row.fee} onChange={(e) => onChange('fee', e.target.value)} placeholder="1,310" />
      </div>
      <button type="button" onClick={onRemove} className="mt-6 flex-shrink-0 px-2 text-sm text-red-400/80 hover:text-red-400" aria-label="この地域を削除">✕</button>
    </div>
  )
}

export default function GiftShippingEditor({ initial }: { initial: GiftShippingArea[] }) {
  const router = useRouter()
  // 初期行は SSR/クライアントで一致する決定的キー（init-i）。追加行のみ newKey()。
  const [rows, setRows] = useState<Row[]>(
    initial.map((a, i) => ({ key: `init-${i}`, region: a.region, prefecturesText: a.prefectures.join('\n'), fee: a.fee })),
  )
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }))

  function updateRow(key: string, k: keyof Omit<Row, 'key'>, v: string) {
    setRows((rs) => rs.map((r) => (r.key === key ? { ...r, [k]: v } : r)))
  }
  function removeRow(key: string) {
    setRows((rs) => rs.filter((r) => r.key !== key))
  }
  function addRow() {
    setRows((rs) => [...rs, { key: newKey(), region: '', prefecturesText: '', fee: '' }])
  }
  function handleDragEnd(e: DragEndEvent) {
    const { active, over } = e
    if (!over || active.id === over.id) return
    setRows((rs) => arrayMove(rs, rs.findIndex((r) => r.key === active.id), rs.findIndex((r) => r.key === over.id)))
  }

  async function handleSave() {
    setSaving(true)
    setError(null)
    setSaved(false)
    const areas = rows.map((r) => ({
      region: r.region,
      prefectures: r.prefecturesText.split('\n').map((p) => p.trim()).filter(Boolean),
      fee: r.fee,
    }))
    const result = await saveGiftShipping(areas)
    if (result?.error) {
      setError(result.error)
      setSaving(false)
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }
    setSaving(false)
    setSaved(true)
    router.refresh()
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="space-y-4">
      <SaveSuccessBanner show={saved} backHref="/admin/gifts" />
      {error && (
        <div className="rounded-lg border border-red-800/50 bg-red-900/20 px-4 py-3 text-sm text-red-400">{error}</div>
      )}

      <div className="space-y-2">
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={rows.map((r) => r.key)} strategy={verticalListSortingStrategy}>
            {rows.map((row, i) => (
              <EditorRow
                key={row.key}
                row={row}
                index={i}
                onChange={(k, v) => updateRow(row.key, k, v)}
                onRemove={() => removeRow(row.key)}
              />
            ))}
          </SortableContext>
        </DndContext>
      </div>

      <button type="button" onClick={addRow} className="rounded-lg border border-[#2f2f3c] px-3 py-2 text-sm text-[#d9b86b] hover:bg-white/5">
        ＋ 地域を追加
      </button>

      <div className="flex gap-2 border-t border-[#23232e] pt-4">
        <button type="button" onClick={handleSave} disabled={saving} className="rounded-lg bg-[#d9b86b] px-6 py-2.5 text-sm font-medium text-[#1a1410] hover:opacity-90 disabled:opacity-50">
          {saving ? '保存中...' : '保存する'}
        </button>
      </div>
    </div>
  )
}
