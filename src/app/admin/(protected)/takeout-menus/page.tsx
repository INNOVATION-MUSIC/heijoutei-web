import Link from 'next/link'
import { adminSupabase } from '@/lib/supabase/admin'
import TakeoutMenuDeleteButton from '@/components/admin/TakeoutMenuDeleteButton'

export const dynamic = 'force-dynamic'

export default async function AdminTakeoutMenusPage() {
  const [{ data: menus }, { data: cats }, { data: junction }, { data: stores }] = await Promise.all([
    adminSupabase
      .from('store_takeout_menus')
      .select('id, name, price, category_id, is_active, sort_order')
      .order('sort_order'),
    adminSupabase.from('takeout_categories').select('id, name').order('sort_order'),
    adminSupabase.from('store_takeout_menu_stores').select('takeout_menu_id, store_id'),
    adminSupabase.from('stores').select('id, name'),
  ])

  const catName = new Map((cats ?? []).map((c) => [c.id, c.name]))
  const storeName = new Map((stores ?? []).map((s) => [s.id, s.name]))
  const storesByMenu = new Map<string, string[]>()
  for (const j of junction ?? []) {
    const arr = storesByMenu.get(j.takeout_menu_id) ?? []
    arr.push(storeName.get(j.store_id) ?? '')
    storesByMenu.set(j.takeout_menu_id, arr)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#ebe5db]">テイクアウトメニュー管理</h1>
          <p className="text-sm text-[#6f6f80]">全 {menus?.length ?? 0} 件</p>
        </div>
        <Link href="/admin/takeout-menus/new" className="inline-flex items-center gap-2 rounded-lg bg-[#d9b86b] px-4 py-2 text-sm font-medium text-[#1a1410] hover:opacity-90">
          ＋ 新規メニュー
        </Link>
      </div>

      <div className="overflow-hidden rounded-xl border border-[#23232e] bg-[#14141a]">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#23232e] bg-[#1a1a22] text-left text-xs text-[#6f6f80]">
              <th className="px-4 py-3 font-medium">メニュー名</th>
              <th className="px-4 py-3 font-medium">カテゴリ</th>
              <th className="px-4 py-3 font-medium">価格</th>
              <th className="px-4 py-3 font-medium">取扱店舗</th>
              <th className="px-4 py-3 font-medium">状態</th>
              <th className="px-4 py-3 text-right font-medium">操作</th>
            </tr>
          </thead>
          <tbody>
            {(menus ?? []).map((m) => (
              <tr key={m.id} className="border-b border-[#1d1d26] last:border-0 hover:bg-white/[0.02]">
                <td className="px-4 py-3 font-medium text-[#ebe5db]">{m.name}</td>
                <td className="px-4 py-3 text-[#9a9aa8]">{m.category_id ? catName.get(m.category_id) : '—'}</td>
                <td className="px-4 py-3 text-[#9a9aa8]">{m.price.toLocaleString('ja-JP')}円</td>
                <td className="px-4 py-3 text-xs text-[#9a9aa8]">{(storesByMenu.get(m.id) ?? []).join('・') || '—'}</td>
                <td className="px-4 py-3">
                  {m.is_active ? (
                    <span className="rounded-full bg-green-900/30 px-2 py-0.5 text-xs text-green-400">公開中</span>
                  ) : (
                    <span className="rounded-full bg-gray-900/40 px-2 py-0.5 text-xs text-gray-400">非公開</span>
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-3">
                    <Link href={`/admin/takeout-menus/${m.id}/edit`} className="text-xs text-[#d9b86b] hover:underline">編集</Link>
                    <TakeoutMenuDeleteButton id={m.id} name={m.name} />
                  </div>
                </td>
              </tr>
            ))}
            {(!menus || menus.length === 0) && (
              <tr><td colSpan={6} className="px-4 py-10 text-center text-sm text-[#6f6f80]">メニューがありません。</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
