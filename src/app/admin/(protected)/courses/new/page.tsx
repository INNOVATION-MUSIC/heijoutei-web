import Link from 'next/link'
import { getStoreRefs } from '@/lib/actions/refs'
import CourseForm from '@/components/admin/CourseForm'

export const dynamic = 'force-dynamic'

export default async function NewCoursePage() {
  const stores = await getStoreRefs()
  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/courses" className="text-xs text-[#6f6f80] hover:text-[#ebe5db]">← コース一覧へ</Link>
        <h1 className="mt-1 text-2xl font-bold text-[#ebe5db]">新規コース</h1>
      </div>
      <CourseForm stores={stores} />
    </div>
  )
}
