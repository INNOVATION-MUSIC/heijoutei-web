import Link from 'next/link'
import { adminSupabase } from '@/lib/supabase/admin'
import NewsDeleteButton from '@/components/admin/NewsDeleteButton'

export const dynamic = 'force-dynamic'

function statusBadge(isPublished: boolean | null, publishedAt: string | null) {
  if (!isPublished) return <span className="rounded-full bg-yellow-900/30 px-2 py-0.5 text-xs text-yellow-400">下書き</span>
  if (publishedAt && new Date(publishedAt) > new Date())
    return <span className="rounded-full bg-blue-900/30 px-2 py-0.5 text-xs text-blue-300">予約公開</span>
  return <span className="rounded-full bg-green-900/30 px-2 py-0.5 text-xs text-green-400">公開中</span>
}

export default async function AdminNewsPage() {
  const { data: news } = await adminSupabase
    .from('news')
    .select('id, title, slug, is_published, published_at, created_at')
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#ebe5db]">お知らせ管理</h1>
          <p className="text-sm text-[#6f6f80]">全 {news?.length ?? 0} 件</p>
        </div>
        <Link href="/admin/news/new" className="inline-flex items-center gap-2 rounded-lg bg-[#d9b86b] px-4 py-2 text-sm font-medium text-[#1a1410] hover:opacity-90">
          ＋ 新規作成
        </Link>
      </div>

      <div className="overflow-hidden rounded-xl border border-[#23232e] bg-[#14141a]">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#23232e] bg-[#1a1a22] text-left text-xs text-[#6f6f80]">
              <th className="px-4 py-3 font-medium">タイトル</th>
              <th className="px-4 py-3 font-medium">状態</th>
              <th className="px-4 py-3 font-medium">公開日時</th>
              <th className="px-4 py-3 text-right font-medium">操作</th>
            </tr>
          </thead>
          <tbody>
            {(news ?? []).map((n) => (
              <tr key={n.id} className="border-b border-[#1d1d26] last:border-0 hover:bg-white/[0.02]">
                <td className="px-4 py-3">
                  <p className="font-medium text-[#ebe5db]">{n.title}</p>
                  <p className="text-xs text-[#5a5a6a]">{n.slug}</p>
                </td>
                <td className="px-4 py-3">{statusBadge(n.is_published, n.published_at)}</td>
                <td className="px-4 py-3 text-[#9a9aa8]">
                  {n.published_at ? new Date(n.published_at).toLocaleString('ja-JP', { dateStyle: 'medium', timeStyle: 'short' }) : '—'}
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-3">
                    <Link href={`/admin/news/${n.id}/edit`} className="text-xs text-[#d9b86b] hover:underline">編集</Link>
                    <NewsDeleteButton id={n.id} title={n.title} />
                  </div>
                </td>
              </tr>
            ))}
            {(!news || news.length === 0) && (
              <tr><td colSpan={4} className="px-4 py-10 text-center text-sm text-[#6f6f80]">お知らせがありません。</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
