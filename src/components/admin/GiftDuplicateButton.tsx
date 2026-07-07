'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { duplicateGift } from '@/lib/actions/gifts'

export default function GiftDuplicateButton({ id, name }: { id: string; name: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  async function handleDuplicate() {
    if (!confirm(`「${name}」を複製しますか？（複製は非公開で作成されます）`)) return
    setLoading(true)
    try {
      const result = await duplicateGift(id)
      if (result?.error) {
        alert(result.error)
        return
      }
      router.refresh()
    } catch (e) {
      console.error(e)
      alert('複製に失敗しました。ページを再読み込みして再度お試しください。')
    } finally {
      setLoading(false)
    }
  }
  return (
    <button type="button" onClick={handleDuplicate} disabled={loading} className="text-xs text-[#9a9aa8] hover:text-[#ebe5db] disabled:opacity-50">
      {loading ? '複製中...' : '複製'}
    </button>
  )
}
