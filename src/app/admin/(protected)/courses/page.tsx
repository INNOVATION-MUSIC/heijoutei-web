import Link from 'next/link'
import { adminSupabase } from '@/lib/supabase/admin'
import CourseDeleteButton from '@/components/admin/CourseDeleteButton'

export const dynamic = 'force-dynamic'

export default async function AdminCoursesPage() {
  const { data: stores } = await adminSupabase.from('stores').select('id, name').order('sort_order')
  const { data: courses } = await adminSupabase
    .from('courses')
    .select('id, store_id, name, type_label, price_label, is_active, sort_order')
    .order('store_id')
    .order('sort_order')

  const storeName = new Map((stores ?? []).map((s) => [s.id, s.name]))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#ebe5db]">コース管理</h1>
          <p className="text-sm text-[#6f6f80]">全 {courses?.length ?? 0} 件（店舗別カード一覧で完結）</p>
        </div>
        <Link href="/admin/courses/new" className="inline-flex items-center gap-2 rounded-lg bg-[#d9b86b] px-4 py-2 text-sm font-medium text-[#1a1410] hover:opacity-90">
          ＋ 新規コース
        </Link>
      </div>

      <div className="overflow-hidden rounded-xl border border-[#23232e] bg-[#14141a]">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#23232e] bg-[#1a1a22] text-left text-xs text-[#6f6f80]">
              <th className="px-4 py-3 font-medium">店舗</th>
              <th className="px-4 py-3 font-medium">コース名</th>
              <th className="px-4 py-3 font-medium">種別</th>
              <th className="px-4 py-3 font-medium">価格</th>
              <th className="px-4 py-3 font-medium">状態</th>
              <th className="px-4 py-3 text-right font-medium">操作</th>
            </tr>
          </thead>
          <tbody>
            {(courses ?? []).map((c) => (
              <tr key={c.id} className="border-b border-[#1d1d26] last:border-0 hover:bg-white/[0.02]">
                <td className="px-4 py-3 text-[#9a9aa8]">{storeName.get(c.store_id) ?? '—'}</td>
                <td className="px-4 py-3 font-medium text-[#ebe5db]">{c.name}</td>
                <td className="px-4 py-3 text-[#9a9aa8]">{c.type_label ?? '—'}</td>
                <td className="px-4 py-3 text-[#9a9aa8]">{c.price_label ?? '—'}</td>
                <td className="px-4 py-3">
                  {c.is_active ? (
                    <span className="rounded-full bg-green-900/30 px-2 py-0.5 text-xs text-green-400">公開中</span>
                  ) : (
                    <span className="rounded-full bg-gray-900/40 px-2 py-0.5 text-xs text-gray-400">非公開</span>
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-3">
                    <Link href={`/admin/courses/${c.id}/edit`} className="text-xs text-[#d9b86b] hover:underline">編集</Link>
                    <CourseDeleteButton id={c.id} name={c.name} />
                  </div>
                </td>
              </tr>
            ))}
            {(!courses || courses.length === 0) && (
              <tr><td colSpan={6} className="px-4 py-10 text-center text-sm text-[#6f6f80]">コースがありません。</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
