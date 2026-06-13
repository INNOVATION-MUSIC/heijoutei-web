import Link from 'next/link'
import { adminSupabase } from '@/lib/supabase/admin'
import RecruitDeleteButton from '@/components/admin/RecruitDeleteButton'

export const dynamic = 'force-dynamic'

export default async function AdminRecruitmentsPage() {
  const [{ data: recruits }, { data: stores }] = await Promise.all([
    adminSupabase.from('recruitments').select('id, store_id, title, is_published, sort_order').order('store_id').order('sort_order'),
    adminSupabase.from('stores').select('id, name').eq('is_active', true),
  ])
  const storeName = new Map((stores ?? []).map((s) => [s.id, s.name]))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#ebe5db]">採用情報管理</h1>
          <p className="text-sm text-[#6f6f80]">全 {recruits?.length ?? 0} 件</p>
        </div>
        <Link href="/admin/recruitments/new" className="inline-flex items-center gap-2 rounded-lg bg-[#d9b86b] px-4 py-2 text-sm font-medium text-[#1a1410] hover:opacity-90">
          ＋ 新規求人
        </Link>
      </div>

      <div className="overflow-hidden rounded-xl border border-[#23232e] bg-[#14141a]">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#23232e] bg-[#1a1a22] text-left text-xs text-[#6f6f80]">
              <th className="px-4 py-3 font-medium">店舗</th>
              <th className="px-4 py-3 font-medium">タイトル</th>
              <th className="px-4 py-3 font-medium">状態</th>
              <th className="px-4 py-3 text-right font-medium">操作</th>
            </tr>
          </thead>
          <tbody>
            {(recruits ?? []).map((r) => (
              <tr key={r.id} className="border-b border-[#1d1d26] last:border-0 hover:bg-white/[0.02]">
                <td className="px-4 py-3 text-[#9a9aa8]">{storeName.get(r.store_id) ?? '—'}</td>
                <td className="px-4 py-3 font-medium text-[#ebe5db]">{r.title}</td>
                <td className="px-4 py-3">
                  {r.is_published ? (
                    <span className="rounded-full bg-green-900/30 px-2 py-0.5 text-xs text-green-400">公開中</span>
                  ) : (
                    <span className="rounded-full bg-yellow-900/30 px-2 py-0.5 text-xs text-yellow-400">非公開</span>
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-3">
                    <Link href={`/admin/recruitments/${r.id}/edit`} className="text-xs text-[#d9b86b] hover:underline">編集</Link>
                    <RecruitDeleteButton id={r.id} title={r.title} />
                  </div>
                </td>
              </tr>
            ))}
            {(!recruits || recruits.length === 0) && (
              <tr><td colSpan={4} className="px-4 py-10 text-center text-sm text-[#6f6f80]">求人がありません。</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
