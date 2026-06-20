'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import ImageUploader from '@/components/admin/ImageUploader'
import { createTakeoutMenu, updateTakeoutMenu, type TakeoutMenuPayload } from '@/lib/actions/takeout-menus'
import type { Tables } from '@/types/supabase'
import type { StoreRef, CategoryRef } from '@/lib/actions/refs'

const inputClass =
  'w-full rounded-lg border border-[#2f2f3c] bg-[#0a0a0f] px-3 py-2 text-sm text-[#ebe5db] focus:border-[#d9b86b] focus:outline-none focus:ring-1 focus:ring-[#d9b86b]/30'
const labelClass = 'mb-1.5 block text-xs font-medium text-[#9a9aa8]'

export default function TakeoutMenuForm({
  stores,
  categories,
  initial,
  initialStoreIds = [],
}: {
  stores: StoreRef[]
  categories: CategoryRef[]
  initial?: Tables<'store_takeout_menus'>
  initialStoreIds?: string[]
}) {
  const router = useRouter()
  const isEdit = Boolean(initial)
  const [form, setForm] = useState<TakeoutMenuPayload>({
    category_id: initial?.category_id ?? categories[0]?.id ?? null,
    name: initial?.name ?? '',
    description: initial?.description ?? '',
    image_url: initial?.image_url ?? '',
    price: initial?.price ?? 0,
    is_active: initial?.is_active ?? true,
    sort_order: initial?.sort_order ?? 0,
    store_ids: initialStoreIds,
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function set<K extends keyof TakeoutMenuPayload>(k: K, v: TakeoutMenuPayload[K]) {
    setForm((f) => ({ ...f, [k]: v }))
  }

  function toggleStore(id: string) {
    setForm((f) => ({
      ...f,
      store_ids: f.store_ids.includes(id) ? f.store_ids.filter((s) => s !== id) : [...f.store_ids, id],
    }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    const result = isEdit ? await updateTakeoutMenu(initial!.id, form) : await createTakeoutMenu(form)
    if (result?.error) {
      setError(result.error)
      setSaving(false)
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }
    router.push('/admin/takeout-menus')
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      {error && (
        <div className="rounded-lg border border-red-800/50 bg-red-900/20 px-4 py-3 text-sm text-red-400 lg:col-span-3">{error}</div>
      )}

      <div className="space-y-5 lg:col-span-2">
        <div className="space-y-4 rounded-xl border border-[#23232e] bg-[#14141a] p-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass}>カテゴリ</label>
              <select className={inputClass} value={form.category_id ?? ''} onChange={(e) => set('category_id', e.target.value || null)}>
                <option value="">（未分類）</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>価格（数値・円）*</label>
              <input type="number" className={inputClass} value={form.price} onChange={(e) => set('price', Number(e.target.value))} min={0} required />
              <p className="mt-1 text-xs text-[#5a5a6a]">表示: {form.price.toLocaleString('ja-JP')}円</p>
            </div>
          </div>
          <div>
            <label className={labelClass}>メニュー名 *</label>
            <input className={inputClass} value={form.name} onChange={(e) => set('name', e.target.value)} required />
          </div>
          <div>
            <label className={labelClass}>説明文</label>
            <textarea className={`${inputClass} min-h-20`} value={form.description ?? ''} onChange={(e) => set('description', e.target.value)} />
          </div>
        </div>

        <div className="rounded-xl border border-[#23232e] bg-[#14141a] p-5">
          <ImageUploader label="メニュー画像" value={form.image_url ?? ''} onChange={(url) => set('image_url', url)} />
        </div>

        <div className="rounded-xl border border-[#23232e] bg-[#14141a] p-5">
          <p className={labelClass}>取り扱い店舗（複数選択）</p>
          <div className="flex flex-wrap gap-2">
            {stores.map((s) => {
              const active = form.store_ids.includes(s.id)
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => toggleStore(s.id)}
                  className={`rounded-full border px-3 py-1.5 text-xs transition-colors ${
                    active
                      ? 'border-[#d9b86b] bg-[#d9b86b]/15 text-[#ebe5db]'
                      : 'border-[#2f2f3c] text-[#9a9aa8] hover:border-[#d9b86b]/40'
                  }`}
                >
                  {s.name}
                </button>
              )
            })}
          </div>
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
          <button type="button" onClick={() => router.push('/admin/takeout-menus')} className="rounded-lg border border-[#2f2f3c] py-2.5 text-sm text-[#9a9aa8] hover:text-[#ebe5db]">
            キャンセル
          </button>
        </div>
      </div>
    </form>
  )
}
