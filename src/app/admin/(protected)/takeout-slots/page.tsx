import { getStoreRefs } from '@/lib/actions/refs'
import { scopedStoreIds } from '@/lib/auth-guard'
import { adminSupabase } from '@/lib/supabase/admin'
import TakeoutCalendar from '@/components/admin/TakeoutCalendar'

export const dynamic = 'force-dynamic'

export default async function TakeoutSlotsPage() {
  // 受付枠管理は亀岡本店専用。亀岡の担当でない店舗スタッフには見せない。
  const allowed = await scopedStoreIds()
  if (allowed) {
    const { data: rows } = await adminSupabase.from('stores').select('slug').in('id', allowed)
    if (!(rows ?? []).some((r) => r.slug === 'kameoka')) {
      return (
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-[#ebe5db]">テイクアウト受付枠管理</h1>
          </div>
          <p className="rounded-lg border border-[#23232e] bg-[#14141a] px-4 py-3 text-sm text-[#9a9aa8]">
            受付枠管理（亀岡本店）は本部で管理しています。
          </p>
        </div>
      )
    }
  }

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
