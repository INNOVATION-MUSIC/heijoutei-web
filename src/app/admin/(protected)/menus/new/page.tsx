import Link from 'next/link'
import { getStoreRefs, getMenuCategoryRefs } from '@/lib/actions/refs'
import MenuForm from '@/components/admin/MenuForm'

export const dynamic = 'force-dynamic'

export default async function NewMenuPage({
  searchParams,
}: {
  searchParams: Promise<{ store?: string; category?: string }>
}) {
  const [{ store, category }, stores, categories] = await Promise.all([searchParams, getStoreRefs(), getMenuCategoryRefs()])
  // 一覧の絞り込み（店舗・カテゴリ）を初期値として引き継ぐ（カテゴリ取り違え防止）
  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/menus" className="text-xs text-[#6f6f80] hover:text-[#ebe5db]">← メニュー一覧へ</Link>
        <h1 className="mt-1 text-2xl font-bold text-[#ebe5db]">新規メニュー</h1>
      </div>
      <MenuForm stores={stores} categories={categories} defaultStoreId={store} defaultCategoryId={category} />
    </div>
  )
}
