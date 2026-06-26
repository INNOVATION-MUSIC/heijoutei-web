'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import MenuItemsEditor from '@/components/admin/MenuItemsEditor'
import SaveSuccessBanner from '@/components/admin/SaveSuccessBanner'
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
  defaultCategoryId,
  lunchMode = false,
  forcedCategoryId,
}: {
  stores: StoreRef[]
  categories: CategoryRef[]
  initial?: Tables<'store_menus'>
  initialItems?: MenuItemInput[]
  defaultStoreId?: string
  // 新規作成時のカテゴリ初期値（一覧の絞り込みから引き継ぐ）。ドロップダウンで変更可。
  defaultCategoryId?: string
  // ランチ専用画面から呼ぶときはカテゴリを lunch 固定にして遷移先を /admin/lunch にする
  lunchMode?: boolean
  forcedCategoryId?: string | null
}) {
  const router = useRouter()
  const isEdit = Boolean(initial)
  const returnPath = lunchMode ? '/admin/lunch' : '/admin/menus'
  const [form, setForm] = useState<StoreMenuPayload>({
    store_id: initial?.store_id ?? defaultStoreId ?? stores[0]?.id ?? '',
    category_id: initial?.category_id ?? forcedCategoryId ?? defaultCategoryId ?? categories[0]?.id ?? null,
    is_active: initial?.is_active ?? true,
    sort_order: initial?.sort_order ?? 0,
  })
  const [items, setItems] = useState<MenuItemInput[]>(initialItems)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  function set<K extends keyof StoreMenuPayload>(k: K, v: StoreMenuPayload[K]) {
    setForm((f) => ({ ...f, [k]: v }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    setSaved(false)
    const result = isEdit
      ? await updateStoreMenu(initial!.id, form, items)
      : await createStoreMenu(form, items)
    if (result?.error) {
      setError(result.error)
      setSaving(false)
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }
    // 編集は一覧に遷移せず詳細画面に留まり「更新しました」を表示。新規作成は一覧へ
    if (isEdit) {
      setSaving(false)
      setSaved(true)
      router.refresh()
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }
    router.push(returnPath)
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <SaveSuccessBanner show={saved} className="lg:col-span-3" />
      {error && (
        <div className="rounded-lg border border-red-800/50 bg-red-900/20 px-4 py-3 text-sm text-red-400 lg:col-span-3">{error}</div>
      )}

      <div className="space-y-5 lg:col-span-2">
        <div className="space-y-4 rounded-xl border border-[#23232e] bg-[#14141a] p-5">
          <div className={lunchMode ? '' : 'grid grid-cols-1 gap-4 sm:grid-cols-2'}>
            <div>
              <label className={labelClass}>店舗 *</label>
              <select className={inputClass} value={form.store_id} onChange={(e) => set('store_id', e.target.value)}>
                {stores.map((s) => (<option key={s.id} value={s.id}>{s.name}</option>))}
              </select>
            </div>
            {!lunchMode && (
              <div>
                <label className={labelClass}>カテゴリ</label>
                <select className={inputClass} value={form.category_id ?? ''} onChange={(e) => set('category_id', e.target.value || null)}>
                  <option value="">（未分類）</option>
                  {categories.map((c) => (<option key={c.id} value={c.id}>{c.name}</option>))}
                </select>
              </div>
            )}
          </div>
        </div>

        {/* メニュー項目 */}
        <div className="space-y-4 rounded-xl border border-[#23232e] bg-[#14141a] p-5">
          <h2 className="text-sm font-semibold text-[#ebe5db]">メニュー項目</h2>
          <MenuItemsEditor items={items} onChange={setItems} />
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
          <button type="button" onClick={() => router.push(returnPath)} className="rounded-lg border border-[#2f2f3c] py-2.5 text-sm text-[#9a9aa8] hover:text-[#ebe5db]">
            キャンセル
          </button>
        </div>
      </div>
    </form>
  )
}
