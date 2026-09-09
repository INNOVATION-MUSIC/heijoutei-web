import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { adminSupabase } from '@/lib/supabase/admin'
import { scopedStoreIds } from '@/lib/auth-guard'
import LoginCard from '@/components/admin/LoginCard'
import OrderActions from '@/components/admin/OrderActions'
import type { OrderStatus } from '@/lib/actions/takeout-orders'

export const dynamic = 'force-dynamic'

const STATUS_BADGE: Record<string, { label: string; cls: string }> = {
  pending: { label: '受付待ち', cls: 'bg-yellow-900/30 text-yellow-400' },
  confirmed: { label: '確定', cls: 'bg-green-900/30 text-green-400' },
  cancelled: { label: 'キャンセル', cls: 'bg-red-900/30 text-red-400' },
  completed: { label: '完了', cls: 'bg-gray-900/40 text-gray-400' },
}

const yen = (n: number) => `${n.toLocaleString('ja-JP')}円`

// メールの「管理画面で詳細を見る」の着地点。
// サイドメニューや他の注文は出さず、この注文の詳細だけを表示する（認証は必須）。
export default async function AdminOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    // リダイレクトせずインラインログイン＝URL を保つ。成功で router.refresh() → この注文が表示される。
    return <LoginCard />
  }

  const { data: order } = await adminSupabase.from('takeout_orders').select('*').eq('id', id).maybeSingle()
  if (!order) notFound()

  // 店舗スタッフは担当店舗の注文のみ
  const allowed = await scopedStoreIds()
  if (allowed && !allowed.includes(order.store_id)) notFound()

  const [{ data: store }, { data: items }] = await Promise.all([
    adminSupabase.from('stores').select('name').eq('id', order.store_id).maybeSingle(),
    adminSupabase.from('takeout_order_items').select('item_name, price, quantity').eq('order_id', id),
  ])

  const badge = STATUS_BADGE[order.status] ?? { label: order.status, cls: '' }

  return (
    <div className="min-h-screen bg-[#0a0a0f] px-4 py-10">
      <div className="mx-auto max-w-lg space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-bold text-[#ebe5db]">テイクアウト注文詳細</h1>
          <span className={`rounded-full px-2 py-0.5 text-xs ${badge.cls}`}>{badge.label}</span>
        </div>

        <div className="space-y-5 rounded-xl border border-[#23232e] bg-[#14141a] p-5">
          <dl className="grid grid-cols-1 gap-2 text-sm">
            <Row label="受取店舗" value={store?.name ?? '—'} />
            <Row label="受取日時" value={`${order.pickup_date} ${order.pickup_time}`} />
            <Row label="注文番号" value={`#${order.id.slice(0, 8)}`} />
            <Row label="受付日時" value={order.created_at ? new Date(order.created_at).toLocaleString('ja-JP') : '—'} />
          </dl>

          <div>
            <p className="mb-1 text-xs text-[#6f6f80]">ご注文内容</p>
            <ul className="space-y-1 text-sm text-[#ebe5db]">
              {(items ?? []).map((it, i) => (
                <li key={i} className="flex justify-between">
                  <span>{it.item_name} × {it.quantity}</span>
                  <span className="text-[#9a9aa8]">{yen(it.price * it.quantity)}</span>
                </li>
              ))}
            </ul>
            <p className="mt-2 flex justify-between border-t border-[#23232e] pt-2 text-sm font-medium text-[#ebe5db]">
              <span>合計</span><span>{yen(order.total_price)}</span>
            </p>
          </div>

          <dl className="grid grid-cols-1 gap-2 border-t border-[#23232e] pt-4 text-sm">
            <Row label="お名前" value={`${order.customer_name}${order.customer_kana ? `（${order.customer_kana}）` : ''}`} />
            <Row label="メール" value={order.customer_email} />
            <Row label="電話" value={order.customer_phone ?? '—'} />
            <Row label="連絡事項" value={order.customer_note ?? '—'} />
          </dl>

          <div className="border-t border-[#23232e] pt-4">
            <OrderActions orderId={order.id} isRead={order.is_read ?? false} status={order.status as OrderStatus} />
          </div>
        </div>

        <Link href="/admin/takeout-orders" className="block text-center text-xs text-[#6f6f80] hover:text-[#ebe5db]">
          注文一覧をすべて見る
        </Link>
      </div>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-3">
      <dt className="w-20 shrink-0 text-xs text-[#6f6f80]">{label}</dt>
      <dd className="whitespace-pre-wrap text-[#ebe5db]">{value}</dd>
    </div>
  )
}
