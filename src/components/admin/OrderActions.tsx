'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toggleOrderRead, updateOrderStatus, type OrderStatus } from '@/lib/actions/takeout-orders'

const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: '受付待ち',
  confirmed: '確定',
  cancelled: 'キャンセル',
  completed: '完了',
}

export default function OrderActions({
  orderId,
  isRead,
  status,
}: {
  orderId: string
  isRead: boolean
  status: OrderStatus
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleRead() {
    setLoading(true)
    await toggleOrderRead(orderId, isRead)
    setLoading(false)
    router.refresh()
  }
  async function handleStatus(s: OrderStatus) {
    setLoading(true)
    await updateOrderStatus(orderId, s)
    setLoading(false)
    router.refresh()
  }

  return (
    <div className="flex items-center gap-2">
      <select
        value={status}
        onChange={(e) => handleStatus(e.target.value as OrderStatus)}
        disabled={loading}
        className="rounded-md border border-[#2f2f3c] bg-[#0a0a0f] px-2 py-1 text-xs text-[#ebe5db] disabled:opacity-50"
      >
        {(Object.keys(STATUS_LABELS) as OrderStatus[]).map((s) => (
          <option key={s} value={s}>{STATUS_LABELS[s]}</option>
        ))}
      </select>
      <button
        type="button"
        onClick={handleRead}
        disabled={loading}
        className={`rounded-md border px-3 py-1 text-xs transition-colors disabled:opacity-50 ${
          isRead ? 'border-[#2f2f3c] text-[#9a9aa8] hover:text-[#ebe5db]' : 'border-[#d9b86b]/40 text-[#d9b86b] hover:bg-[#d9b86b]/10'
        }`}
      >
        {isRead ? '未読に戻す' : '既読にする'}
      </button>
    </div>
  )
}
