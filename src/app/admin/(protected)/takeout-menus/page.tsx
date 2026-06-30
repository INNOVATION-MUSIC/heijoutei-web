import Link from 'next/link'
import { adminSupabase } from '@/lib/supabase/admin'
import DraggableTakeoutMenuTable, { type TakeoutMenuRow } from '@/components/admin/DraggableTakeoutMenuTable'

export const dynamic = 'force-dynamic'

export default async function AdminTakeoutMenusPage() {
  const [{ data: menus }, { data: cats }, { data: junction }, { data: stores }] = await Promise.all([
    adminSupabase
      .from('store_takeout_menus')
      .select('id, name, price, category_id, is_active, sort_order')
      .order('sort_order'),
    adminSupabase.from('takeout_categories').select('id, name').order('sort_order'),
    adminSupabase.from('store_takeout_menu_stores').select('takeout_menu_id, store_id'),
    adminSupabase.from('stores').select('id, name').eq('is_active', true),
  ])

  const catName = new Map((cats ?? []).map((c) => [c.id, c.name]))
  const storeName = new Map((stores ?? []).map((s) => [s.id, s.name]))
  const storesByMenu = new Map<string, string[]>()
  for (const j of junction ?? []) {
    const arr = storesByMenu.get(j.takeout_menu_id) ?? []
    arr.push(storeName.get(j.store_id) ?? '')
    storesByMenu.set(j.takeout_menu_id, arr)
  }

  const rows: TakeoutMenuRow[] = (menus ?? []).map((m) => ({
    id: m.id,
    name: m.name,
    categoryName: m.category_id ? catName.get(m.category_id) ?? null : null,
    price: m.price,
    storeNames: storesByMenu.get(m.id) ?? [],
    is_active: m.is_active,
  }))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#ebe5db]">テイクアウトメニュー管理</h1>
          <p className="text-sm text-[#6f6f80]">全 {rows.length} 件・行をドラッグで並べ替え（表示順に反映）</p>
        </div>
        <Link href="/admin/takeout-menus/new" className="inline-flex items-center gap-2 rounded-lg bg-[#d9b86b] px-4 py-2 text-sm font-medium text-[#1a1410] hover:opacity-90">
          ＋ 新規メニュー
        </Link>
      </div>

      {rows.length > 0 ? (
        // 行の集合（複製/削除）が変わったら再マウントして最新を反映する
        <DraggableTakeoutMenuTable key={rows.map((r) => r.id).join(',')} initial={rows} />
      ) : (
        <div className="rounded-xl border border-[#23232e] bg-[#14141a] px-4 py-10 text-center text-sm text-[#6f6f80]">
          メニューがありません。
        </div>
      )}
    </div>
  )
}
