import Link from 'next/link'
import { adminSupabase } from '@/lib/supabase/admin'
import DraggableMenuTable, { type MenuRow } from '@/components/admin/DraggableMenuTable'

export const dynamic = 'force-dynamic'

export default async function AdminMenusPage({
  searchParams,
}: {
  searchParams: Promise<{ store?: string; category?: string }>
}) {
  const { store, category } = await searchParams

  // ランチは専用画面（/admin/lunch）で管理するため、この一覧・絞り込みからは除外する
  const [{ data: stores }, { data: cats }, { data: lunchCat }] = await Promise.all([
    adminSupabase.from('stores').select('id, name').eq('is_active', true).order('sort_order'),
    adminSupabase.from('menu_categories').select('id, name').neq('slug', 'lunch').order('sort_order'),
    adminSupabase.from('menu_categories').select('id').eq('slug', 'lunch').maybeSingle(),
  ])
  const lunchId = lunchCat?.id ?? null

  let query = adminSupabase
    .from('store_menus')
    .select('id, store_id, category_id, is_active, sort_order')
    .order('store_id')
    .order('sort_order')
  if (store) query = query.eq('store_id', store)
  if (category) query = query.eq('category_id', category)
  const { data: rawMenus } = await query
  const menus = (rawMenus ?? []).filter((m) => m.category_id !== lunchId)

  // 品目名（品目数はここから算出）。sort_order 順で品目名を集める。
  const ids = (menus ?? []).map((m) => m.id)
  const namesByMenu = new Map<string, string[]>()
  if (ids.length) {
    const { data: items } = await adminSupabase
      .from('menu_items')
      .select('store_menu_id, name, sort_order')
      .in('store_menu_id', ids)
      .order('sort_order')
    for (const it of items ?? []) {
      const list = namesByMenu.get(it.store_menu_id) ?? []
      list.push(it.name)
      namesByMenu.set(it.store_menu_id, list)
    }
  }

  const storeName = new Map((stores ?? []).map((s) => [s.id, s.name]))
  const catName = new Map((cats ?? []).map((c) => [c.id, c.name]))

  // 店舗ごとにまとめる（並び順は店舗単位）
  const byStore = new Map<string, MenuRow[]>()
  for (const m of menus) {
    const catLabel = m.category_id ? catName.get(m.category_id) ?? null : null
    const names = namesByMenu.get(m.id) ?? []
    const row: MenuRow = {
      id: m.id,
      categoryName: catLabel,
      itemNames: names,
      itemCount: names.length,
      is_active: m.is_active,
      deleteLabel: `${storeName.get(m.store_id) ?? ''} / ${catLabel ?? ''}`,
    }
    const list = byStore.get(m.store_id) ?? []
    list.push(row)
    byStore.set(m.store_id, list)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#ebe5db]">メニュー管理</h1>
          <p className="text-sm text-[#6f6f80]">店舗×カテゴリのメニューセクション</p>
        </div>
        <Link
          href={`/admin/menus/new${(() => { const q = new URLSearchParams(); if (store) q.set('store', store); if (category) q.set('category', category); const s = q.toString(); return s ? `?${s}` : ''; })()}`}
          className="inline-flex items-center gap-2 rounded-lg bg-[#d9b86b] px-4 py-2 text-sm font-medium text-[#1a1410] hover:opacity-90"
        >
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

      <p className="text-xs text-[#5a5a6a]">行をドラッグで並べ替えできます（この並びは管理画面の一覧用です。フロントのカテゴリ順はカテゴリ管理、品目順は各メニューの品目編集で決まります）。</p>

      {(stores ?? []).map((s) => {
        const list = byStore.get(s.id) ?? []
        if (list.length === 0) return null
        // 行の集合（削除）が変わったら再マウントして最新を反映する
        return (
          <DraggableMenuTable
            key={`${s.id}:${list.map((r) => r.id).join(',')}`}
            storeName={storeName.get(s.id) ?? ''}
            initial={list}
          />
        )
      })}

      {menus.length === 0 && (
        <div className="rounded-xl border border-[#23232e] bg-[#14141a] px-4 py-10 text-center text-sm text-[#6f6f80]">
          メニューがありません。
        </div>
      )}
    </div>
  )
}
