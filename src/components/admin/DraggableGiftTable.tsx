'use client'

import { useState } from 'react'
import Link from 'next/link'
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
import GiftDeleteButton from '@/components/admin/GiftDeleteButton'
import GiftDuplicateButton from '@/components/admin/GiftDuplicateButton'
import { reorderGifts } from '@/lib/actions/gifts'

export type GiftRow = {
  id: string
  title: string
  price_amount: string | null
  price_note: string | null
  is_active: boolean | null
}

function Row({ gift, index }: { gift: GiftRow; index: number }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: gift.id })
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 }
  const price = [gift.price_amount, gift.price_note].filter(Boolean).join(' ') || '—'
  return (
    <tr ref={setNodeRef} style={style} className="border-b border-[#1d1d26] last:border-0 hover:bg-white/[0.02]">
      <td className="px-2 py-3">
        <button
          type="button"
          {...attributes}
          {...listeners}
          className="cursor-grab px-1 text-[#5a5a6a] hover:text-[#9a9aa8] active:cursor-grabbing"
          aria-label="ドラッグで並び替え"
        >
          ⠿
        </button>
      </td>
      <td className="px-3 py-3 text-[#6f6f80]">{index + 1}</td>
      <td className="px-4 py-3 font-medium text-[#ebe5db]">{gift.title}</td>
      <td className="px-4 py-3 text-[#9a9aa8]">{price}</td>
      <td className="px-4 py-3">
        {gift.is_active ? (
          <span className="rounded-full bg-green-900/30 px-2 py-0.5 text-xs text-green-400">公開中</span>
        ) : (
          <span className="rounded-full bg-gray-900/40 px-2 py-0.5 text-xs text-gray-400">非公開</span>
        )}
      </td>
      <td className="px-4 py-3 text-right">
        <div className="flex items-center justify-end gap-3">
          <Link href={`/admin/gifts/${gift.id}/edit`} className="text-xs text-[#d9b86b] hover:underline">編集</Link>
          <GiftDuplicateButton id={gift.id} name={gift.title} />
          <GiftDeleteButton id={gift.id} name={gift.title} />
        </div>
      </td>
    </tr>
  )
}

// ギフト商品をドラッグ並べ替えできる表。並べ替え時に sort_order を振り直す。
export default function DraggableGiftTable({ initial }: { initial: GiftRow[] }) {
  const [rows, setRows] = useState<GiftRow[]>(initial)
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }))

  async function handleDragEnd(e: DragEndEvent) {
    const { active, over } = e
    if (!over || active.id === over.id) return
    const oldIdx = rows.findIndex((r) => r.id === active.id)
    const newIdx = rows.findIndex((r) => r.id === over.id)
    const next = arrayMove(rows, oldIdx, newIdx)
    setRows(next)
    await reorderGifts(next.map((r) => r.id))
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-[#23232e] bg-[#14141a]">
      <table className="w-full min-w-[640px] text-sm">
        <thead>
          <tr className="border-b border-[#23232e] bg-[#1a1a22] text-left text-xs text-[#6f6f80]">
            <th className="w-10 px-2 py-3"></th>
            <th className="w-12 px-3 py-3 font-medium">順</th>
            <th className="px-4 py-3 font-medium">商品名</th>
            <th className="px-4 py-3 font-medium">価格</th>
            <th className="px-4 py-3 font-medium">状態</th>
            <th className="px-4 py-3 text-right font-medium">操作</th>
          </tr>
        </thead>
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={rows.map((r) => r.id)} strategy={verticalListSortingStrategy}>
            <tbody>
              {rows.map((g, i) => (
                <Row key={g.id} gift={g} index={i} />
              ))}
            </tbody>
          </SortableContext>
        </DndContext>
      </table>
    </div>
  )
}
