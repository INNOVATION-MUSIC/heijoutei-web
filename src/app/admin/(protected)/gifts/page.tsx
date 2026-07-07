import Link from 'next/link'
import { adminSupabase } from '@/lib/supabase/admin'
import DraggableGiftTable, { type GiftRow } from '@/components/admin/DraggableGiftTable'

export const dynamic = 'force-dynamic'

export default async function AdminGiftsPage() {
  const { data: gifts } = await adminSupabase
    .from('gift_products')
    .select('id, title, price_amount, price_note, is_active, sort_order')
    .order('sort_order', { ascending: true })

  const rows: GiftRow[] = (gifts ?? []).map((g) => ({
    id: g.id,
    title: g.title,
    price_amount: g.price_amount,
    price_note: g.price_note,
    is_active: g.is_active,
  }))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#ebe5db]">ギフト管理</h1>
          <p className="text-sm text-[#6f6f80]">全 {rows.length} 件・行をドラッグで並べ替え（/gift の表示順に反映）</p>
        </div>
        <Link href="/admin/gifts/new" className="inline-flex items-center gap-2 rounded-lg bg-[#d9b86b] px-4 py-2 text-sm font-medium text-[#1a1410] hover:opacity-90">
          ＋ 新規ギフト
        </Link>
      </div>

      {rows.length > 0 ? (
        // 行の集合（複製/削除）が変わったら再マウントして最新を反映する
        <DraggableGiftTable key={rows.map((r) => r.id).join(',')} initial={rows} />
      ) : (
        <div className="rounded-xl border border-[#23232e] bg-[#14141a] px-4 py-10 text-center text-sm text-[#6f6f80]">
          ギフト商品がありません。「＋ 新規ギフト」から追加してください。
        </div>
      )}
    </div>
  )
}
