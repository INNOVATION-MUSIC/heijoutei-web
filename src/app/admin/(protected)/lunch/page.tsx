import Link from 'next/link'
import { adminSupabase } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

// ランチは store_menus（category=lunch）+ menu_items の既存モデルをそのまま使う。
// フロント /menu/lunch は menu_categories(slug='lunch') を固定で参照するため、ここでは
// 店舗ごとのランチを一覧・編集する専用ビューとして見せる（データ構造は通常メニューと共通）。
export default async function AdminLunchPage() {
  const [{ data: stores }, { data: lunchCat }] = await Promise.all([
    adminSupabase.from('stores').select('id, name').eq('is_active', true).order('sort_order'),
    adminSupabase.from('menu_categories').select('id').eq('slug', 'lunch').maybeSingle(),
  ])
  const lunchId = lunchCat?.id ?? null

  // 店舗ごとのランチ store_menu（カテゴリ=lunch）を取得
  const { data: menus } = lunchId
    ? await adminSupabase
        .from('store_menus')
        .select('id, store_id, is_active')
        .eq('category_id', lunchId)
    : { data: [] }
  const menuByStore = new Map((menus ?? []).map((m) => [m.store_id, m]))

  // 品目数
  const ids = (menus ?? []).map((m) => m.id)
  const countByMenu = new Map<string, number>()
  if (ids.length) {
    const { data: items } = await adminSupabase.from('menu_items').select('store_menu_id').in('store_menu_id', ids)
    for (const it of items ?? []) countByMenu.set(it.store_menu_id, (countByMenu.get(it.store_menu_id) ?? 0) + 1)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#ebe5db]">ランチメニュー管理</h1>
        <p className="text-sm text-[#6f6f80]">店舗ごとのランチメニュー（/menu/lunch に表示されます）</p>
      </div>

      <div className="overflow-x-auto rounded-xl border border-[#23232e] bg-[#14141a]">
        <table className="w-full min-w-[640px] text-sm">
          <thead>
            <tr className="border-b border-[#23232e] bg-[#1a1a22] text-left text-xs text-[#6f6f80]">
              <th className="px-4 py-3 font-medium">店舗</th>
              <th className="px-4 py-3 font-medium">品目数</th>
              <th className="px-4 py-3 font-medium">状態</th>
              <th className="px-4 py-3 text-right font-medium">操作</th>
            </tr>
          </thead>
          <tbody>
            {(stores ?? []).map((s) => {
              const menu = menuByStore.get(s.id)
              return (
                <tr key={s.id} className="border-b border-[#1d1d26] last:border-0 hover:bg-white/[0.02]">
                  <td className="px-4 py-3 text-[#ebe5db]">{s.name}</td>
                  <td className="px-4 py-3 text-[#9a9aa8]">{menu ? (countByMenu.get(menu.id) ?? 0) : '—'}</td>
                  <td className="px-4 py-3">
                    {!menu ? (
                      <span className="rounded-full bg-gray-900/40 px-2 py-0.5 text-xs text-gray-400">未登録</span>
                    ) : menu.is_active ? (
                      <span className="rounded-full bg-green-900/30 px-2 py-0.5 text-xs text-green-400">公開中</span>
                    ) : (
                      <span className="rounded-full bg-gray-900/40 px-2 py-0.5 text-xs text-gray-400">非公開</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {menu ? (
                      <Link href={`/admin/lunch/${menu.id}/edit`} className="text-xs text-[#d9b86b] hover:underline">編集</Link>
                    ) : (
                      <Link href={`/admin/lunch/new?store=${s.id}`} className="text-xs text-[#d9b86b] hover:underline">作成</Link>
                    )}
                  </td>
                </tr>
              )
            })}
            {(!stores || stores.length === 0) && (
              <tr><td colSpan={4} className="px-4 py-10 text-center text-sm text-[#6f6f80]">店舗がありません。</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
