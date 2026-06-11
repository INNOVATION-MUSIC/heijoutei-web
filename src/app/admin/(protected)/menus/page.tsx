import Link from 'next/link'
import { adminSupabase } from '@/lib/supabase/admin'
import MenuDeleteButton from '@/components/admin/MenuDeleteButton'

export const dynamic = 'force-dynamic'

export default async function AdminMenusPage({
  searchParams,
}: {
  searchParams: Promise<{ store?: string; category?: string }>
}) {
  const { store, category } = await searchParams

  const [{ data: stores }, { data: cats }] = await Promise.all([
    adminSupabase.from('stores').select('id, name').order('sort_order'),
    adminSupabase.from('menu_categories').select('id, name').order('sort_order'),
  ])

  let query = adminSupabase
    .from('store_menus')
    .select('id, store_id, category_id, section_title, has_detail_page, detail_slug, is_active, sort_order')
    .order('store_id')
    .order('sort_order')
  if (store) query = query.eq('store_id', store)
  if (category) query = query.eq('category_id', category)
  const { data: menus } = await query

  // 品目数
  const ids = (menus ?? []).map((m) => m.id)
  const countByMenu = new Map<string, number>()
  if (ids.length) {
    const { data: items } = await adminSupabase.from('menu_items').select('store_menu_id').in('store_menu_id', ids)
    for (const it of items ?? []) countByMenu.set(it.store_menu_id, (countByMenu.get(it.store_menu_id) ?? 0) + 1)
  }

  const storeName = new Map((stores ?? []).map((s) => [s.id, s.name]))
  const catName = new Map((cats ?? []).map((c) => [c.id, c.name]))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#ebe5db]">メニュー管理</h1>
          <p className="text-sm text-[#6f6f80]">店舗×カテゴリのメニューセクション（誘導バナー含む）</p>
        </div>
        <Link href="/admin/menus/new" className="inline-flex items-center gap-2 rounded-lg bg-[#d9b86b] px-4 py-2 text-sm font-medium text-[#1a1410] hover:opacity-90">
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

      <div className="overflow-hidden rounded-xl border border-[#23232e] bg-[#14141a]">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#23232e] bg-[#1a1a22] text-left text-xs text-[#6f6f80]">
              <th className="px-4 py-3 font-medium">店舗</th>
              <th className="px-4 py-3 font-medium">カテゴリ</th>
              <th className="px-4 py-3 font-medium">種別</th>
              <th className="px-4 py-3 font-medium">品目数</th>
              <th className="px-4 py-3 font-medium">状態</th>
              <th className="px-4 py-3 text-right font-medium">操作</th>
            </tr>
          </thead>
          <tbody>
            {(menus ?? []).map((m) => (
              <tr key={m.id} className="border-b border-[#1d1d26] last:border-0 hover:bg-white/[0.02]">
                <td className="px-4 py-3 text-[#9a9aa8]">{storeName.get(m.store_id) ?? '—'}</td>
                <td className="px-4 py-3 text-[#ebe5db]">{m.category_id ? catName.get(m.category_id) : (m.section_title || '—')}</td>
                <td className="px-4 py-3">
                  {m.has_detail_page ? (
                    <span className="rounded-full bg-blue-900/30 px-2 py-0.5 text-xs text-blue-300">誘導バナー（{m.detail_slug ?? '-'}）</span>
                  ) : (
                    <span className="text-xs text-[#6f6f80]">メニュー</span>
                  )}
                </td>
                <td className="px-4 py-3 text-[#9a9aa8]">{m.has_detail_page ? '—' : (countByMenu.get(m.id) ?? 0)}</td>
                <td className="px-4 py-3">
                  {m.is_active ? (
                    <span className="rounded-full bg-green-900/30 px-2 py-0.5 text-xs text-green-400">公開中</span>
                  ) : (
                    <span className="rounded-full bg-gray-900/40 px-2 py-0.5 text-xs text-gray-400">非公開</span>
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-3">
                    <Link href={`/admin/menus/${m.id}/edit`} className="text-xs text-[#d9b86b] hover:underline">編集</Link>
                    <MenuDeleteButton id={m.id} label={(storeName.get(m.store_id) ?? '') + ' / ' + (m.category_id ? catName.get(m.category_id) ?? '' : m.section_title ?? '')} />
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
