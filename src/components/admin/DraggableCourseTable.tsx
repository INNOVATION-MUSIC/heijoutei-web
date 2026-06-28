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
import CourseDeleteButton from '@/components/admin/CourseDeleteButton'
import CourseDuplicateButton from '@/components/admin/CourseDuplicateButton'
import { reorderCourses } from '@/lib/actions/courses'

export type CourseRow = {
  id: string
  name: string
  type_label: string | null
  price_label: string | null
  is_active: boolean | null
  categoryName: string | null
}

function Row({ course, index }: { course: CourseRow; index: number }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: course.id })
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 }
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
      <td className="px-4 py-3 text-[#9a9aa8]">{course.categoryName ?? <span className="text-[#5a5a6a]">未分類</span>}</td>
      <td className="px-4 py-3 font-medium text-[#ebe5db]">{course.name}</td>
      <td className="px-4 py-3 text-[#9a9aa8]">{course.type_label ?? '—'}</td>
      <td className="px-4 py-3 text-[#9a9aa8]">{course.price_label ?? '—'}</td>
      <td className="px-4 py-3">
        {course.is_active ? (
          <span className="rounded-full bg-green-900/30 px-2 py-0.5 text-xs text-green-400">公開中</span>
        ) : (
          <span className="rounded-full bg-gray-900/40 px-2 py-0.5 text-xs text-gray-400">非公開</span>
        )}
      </td>
      <td className="px-4 py-3 text-right">
        <div className="flex items-center justify-end gap-3">
          <Link href={`/admin/courses/${course.id}/edit`} className="text-xs text-[#d9b86b] hover:underline">編集</Link>
          <CourseDuplicateButton id={course.id} name={course.name} />
          <CourseDeleteButton id={course.id} name={course.name} />
        </div>
      </td>
    </tr>
  )
}

// 1店舗ぶんのコースをドラッグ並べ替えできる表。並べ替え時に sort_order を振り直す。
export default function DraggableCourseTable({ storeName, initial }: { storeName: string; initial: CourseRow[] }) {
  const [rows, setRows] = useState<CourseRow[]>(initial)
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }))

  async function handleDragEnd(e: DragEndEvent) {
    const { active, over } = e
    if (!over || active.id === over.id) return
    const oldIdx = rows.findIndex((r) => r.id === active.id)
    const newIdx = rows.findIndex((r) => r.id === over.id)
    const next = arrayMove(rows, oldIdx, newIdx)
    setRows(next)
    await reorderCourses(next.map((r) => r.id))
  }

  return (
    <div className="space-y-2">
      <h2 className="text-sm font-semibold text-[#ebe5db]">{storeName}</h2>
      <div className="overflow-x-auto rounded-xl border border-[#23232e] bg-[#14141a]">
        <table className="w-full min-w-[680px] text-sm">
          <thead>
            <tr className="border-b border-[#23232e] bg-[#1a1a22] text-left text-xs text-[#6f6f80]">
              <th className="w-10 px-2 py-3"></th>
              <th className="w-12 px-3 py-3 font-medium">順</th>
              <th className="px-4 py-3 font-medium">カテゴリ</th>
              <th className="px-4 py-3 font-medium">コース名</th>
              <th className="px-4 py-3 font-medium">種別</th>
              <th className="px-4 py-3 font-medium">価格</th>
              <th className="px-4 py-3 font-medium">状態</th>
              <th className="px-4 py-3 text-right font-medium">操作</th>
            </tr>
          </thead>
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={rows.map((r) => r.id)} strategy={verticalListSortingStrategy}>
              <tbody>
                {rows.map((c, i) => (
                  <Row key={c.id} course={c} index={i} />
                ))}
              </tbody>
            </SortableContext>
          </DndContext>
        </table>
      </div>
    </div>
  )
}
