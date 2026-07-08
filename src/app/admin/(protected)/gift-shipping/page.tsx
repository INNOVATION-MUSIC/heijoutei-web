import Link from 'next/link'
import { adminSupabase } from '@/lib/supabase/admin'
import GiftShippingEditor from '@/components/admin/GiftShippingEditor'
import type { GiftShippingArea } from '@/app/lib/giftData'

export const dynamic = 'force-dynamic'

export default async function AdminGiftShippingPage() {
  const { data } = await adminSupabase
    .from('gift_shipping_areas')
    .select('region, prefectures, fee')
    .order('sort_order', { ascending: true })

  const areas: GiftShippingArea[] = (data ?? []).map((a) => ({
    region: a.region,
    prefectures: a.prefectures ?? [],
    fee: a.fee ?? '',
  }))

  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/gifts" className="text-xs text-[#6f6f80] hover:text-[#ebe5db]">← ギフト管理へ</Link>
        <h1 className="mt-1 text-2xl font-bold text-[#ebe5db]">送料金表</h1>
        <p className="text-sm text-[#6f6f80]">/gift ページの送料金表。行をドラッグで並べ替え、「保存する」でまとめて反映されます。</p>
      </div>
      <GiftShippingEditor initial={areas} />
    </div>
  )
}
