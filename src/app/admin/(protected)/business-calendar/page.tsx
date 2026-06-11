import { adminSupabase } from '@/lib/supabase/admin'
import BusinessCalendar from '@/components/admin/BusinessCalendar'

export const dynamic = 'force-dynamic'

export default async function BusinessCalendarPage() {
  // 亀岡本店固定（トップの Business days セクションに連動）
  const { data: store } = await adminSupabase
    .from('stores')
    .select('id, name')
    .eq('slug', 'kameoka')
    .single()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#ebe5db]">営業カレンダー管理</h1>
        <p className="text-sm text-[#6f6f80]">亀岡本店の営業日ステータスを設定します</p>
      </div>
      {store ? (
        <BusinessCalendar storeId={store.id} storeName={store.name} />
      ) : (
        <p className="rounded-lg border border-red-800/50 bg-red-900/20 px-4 py-3 text-sm text-red-400">
          亀岡店（slug=kameoka）が見つかりません。先に店舗管理で登録してください。
        </p>
      )}
    </div>
  )
}
