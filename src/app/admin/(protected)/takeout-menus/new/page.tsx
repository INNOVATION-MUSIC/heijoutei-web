import Link from 'next/link'
import { getStoreRefs, getTakeoutCategoryRefs } from '@/lib/actions/refs'
import TakeoutMenuForm from '@/components/admin/TakeoutMenuForm'

export const dynamic = 'force-dynamic'

export default async function NewTakeoutMenuPage() {
  const [stores, categories] = await Promise.all([getStoreRefs(), getTakeoutCategoryRefs()])
  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/takeout-menus" className="text-xs text-[#6f6f80] hover:text-[#ebe5db]">← テイクアウトメニュー一覧へ</Link>
        <h1 className="mt-1 text-2xl font-bold text-[#ebe5db]">新規テイクアウトメニュー</h1>
      </div>
      <TakeoutMenuForm stores={stores} categories={categories} />
    </div>
  )
}
