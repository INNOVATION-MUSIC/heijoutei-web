import { getStoreRefs } from '@/lib/actions/refs'
import TakeoutCalendar from '@/components/admin/TakeoutCalendar'

export const dynamic = 'force-dynamic'

export default async function TakeoutSlotsPage() {
  const stores = await getStoreRefs()
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#ebe5db]">テイクアウト受付枠管理</h1>
        <p className="text-sm text-[#6f6f80]">店舗・日付ごとに受付時間枠と定員を設定します</p>
      </div>
      <TakeoutCalendar stores={stores} />
    </div>
  )
}
