import Link from 'next/link'
import { notFound } from 'next/navigation'
import { adminSupabase } from '@/lib/supabase/admin'
import { getStoreRefs, getMenuCategoryRefs } from '@/lib/actions/refs'
import { getMenuItems } from '@/lib/actions/menus'
import MenuForm from '@/components/admin/MenuForm'

export const dynamic = 'force-dynamic'

export default async function EditMenuPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [{ data: menu }, stores, categories, items] = await Promise.all([
    adminSupabase.from('store_menus').select('*').eq('id', id).single(),
    getStoreRefs(),
    getMenuCategoryRefs(),
    getMenuItems(id),
  ])
  if (!menu) notFound()

  const initialItems = items.map((it) => ({
    name: it.name,
    description: it.description,
    price_label: it.price_label,
    image_url: it.image_url,
  }))

  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/menus" className="text-xs text-[#6f6f80] hover:text-[#ebe5db]">← メニュー一覧へ</Link>
        <h1 className="mt-1 text-2xl font-bold text-[#ebe5db]">メニューを編集</h1>
      </div>
      <MenuForm stores={stores} categories={categories} initial={menu} initialItems={initialItems} />
    </div>
  )
}
