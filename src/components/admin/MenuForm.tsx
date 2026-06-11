'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import ImageUploader from '@/components/admin/ImageUploader'
import MenuItemsEditor from '@/components/admin/MenuItemsEditor'
import { createStoreMenu, updateStoreMenu, type StoreMenuPayload, type MenuItemInput } from '@/lib/actions/menus'
import type { Tables } from '@/types/supabase'
import type { StoreRef, CategoryRef } from '@/lib/actions/refs'

const inputClass =
  'w-full rounded-lg border border-[#2f2f3c] bg-[#0a0a0f] px-3 py-2 text-sm text-[#ebe5db] focus:border-[#d9b86b] focus:outline-none focus:ring-1 focus:ring-[#d9b86b]/30'
const labelClass = 'mb-1.5 block text-xs font-medium text-[#9a9aa8]'

export default function MenuForm({
  stores,
  categories,
  initial,
  initialItems = [],
  defaultStoreId,
}: {
  stores: StoreRef[]
  categories: CategoryRef[]
  initial?: Tables<'store_menus'>
  initialItems?: MenuItemInput[]
  defaultStoreId?: string
}) {
  const router = useRouter()
  const isEdit = Boolean(initial)
  const [form, setForm] = useState<StoreMenuPayload>({
    store_id: initial?.store_id ?? defaultStoreId ?? stores[0]?.id ?? '',
    category_id: initial?.category_id ?? categories[0]?.id ?? null,
    section_title: initial?.section_title ?? '',
    has_detail_page: initial?.has_detail_page ?? false,
    detail_slug: initial?.detail_slug ?? '',
    detail_image_url: initial?.detail_image_url ?? '',
    detail_description: initial?.detail_description ?? '',
    is_active: initial?.is_active ?? true,
    sort_order: initial?.sort_order ?? 0,
  })
  const [items, setItems] = useState<MenuItemInput[]>(initialItems)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function set<K extends keyof StoreMenuPayload>(k: K, v: StoreMenuPayload[K]) {
    setForm((f) => ({ ...f, [k]: v }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    const result = isEdit
      ? await updateStoreMenu(initial!.id, form, items)
      : await createStoreMenu(form, items)
    if (result?.error) {
      setError(result.error)
      setSaving(false)
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }
    router.push('/admin/menus')
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      {error && (
        <div className="rounded-lg border border-red-800/50 bg-red-900/20 px-4 py-3 text-sm text-red-400 lg:col-span-3">{error}</div>
      )}

      <div className="space-y-5 lg:col-span-2">
        <div className="space-y-4 rounded-xl border border-[#23232e] bg-[#14141a] p-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>店舗 *</label>
              <select className={inputClass} value={form.store_id} onChange={(e) => set('store_id', e.target.value)}>
                {stores.map((s) => (<option key={s.id} value={s.id}>{s.name}</option>))}
              </select>
            </div>
            <div>
              <label className={labelClass}>カテゴリ</label>
              <select className={inputClass} value={form.category_id ?? ''} onChange={(e) => set('category_id', e.target.value || null)}>
                <option value="">（未分類・誘導バナー等）</option>
                {categories.map((c) => (<option key={c.id} value={c.id}>{c.name}</option>))}
              </select>
            </div>
          </div>
          <div>
            <label className={labelClass}>セクション見出し（任意）</label>
            <input className={inputClass} value={form.section_title ?? ''} onChange={(e) => set('section_title', e.target.value)} />
          </div>
        </div>

        {/* 誘導バナー設定 */}
        <div className="space-y-4 rounded-xl border border-[#23232e] bg-[#14141a] p-5">
          <label className="flex items-center gap-2 text-sm text-[#ebe5db]">
            <input type="checkbox" checked={form.has_detail_page ?? false} onChange={(e) => set('has_detail_page', e.target.checked)} className="accent-[#d9b86b]" />
            誘導バナーとして使う（カテゴリ一覧ページ下部：ランチ／テイクアウト／コース）
          </label>
          {form.has_detail_page && (
            <div className="space-y-4 border-l-2 border-[#d9b86b]/30 pl-4">
              <div>
                <label className={labelClass}>遷移先</label>
                <select className={inputClass} value={form.detail_slug ?? ''} onChange={(e) => set('detail_slug', e.target.value)}>
                  <option value="">選択してください</option>
                  <option value="lunch">ランチ（/menu/lunch）</option>
                  <option value="takeout">テイクアウト（/takeout）</option>
                  <option value="course">コース（/menu/course）</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>バナー説明文</label>
                <textarea className={`${inputClass} min-h-16`} value={form.detail_description ?? ''} onChange={(e) => set('detail_description', e.target.value)} />
              </div>
              <ImageUploader label="バナー画像" value={form.detail_image_url ?? ''} onChange={(url) => set('detail_image_url', url)} />
            </div>
          )}
        </div>

        {/* メニュー項目 */}
        {!form.has_detail_page && (
          <div className="space-y-4 rounded-xl border border-[#23232e] bg-[#14141a] p-5">
            <h2 className="text-sm font-semibold text-[#ebe5db]">メニュー項目</h2>
            <MenuItemsEditor items={items} onChange={setItems} />
          </div>
        )}
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
          <button type="button" onClick={() => router.push('/admin/menus')} className="rounded-lg border border-[#2f2f3c] py-2.5 text-sm text-[#9a9aa8] hover:text-[#ebe5db]">
            キャンセル
          </button>
        </div>
      </div>
    </form>
  )
}
