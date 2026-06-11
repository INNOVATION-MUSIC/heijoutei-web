'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import ImageUploader from '@/components/admin/ImageUploader'
import { createCourse, updateCourse, type CoursePayload } from '@/lib/actions/courses'
import type { Tables } from '@/types/supabase'
import type { StoreRef } from '@/lib/actions/refs'

const inputClass =
  'w-full rounded-lg border border-[#2f2f3c] bg-[#0a0a0f] px-3 py-2 text-sm text-[#ebe5db] focus:border-[#d9b86b] focus:outline-none focus:ring-1 focus:ring-[#d9b86b]/30'
const labelClass = 'mb-1.5 block text-xs font-medium text-[#9a9aa8]'

export default function CourseForm({
  stores,
  initial,
  defaultStoreId,
}: {
  stores: StoreRef[]
  initial?: Tables<'courses'>
  defaultStoreId?: string
}) {
  const router = useRouter()
  const isEdit = Boolean(initial)
  const [form, setForm] = useState<CoursePayload>({
    store_id: initial?.store_id ?? defaultStoreId ?? stores[0]?.id ?? '',
    name: initial?.name ?? '',
    type_label: initial?.type_label ?? '',
    price_label: initial?.price_label ?? '',
    description: initial?.description ?? '',
    notes: initial?.notes ?? '',
    image_url: initial?.image_url ?? '',
    is_active: initial?.is_active ?? true,
    sort_order: initial?.sort_order ?? 0,
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function set<K extends keyof CoursePayload>(k: K, v: CoursePayload[K]) {
    setForm((f) => ({ ...f, [k]: v }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    const result = isEdit ? await updateCourse(initial!.id, form) : await createCourse(form)
    if (result?.error) {
      setError(result.error)
      setSaving(false)
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }
    router.push('/admin/courses')
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      {error && (
        <div className="rounded-lg border border-red-800/50 bg-red-900/20 px-4 py-3 text-sm text-red-400 lg:col-span-3">
          {error}
        </div>
      )}

      <div className="space-y-5 lg:col-span-2">
        <div className="space-y-4 rounded-xl border border-[#23232e] bg-[#14141a] p-5">
          <div>
            <label className={labelClass}>店舗 *</label>
            <select className={inputClass} value={form.store_id} onChange={(e) => set('store_id', e.target.value)}>
              {stores.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>コース名 *</label>
            <input className={inputClass} value={form.name} onChange={(e) => set('name', e.target.value)} required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>コース種別ラベル</label>
              <input className={inputClass} value={form.type_label ?? ''} onChange={(e) => set('type_label', e.target.value)} placeholder="例: 野菜とヘルシーなコース" />
            </div>
            <div>
              <label className={labelClass}>価格表示</label>
              <input className={inputClass} value={form.price_label ?? ''} onChange={(e) => set('price_label', e.target.value)} placeholder="例: ¥8,500〜" />
            </div>
          </div>
          <div>
            <label className={labelClass}>説明文</label>
            <textarea className={`${inputClass} min-h-20`} value={form.description ?? ''} onChange={(e) => set('description', e.target.value)} />
          </div>
          <div>
            <label className={labelClass}>注意事項（ページ下部に共通表示）</label>
            <textarea className={`${inputClass} min-h-16`} value={form.notes ?? ''} onChange={(e) => set('notes', e.target.value)} />
          </div>
        </div>
        <div className="rounded-xl border border-[#23232e] bg-[#14141a] p-5">
          <ImageUploader label="一覧カード画像" value={form.image_url ?? ''} onChange={(url) => set('image_url', url)} />
        </div>
      </div>

      <div className="space-y-5">
        <div className="space-y-4 rounded-xl border border-[#23232e] bg-[#14141a] p-5">
          <label className="flex items-center gap-2 text-sm text-[#ebe5db]">
            <input type="checkbox" checked={form.is_active ?? true} onChange={(e) => set('is_active', e.target.checked)} className="accent-[#d9b86b]" />
            公開する
          </label>
          <div>
            <label className={labelClass}>表示順</label>
            <input type="number" className={inputClass} value={form.sort_order ?? 0} onChange={(e) => set('sort_order', Number(e.target.value))} />
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <button type="submit" disabled={saving} className="rounded-lg bg-[#d9b86b] py-2.5 text-sm font-medium text-[#1a1410] hover:opacity-90 disabled:opacity-50">
            {saving ? '保存中...' : isEdit ? '更新する' : '作成する'}
          </button>
          <button type="button" onClick={() => router.push('/admin/courses')} className="rounded-lg border border-[#2f2f3c] py-2.5 text-sm text-[#9a9aa8] hover:text-[#ebe5db]">
            キャンセル
          </button>
        </div>
      </div>
    </form>
  )
}
