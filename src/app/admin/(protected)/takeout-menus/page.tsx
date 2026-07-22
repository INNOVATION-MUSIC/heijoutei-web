import Link from 'next/link'
import { adminSupabase } from '@/lib/supabase/admin'
import DraggableTakeoutMenuTable, { type TakeoutMenuRow } from '@/components/admin/DraggableTakeoutMenuTable'

export const dynamic = 'force-dynamic'

export default async function AdminTakeoutMenusPage({
  searchParams,
}: {
  searchParams: Promise<{ store?: string; category?: string }>
}) {
  const { store, category } = await searchParams

  const [{ data: menus }, { data: cats }, { data: junction }, { data: stores }] = await Promise.all([
    adminSupabase
      .from('store_takeout_menus')
      .select('id, name, price, category_id, is_active, sort_order')
      .order('sort_order'),
    adminSupabase.from('takeout_categories').select('id, name').order('sort_order'),
    adminSupabase.from('store_takeout_menu_stores').select('takeout_menu_id, store_id'),
    adminSupabase.from('stores').select('id, name').eq('is_active', true).order('sort_order'),
  ])

  const catName = new Map((cats ?? []).map((c) => [c.id, c.name]))
  const storeName = new Map((stores ?? []).map((s) => [s.id, s.name]))
  // メニュー → 取扱店舗id[]
  const storeIdsByMenu = new Map<string, string[]>()
  for (const j of junction ?? []) {
    const arr = storeIdsByMenu.get(j.takeout_menu_id) ?? []
    arr.push(j.store_id)
    storeIdsByMenu.set(j.takeout_menu_id, arr)
  }

  // カテゴリ絞り込み
  const filtered = (menus ?? []).filter((m) => !category || m.category_id === category)

  // 店舗ごとにまとめる（1メニューが複数店舗に属する場合は各店舗に表示）。
  // ?store= 指定時はその店舗のみ。
  const byStore = new Map<string, TakeoutMenuRow[]>()
  for (const m of filtered) {
    const storeIds = storeIdsByMenu.get(m.id) ?? []
    const row: TakeoutMenuRow = {
      id: m.id,
      name: m.name,
      categoryName: m.category_id ? catName.get(m.category_id) ?? null : null,
      price: m.price,
      storeNames: storeIds.map((id) => storeName.get(id) ?? '').filter(Boolean),
      is_active: m.is_active,
    }
    for (const sid of storeIds) {
      if (store && sid !== store) continue
      const list = byStore.get(sid) ?? []
      list.push(row)
      byStore.set(sid, list)
    }
  }
  const total = filtered.length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#ebe5db]">テイクアウトメニュー管理</h1>
          <p className="text-sm text-[#6f6f80]">店舗ごとのテイクアウトメニュー（全 {total} 件）</p>
        </div>
        <Link href="/admin/takeout-menus/new" className="inline-flex items-center gap-2 rounded-lg bg-[#d9b86b] px-4 py-2 text-sm font-medium text-[#1a1410] hover:opacity-90">
          ＋ 新規メニュー
        </Link>
      </div>

      {/* 絞り込み */}
      <form className="flex flex-wrap items-end gap-3 rounded-xl border border-[#23232e] bg-[#14141a] p-4">
        <div>
          <label className="mb-1 block text-xs text-[#9a9aa8]">店舗</label>
          <select name="store" defaultValue={store ?? ''} className="rounded-lg border border-[#2f2f3c] bg-[#0a0a0f] px-3 py-2 text-sm text-[#ebe5db]">
            <option value="">すべて</option>
            {(stores ?? []).map((s) => (<option key={s.id} value={s.id}>{s.name}</option>))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs text-[#9a9aa8]">カテゴリ</label>
          <select name="category" defaultValue={category ?? ''} className="rounded-lg border border-[#2f2f3c] bg-[#0a0a0f] px-3 py-2 text-sm text-[#ebe5db]">
            <option value="">すべて</option>
            {(cats ?? []).map((c) => (<option key={c.id} value={c.id}>{c.name}</option>))}
          </select>
        </div>
        <button type="submit" className="rounded-lg border border-[#2f2f3c] px-4 py-2 text-sm text-[#9a9aa8] hover:text-[#ebe5db]">絞り込み</button>
      </form>

      <p className="text-xs text-[#5a5a6a]">行をドラッグで並べ替えできます（この並びは管理画面の一覧用です）。</p>

      {(stores ?? []).map((s) => {
        const list = byStore.get(s.id) ?? []
        if (list.length === 0) return null
        // 行の集合（複製/削除）が変わったら再マウントして最新を反映する
        return (
          <DraggableTakeoutMenuTable
            key={`${s.id}:${list.map((r) => r.id).join(',')}`}
            storeName={storeName.get(s.id) ?? ''}
            initial={list}
          />
        )
      })}

      {byStore.size === 0 && (
        <div className="rounded-xl border border-[#23232e] bg-[#14141a] px-4 py-10 text-center text-sm text-[#6f6f80]">
          メニューがありません。
        </div>
      )}
    </div>
  )
}
