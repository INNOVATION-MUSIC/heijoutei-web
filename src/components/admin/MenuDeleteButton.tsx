'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { deleteStoreMenu } from '@/lib/actions/menus'

export default function MenuDeleteButton({ id, label }: { id: string; label: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  async function handleDelete() {
    if (!confirm(`「${label}」を削除しますか？紐づく品目も削除されます。`)) return
    setLoading(true)
    const result = await deleteStoreMenu(id)
    if (result?.error) {
      alert(result.error)
      setLoading(false)
      return
    }
    router.refresh()
  }
  return (
    <button type="button" onClick={handleDelete} disabled={loading} className="text-xs text-red-400/80 hover:text-red-400 disabled:opacity-50">
      {loading ? '削除中...' : '削除'}
    </button>
  )
}
