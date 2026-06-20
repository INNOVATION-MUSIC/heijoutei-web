import Link from 'next/link'
import { adminSupabase } from '@/lib/supabase/admin'
import DeleteStoreButton from '@/components/admin/DeleteStoreButton'

export const dynamic = 'force-dynamic'

export default async function AdminStoresPage() {
  const { data: stores } = await adminSupabase
    .from('stores')
    .select('id, name, slug, name_en, phone, is_active, is_coming_soon, sort_order')
    .order('sort_order', { ascending: true })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#ebe5db]">店舗管理</h1>
          <p className="text-sm text-[#6f6f80]">全 {stores?.length ?? 0} 店舗</p>
        </div>
        <Link
          href="/admin/stores/new"
          className="inline-flex items-center gap-2 rounded-lg bg-[#d9b86b] px-4 py-2 text-sm font-medium text-[#1a1410] hover:opacity-90"
        >
          ＋ 新規店舗
        </Link>
      </div>

      <div className="overflow-x-auto rounded-xl border border-[#23232e] bg-[#14141a]">
        <table className="w-full min-w-[640px] text-sm">
          <thead>
            <tr className="border-b border-[#23232e] bg-[#1a1a22] text-left text-xs text-[#6f6f80]">
              <th className="px-4 py-3 font-medium">順</th>
              <th className="px-4 py-3 font-medium">店舗名</th>
              <th className="px-4 py-3 font-medium">スラッグ</th>
              <th className="px-4 py-3 font-medium">電話</th>
              <th className="px-4 py-3 font-medium">状態</th>
              <th className="px-4 py-3 text-right font-medium">操作</th>
            </tr>
          </thead>
          <tbody>
            {(stores ?? []).map((s) => (
              <tr key={s.id} className="border-b border-[#1d1d26] last:border-0 hover:bg-white/[0.02]">
                <td className="px-4 py-3 text-[#6f6f80]">{s.sort_order}</td>
                <td className="px-4 py-3">
                  <p className="font-medium text-[#ebe5db]">{s.name}</p>
                  {s.name_en && <p className="text-xs text-[#5a5a6a]">{s.name_en}</p>}
                </td>
                <td className="px-4 py-3 text-[#9a9aa8]">{s.slug}</td>
                <td className="px-4 py-3 text-[#9a9aa8]">{s.phone ?? '—'}</td>
                <td className="px-4 py-3">
                  {s.is_coming_soon ? (
                    <span className="rounded-full bg-yellow-900/30 px-2 py-0.5 text-xs text-yellow-400">Coming Soon</span>
                  ) : s.is_active ? (
                    <span className="rounded-full bg-green-900/30 px-2 py-0.5 text-xs text-green-400">公開中</span>
                  ) : (
                    <span className="rounded-full bg-gray-900/40 px-2 py-0.5 text-xs text-gray-400">非公開</span>
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-3">
                    <Link href={`/admin/stores/${s.id}/edit`} className="text-xs text-[#d9b86b] hover:underline">
                      編集
                    </Link>
                    <DeleteStoreButton id={s.id} name={s.name} />
                  </div>
                </td>
              </tr>
            ))}
            {(!stores || stores.length === 0) && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-sm text-[#6f6f80]">
                  店舗がありません。「＋ 新規店舗」から追加してください。
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
