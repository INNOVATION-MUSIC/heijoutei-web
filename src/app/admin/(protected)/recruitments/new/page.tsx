import Link from 'next/link'
import { getStoreRefs } from '@/lib/actions/refs'
import RecruitForm from '@/components/admin/RecruitForm'

export const dynamic = 'force-dynamic'

export default async function NewRecruitPage() {
  const stores = await getStoreRefs()
  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/recruitments" className="text-xs text-[#6f6f80] hover:text-[#ebe5db]">← 採用情報一覧へ</Link>
        <h1 className="mt-1 text-2xl font-bold text-[#ebe5db]">新規求人</h1>
      </div>
      <RecruitForm stores={stores} />
    </div>
  )
}
