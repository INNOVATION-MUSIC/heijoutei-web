'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { deleteStore } from '@/lib/actions/stores'

export default function DeleteStoreButton({ id, name }: { id: string; name: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleDelete() {
    if (!confirm(`「${name}」を削除します。紐づくメニュー・コース・採用なども削除されます。よろしいですか？`)) return
    setLoading(true)
    const result = await deleteStore(id)
    if (result?.error) {
      alert(result.error)
      setLoading(false)
      return
    }
    router.refresh()
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={loading}
      className="text-xs text-red-400/80 transition-colors hover:text-red-400 disabled:opacity-50"
    >
      {loading ? '削除中...' : '削除'}
    </button>
  )
}
