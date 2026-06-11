import Link from 'next/link'
import { getStoreRefs, getMenuCategoryRefs } from '@/lib/actions/refs'
import MenuForm from '@/components/admin/MenuForm'

export const dynamic = 'force-dynamic'

export default async function NewMenuPage() {
  const [stores, categories] = await Promise.all([getStoreRefs(), getMenuCategoryRefs()])
  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/menus" className="text-xs text-[#6f6f80] hover:text-[#ebe5db]">← メニュー一覧へ</Link>
        <h1 className="mt-1 text-2xl font-bold text-[#ebe5db]">新規メニュー</h1>
      </div>
      <MenuForm stores={stores} categories={categories} />
    </div>
  )
}
