import Link from 'next/link'
import { notFound } from 'next/navigation'
import { adminSupabase } from '@/lib/supabase/admin'
import { scopedStoreIds } from '@/lib/auth-guard'
import { getStoreRefs, getTakeoutCategoryRefs } from '@/lib/actions/refs'
import { getTakeoutMenuStoreIds } from '@/lib/actions/takeout-menus'
import TakeoutMenuForm from '@/components/admin/TakeoutMenuForm'

export const dynamic = 'force-dynamic'

export default async function EditTakeoutMenuPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [{ data: menu }, stores, categories, storeIds] = await Promise.all([
    adminSupabase.from('store_takeout_menus').select('*').eq('id', id).single(),
    getStoreRefs(),
    getTakeoutCategoryRefs(),
    getTakeoutMenuStoreIds(id),
  ])
  if (!menu) notFound()
  // リンク先店舗のいずれかが担当外なら編集不可（他店と共有のメニューは本部のみ）
  const allowed = await scopedStoreIds()
  if (allowed && (storeIds.length === 0 || !storeIds.every((s) => allowed.includes(s)))) notFound()

  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/takeout-menus" className="text-xs text-[#6f6f80] hover:text-[#ebe5db]">← テイクアウトメニュー一覧へ</Link>
        <h1 className="mt-1 text-2xl font-bold text-[#ebe5db]">メニューを編集：{menu.name}</h1>
      </div>
      <TakeoutMenuForm stores={stores} categories={categories} initial={menu} initialStoreIds={storeIds} />
    </div>
  )
}
