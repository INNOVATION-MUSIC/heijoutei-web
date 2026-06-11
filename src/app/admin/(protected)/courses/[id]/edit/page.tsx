import Link from 'next/link'
import { notFound } from 'next/navigation'
import { adminSupabase } from '@/lib/supabase/admin'
import { getStoreRefs } from '@/lib/actions/refs'
import CourseForm from '@/components/admin/CourseForm'

export const dynamic = 'force-dynamic'

export default async function EditCoursePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [{ data: course }, stores] = await Promise.all([
    adminSupabase.from('courses').select('*').eq('id', id).single(),
    getStoreRefs(),
  ])
  if (!course) notFound()

  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/courses" className="text-xs text-[#6f6f80] hover:text-[#ebe5db]">← コース一覧へ</Link>
        <h1 className="mt-1 text-2xl font-bold text-[#ebe5db]">コースを編集：{course.name}</h1>
      </div>
      <CourseForm stores={stores} initial={course} />
    </div>
  )
}
