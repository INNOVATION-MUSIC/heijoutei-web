import Link from 'next/link'
import { notFound } from 'next/navigation'
import { adminSupabase } from '@/lib/supabase/admin'
import { getStoreRefs } from '@/lib/actions/refs'
import { getRecruitTags, getRecruitDetails } from '@/lib/actions/recruitments'
import RecruitForm from '@/components/admin/RecruitForm'

export const dynamic = 'force-dynamic'

export default async function EditRecruitPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [{ data: recruit }, stores, tags, details] = await Promise.all([
    adminSupabase.from('recruitments').select('*').eq('id', id).single(),
    getStoreRefs(),
    getRecruitTags(id),
    getRecruitDetails(id),
  ])
  if (!recruit) notFound()

  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/recruitments" className="text-xs text-[#6f6f80] hover:text-[#ebe5db]">← 採用情報一覧へ</Link>
        <h1 className="mt-1 text-2xl font-bold text-[#ebe5db]">求人を編集：{recruit.title}</h1>
      </div>
      <RecruitForm
        stores={stores}
        initial={recruit}
        initialTags={tags.map((t) => ({ label: t.label, color: t.color }))}
        initialDetails={details.map((d) => ({ label: d.label, value: d.value }))}
      />
    </div>
  )
}
