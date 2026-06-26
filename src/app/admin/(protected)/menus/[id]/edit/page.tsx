import Link from 'next/link'
import { notFound } from 'next/navigation'
import { adminSupabase } from '@/lib/supabase/admin'
import { getStoreRefs, getMenuCategoryRefs } from '@/lib/actions/refs'
import { getMenuItems } from '@/lib/actions/menus'
import MenuForm from '@/components/admin/MenuForm'

export const dynamic = 'force-dynamic'

export default async function EditMenuPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [{ data: menu }, stores, categories, items, { data: allMenus }] = await Promise.all([
    adminSupabase.from('store_menus').select('*').eq('id', id).single(),
    getStoreRefs(),
    getMenuCategoryRefs(),
    getMenuItems(id),
    adminSupabase.from('store_menus').select('id, store_id, category_id'),
  ])
  if (!menu) notFound()
  // 店舗×カテゴリ → メニューid の索引（カテゴリ切替で該当メニューへ遷移するため）
  const menuIndex = (allMenus ?? []).map((m) => ({ id: m.id, store_id: m.store_id, category_id: m.category_id }))

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
      <MenuForm key={menu.id} stores={stores} categories={categories} initial={menu} initialItems={initialItems} menuIndex={menuIndex} />
    </div>
  )
}
