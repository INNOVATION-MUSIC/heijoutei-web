'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { deleteNews } from '@/lib/actions/news'

export default function NewsDeleteButton({ id, title }: { id: string; title: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  async function handleDelete() {
    if (!confirm(`「${title}」を削除しますか？`)) return
    setLoading(true)
    const result = await deleteNews(id)
    if (result?.error) { alert(result.error); setLoading(false); return }
    router.refresh()
  }
  return (
    <button type="button" onClick={handleDelete} disabled={loading} className="text-xs text-red-400/80 hover:text-red-400 disabled:opacity-50">
      {loading ? '削除中...' : '削除'}
    </button>
  )
}
