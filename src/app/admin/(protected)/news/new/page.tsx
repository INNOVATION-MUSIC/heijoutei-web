import Link from 'next/link'
import NewsForm from '@/components/admin/NewsForm'

export const dynamic = 'force-dynamic'

export default function NewNewsPage() {
  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/news" className="text-xs text-[#6f6f80] hover:text-[#ebe5db]">← お知らせ一覧へ</Link>
        <h1 className="mt-1 text-2xl font-bold text-[#ebe5db]">お知らせ新規作成</h1>
      </div>
      <NewsForm />
    </div>
  )
}
