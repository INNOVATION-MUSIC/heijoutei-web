import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getStoreRefs, getLunchCategory, getLunchCategoryRefs } from '@/lib/actions/refs'
import MenuForm from '@/components/admin/MenuForm'

export const dynamic = 'force-dynamic'

export default async function NewLunchPage({
  searchParams,
}: {
  searchParams: Promise<{ store?: string }>
}) {
  const { store } = await searchParams
  const [stores, lunchCat, lunchCategories] = await Promise.all([
    getStoreRefs(),
    getLunchCategory(),
    getLunchCategoryRefs(),
  ])
  if (!lunchCat) notFound()

  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/lunch" className="text-xs text-[#6f6f80] hover:text-[#ebe5db]">← ランチ一覧へ</Link>
        <h1 className="mt-1 text-2xl font-bold text-[#ebe5db]">ランチメニューを作成</h1>
      </div>
      <MenuForm
        stores={stores}
        categories={[]}
        defaultStoreId={store}
        lunchMode
        forcedCategoryId={lunchCat.id}
        lunchCategories={lunchCategories}
      />
    </div>
  )
}
