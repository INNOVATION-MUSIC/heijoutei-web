'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { duplicateCourse } from '@/lib/actions/courses'

export default function CourseDuplicateButton({ id, name }: { id: string; name: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  async function handleDuplicate() {
    if (!confirm(`「${name}」を複製しますか？（複製は非公開で作成されます）`)) return
    setLoading(true)
    const result = await duplicateCourse(id)
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
      onClick={handleDuplicate}
      disabled={loading}
      className="text-xs text-[#9a9aa8] hover:text-[#ebe5db] disabled:opacity-50"
    >
      {loading ? '複製中...' : '複製'}
    </button>
  )
}
