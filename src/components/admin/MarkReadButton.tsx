'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toggleMessageRead } from '@/lib/actions/contact'

export default function MarkReadButton({ messageId, isRead }: { messageId: string; isRead: boolean }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  async function handle() {
    setLoading(true)
    const r = await toggleMessageRead(messageId, isRead)
    if (r?.error) alert(r.error)
    setLoading(false)
    router.refresh()
  }
  return (
    <button
      type="button"
      onClick={handle}
      disabled={loading}
      className={`rounded-md border px-3 py-1 text-xs transition-colors disabled:opacity-50 ${
        isRead ? 'border-[#2f2f3c] text-[#9a9aa8] hover:text-[#ebe5db]' : 'border-[#d9b86b]/40 text-[#d9b86b] hover:bg-[#d9b86b]/10'
      }`}
    >
      {loading ? '...' : isRead ? '未読に戻す' : '既読にする'}
    </button>
  )
}
