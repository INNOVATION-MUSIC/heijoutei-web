import Link from 'next/link'
import { adminSupabase } from '@/lib/supabase/admin'
import OrderActions from '@/components/admin/OrderActions'
import type { OrderStatus } from '@/lib/actions/takeout-orders'

export const dynamic = 'force-dynamic'

const STATUS_BADGE: Record<string, { label: string; cls: string }> = {
  pending: { label: '受付待ち', cls: 'bg-yellow-900/30 text-yellow-400' },
  confirmed: { label: '確定', cls: 'bg-green-900/30 text-green-400' },
  cancelled: { label: 'キャンセル', cls: 'bg-red-900/30 text-red-400' },
  completed: { label: '完了', cls: 'bg-gray-900/40 text-gray-400' },
}

export default async function AdminTakeoutOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ store?: string }>
}) {
  const { store } = await searchParams
  const today = new Date().toISOString().slice(0, 10)

  const { data: stores } = await adminSupabase.from('stores').select('id, name').order('sort_order')

  let q = adminSupabase
    .from('takeout_orders')
    .select('*')
    .order('created_at', { ascending: false })
  if (store) q = q.eq('store_id', store)
  const { data: orders } = await q

  const orderIds = (orders ?? []).map((o) => o.id)
  const itemsByOrder = new Map<string, { item_name: string; price: number; quantity: number }[]>()
  if (orderIds.length) {
    const { data: items } = await adminSupabase
      .from('takeout_order_items')
      .select('order_id, item_name, price, quantity')
      .in('order_id', orderIds)
    for (const it of items ?? []) {
      const arr = itemsByOrder.get(it.order_id) ?? []
      arr.push(it)
      itemsByOrder.set(it.order_id, arr)
    }
  }

  const storeName = new Map((stores ?? []).map((s) => [s.id, s.name]))
  const unread = (orders ?? []).filter((o) => !o.is_read).length
  const todays = (orders ?? []).filter((o) => o.pickup_date === today)
  const todayTotal = todays.reduce((sum, o) => sum + o.total_price, 0)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#ebe5db]">テイクアウト注文受付</h1>
        <p className="text-sm text-[#6f6f80]">
          未読 {unread} 件 / 本日受取 {todays.length} 件・合計 {todayTotal.toLocaleString('ja-JP')}円
        </p>
      </div>

      {/* 店舗フィルター */}
      <div className="flex flex-wrap gap-2">
        <Link href="/admin/takeout-orders" className={`rounded-full border px-3 py-1.5 text-xs ${!store ? 'border-[#d9b86b] bg-[#d9b86b]/15 text-[#ebe5db]' : 'border-[#2f2f3c] text-[#9a9aa8] hover:text-[#ebe5db]'}`}>すべて</Link>
        {(stores ?? []).map((s) => (
          <Link key={s.id} href={`/admin/takeout-orders?store=${s.id}`} className={`rounded-full border px-3 py-1.5 text-xs ${store === s.id ? 'border-[#d9b86b] bg-[#d9b86b]/15 text-[#ebe5db]' : 'border-[#2f2f3c] text-[#9a9aa8] hover:text-[#ebe5db]'}`}>{s.name}</Link>
        ))}
      </div>

      <div className="space-y-3">
        {(orders ?? []).map((o) => (
          <details key={o.id} className={`rounded-xl border bg-[#14141a] ${o.is_read ? 'border-[#23232e]' : 'border-l-2 border-l-blue-500 border-[#23232e]'}`}>
            <summary className="flex cursor-pointer items-center gap-3 px-5 py-4">
              {!o.is_read && <span className="h-2 w-2 flex-shrink-0 rounded-full bg-blue-500" />}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-[#ebe5db]">
                  {o.customer_name} 様 ・ {storeName.get(o.store_id) ?? ''}
                </p>
                <p className="truncate text-xs text-[#6f6f80]">受取 {o.pickup_date} {o.pickup_time} ・ {o.total_price.toLocaleString('ja-JP')}円</p>
              </div>
              <span className={`rounded-full px-2 py-0.5 text-xs ${STATUS_BADGE[o.status]?.cls ?? ''}`}>{STATUS_BADGE[o.status]?.label ?? o.status}</span>
            </summary>
            <div className="space-y-4 border-t border-[#23232e] px-5 py-4">
              <div>
                <p className="mb-1 text-xs text-[#6f6f80]">ご注文内容</p>
                <ul className="space-y-1 text-sm text-[#ebe5db]">
                  {(itemsByOrder.get(o.id) ?? []).map((it, i) => (
                    <li key={i} className="flex justify-between">
                      <span>{it.item_name} × {it.quantity}</span>
                      <span className="text-[#9a9aa8]">{(it.price * it.quantity).toLocaleString('ja-JP')}円</span>
                    </li>
                  ))}
                </ul>
                <p className="mt-2 flex justify-between border-t border-[#23232e] pt-2 text-sm font-medium text-[#ebe5db]">
                  <span>合計</span><span>{o.total_price.toLocaleString('ja-JP')}円</span>
                </p>
              </div>
              <dl className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
                <div><dt className="text-xs text-[#6f6f80]">お名前</dt><dd className="text-[#ebe5db]">{o.customer_name}{o.customer_kana ? `（${o.customer_kana}）` : ''}</dd></div>
                <div><dt className="text-xs text-[#6f6f80]">メール</dt><dd className="text-[#ebe5db]">{o.customer_email}</dd></div>
                <div><dt className="text-xs text-[#6f6f80]">電話</dt><dd className="text-[#ebe5db]">{o.customer_phone ?? '—'}</dd></div>
                <div><dt className="text-xs text-[#6f6f80]">連絡事項</dt><dd className="text-[#ebe5db]">{o.customer_note ?? '—'}</dd></div>
              </dl>
              <OrderActions orderId={o.id} isRead={o.is_read ?? false} status={o.status as OrderStatus} />
            </div>
          </details>
        ))}
        {(!orders || orders.length === 0) && (
          <p className="rounded-xl border border-[#23232e] bg-[#14141a] px-5 py-10 text-center text-sm text-[#6f6f80]">注文はありません。</p>
        )}
      </div>
    </div>
  )
}
