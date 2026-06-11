import Link from 'next/link'
import { notFound } from 'next/navigation'
import { adminSupabase } from '@/lib/supabase/admin'
import { getNewsTags } from '@/lib/actions/news'
import NewsForm from '@/components/admin/NewsForm'

export const dynamic = 'force-dynamic'

export default async function EditNewsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [{ data: news }, tags] = await Promise.all([
    adminSupabase.from('news').select('*').eq('id', id).single(),
    getNewsTags(id),
  ])
  if (!news) notFound()

  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/news" className="text-xs text-[#6f6f80] hover:text-[#ebe5db]">← お知らせ一覧へ</Link>
        <h1 className="mt-1 text-2xl font-bold text-[#ebe5db]">お知らせを編集</h1>
      </div>
      <NewsForm initial={news} initialTags={tags.map((t) => ({ label: t.label, color: t.color }))} />
    </div>
  )
}
