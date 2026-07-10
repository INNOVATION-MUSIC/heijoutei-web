'use client'

import { useState } from 'react'
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
import CategoryImageCell from '@/components/admin/CategoryImageCell'
import CategoryStoreCell from '@/components/admin/CategoryStoreCell'
import {
  createCategory,
  updateCategory,
  deleteCategory,
  reorderCategories,
  type Category,
  type CategoryKind,
} from '@/lib/actions/categories'
import type { StoreRef } from '@/lib/actions/refs'

const inputClass =
  'rounded-md border border-[#2f2f3c] bg-[#0a0a0f] px-2.5 py-1.5 text-sm text-[#ebe5db] focus:border-[#d9b86b] focus:outline-none'

function Row({
  cat,
  kind,
  stores,
  onChange,
  onDelete,
}: {
  cat: Category
  kind: CategoryKind
  stores: StoreRef[]
  onChange: (patch: Partial<Category>) => void
  onDelete: () => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: cat.id })
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <tr ref={setNodeRef} style={style} className="border-b border-[#1d1d26] last:border-0">
      <td className="px-2 py-2">
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
      {kind === 'menu' && (
        <td className="px-2 py-2">
          <CategoryImageCell
            value={cat.card_image_url}
            onChange={(url) => {
              onChange({ card_image_url: url })
              updateCategory(kind, cat.id, { card_image_url: url })
            }}
          />
        </td>
      )}
      <td className="px-2 py-2">
        <input
          className={`${inputClass} w-full`}
          value={cat.name}
          onChange={(e) => onChange({ name: e.target.value })}
          onBlur={(e) => updateCategory(kind, cat.id, { name: e.target.value })}
        />
      </td>
      <td className="px-2 py-2">
        <input
          className={`${inputClass} w-full`}
          value={cat.slug}
          onChange={(e) => onChange({ slug: e.target.value })}
          onBlur={(e) => updateCategory(kind, cat.id, { slug: e.target.value })}
        />
      </td>
      {kind === 'menu' && (
        <td className="px-2 py-2">
          <CategoryStoreCell
            stores={stores}
            value={cat.store_ids}
            onChange={(ids) => {
              onChange({ store_ids: ids })
              updateCategory(kind, cat.id, { store_ids: ids })
            }}
          />
        </td>
      )}
      <td className="px-2 py-2 text-center">
        <input
          type="checkbox"
          checked={cat.is_active ?? true}
          onChange={(e) => {
            onChange({ is_active: e.target.checked })
            updateCategory(kind, cat.id, { is_active: e.target.checked })
          }}
          className="accent-[#d9b86b]"
        />
      </td>
      <td className="px-2 py-2 text-right">
        <button type="button" onClick={onDelete} className="text-xs text-red-400/80 hover:text-red-400">
          削除
        </button>
      </td>
    </tr>
  )
}

export default function DraggableCategoryTable({
  kind,
  initial,
  stores = [],
}: {
  kind: CategoryKind
  initial: Category[]
  stores?: StoreRef[]
}) {
  const [cats, setCats] = useState<Category[]>(initial)
  const [newName, setNewName] = useState('')
  const [newSlug, setNewSlug] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }))

  function patchRow(id: string, patch: Partial<Category>) {
    setCats((cs) => cs.map((c) => (c.id === id ? { ...c, ...patch } : c)))
  }

  async function handleDragEnd(e: DragEndEvent) {
    const { active, over } = e
    if (!over || active.id === over.id) return
    const oldIdx = cats.findIndex((c) => c.id === active.id)
    const newIdx = cats.findIndex((c) => c.id === over.id)
    const next = arrayMove(cats, oldIdx, newIdx)
    setCats(next)
    await reorderCategories(kind, next.map((c) => c.id))
  }

  async function handleAdd() {
    if (!newName.trim()) return
    setBusy(true)
    setError(null)
    const result = await createCategory(kind, newName, newSlug || undefined)
    if (result?.error) {
      setError(result.error)
      setBusy(false)
      return
    }
    setNewName('')
    setNewSlug('')
    // 反映のため最新を取り直す代わりに簡易追加。次回ロードで sort_order 正規化される。
    const tmpId = crypto.randomUUID()
    setCats((cs) => [
      ...cs,
      { id: tmpId, name: newName.trim(), slug: newSlug.trim() || newName.trim(), is_active: true, sort_order: cs.length + 1 },
    ])
    setBusy(false)
  }

  async function handleDelete(id: string) {
    const target = cats.find((c) => c.id === id)
    if (!confirm(`「${target?.name}」を削除しますか？`)) return
    const result = await deleteCategory(kind, id)
    if (result?.error) {
      setError(result.error)
      return
    }
    setError(null)
    setCats((cs) => cs.filter((c) => c.id !== id))
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="rounded-lg border border-red-800/50 bg-red-900/20 px-4 py-2.5 text-sm text-red-400">
          {error}
        </div>
      )}

      <div className="overflow-x-auto rounded-xl border border-[#23232e] bg-[#14141a]">
        <table className="w-full min-w-[640px] text-sm">
          <thead>
            <tr className="border-b border-[#23232e] bg-[#1a1a22] text-left text-xs text-[#6f6f80]">
              <th className="w-10 px-2 py-3"></th>
              {kind === 'menu' && <th className="w-24 px-2 py-3 font-medium">カード画像</th>}
              <th className="px-2 py-3 font-medium">カテゴリ名</th>
              <th className="px-2 py-3 font-medium">スラッグ</th>
              {kind === 'menu' && <th className="w-44 px-2 py-3 font-medium">対象店舗</th>}
              <th className="w-16 px-2 py-3 text-center font-medium">表示</th>
              <th className="w-16 px-2 py-3 text-right font-medium">操作</th>
            </tr>
          </thead>
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={cats.map((c) => c.id)} strategy={verticalListSortingStrategy}>
              <tbody>
                {cats.map((cat) => (
                  <Row
                    key={cat.id}
                    cat={cat}
                    kind={kind}
                    stores={stores}
                    onChange={(patch) => patchRow(cat.id, patch)}
                    onDelete={() => handleDelete(cat.id)}
                  />
                ))}
              </tbody>
            </SortableContext>
          </DndContext>
        </table>
      </div>

      <div className="flex items-end gap-3 rounded-xl border border-[#23232e] bg-[#14141a] p-4">
        <div className="flex-1">
          <label className="mb-1 block text-xs text-[#9a9aa8]">新規カテゴリ名</label>
          <input className={`${inputClass} w-full`} value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="例: 名物" />
        </div>
        <div className="flex-1">
          <label className="mb-1 block text-xs text-[#9a9aa8]">スラッグ（任意）</label>
          <input className={`${inputClass} w-full`} value={newSlug} onChange={(e) => setNewSlug(e.target.value)} placeholder="例: meibutsu" />
        </div>
        <button
          type="button"
          onClick={handleAdd}
          disabled={busy || !newName.trim()}
          className="rounded-lg bg-[#d9b86b] px-4 py-2 text-sm font-medium text-[#1a1410] hover:opacity-90 disabled:opacity-50"
        >
          ＋ 追加
        </button>
      </div>
      <p className="text-xs text-[#5a5a6a]">行をドラッグで並び替え。名前・スラッグは編集後フォーカスを外すと保存されます。</p>
    </div>
  )
}
