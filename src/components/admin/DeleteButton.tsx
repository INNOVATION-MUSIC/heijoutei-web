'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import ConfirmDeleteModal from './ConfirmDeleteModal'

// 各削除ボタンの共通実装。ボタン→モーダル→削除ボタンの2クリックで確定させ、
// window.confirm() の誤クリックによる意図しない削除を防ぐ。
export default function DeleteButton({
  confirmTitle,
  confirmDescription,
  onDelete,
  label = '削除',
  className = 'text-xs text-red-400/80 hover:text-red-400 disabled:opacity-50',
}: {
  confirmTitle: string
  confirmDescription?: string
  onDelete: () => Promise<{ error?: string } | undefined>
  label?: string
  className?: string
}) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleConfirm() {
    setLoading(true)
    const result = await onDelete()
    if (result?.error) {
      alert(result.error)
      setLoading(false)
      setOpen(false)
      return
    }
    router.refresh()
  }

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} disabled={loading} className={className}>
        {loading ? '削除中...' : label}
      </button>
      <ConfirmDeleteModal
        open={open}
        title={confirmTitle}
        description={confirmDescription}
        loading={loading}
        onCancel={() => setOpen(false)}
        onConfirm={handleConfirm}
      />
    </>
  )
}
