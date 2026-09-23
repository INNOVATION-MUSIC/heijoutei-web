'use client'

// window.confirm() はワンクリックで素通りしやすく誤操作を防げないため、
// ボタンを押す形式のモーダルに統一する（削除は元に戻せない操作のため）。
export default function ConfirmDeleteModal({
  open,
  title,
  description = 'この操作は元に戻せません。',
  loading = false,
  onCancel,
  onConfirm,
}: {
  open: boolean
  title: string
  description?: string
  loading?: boolean
  onCancel: () => void
  onConfirm: () => void
}) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4" onClick={onCancel}>
      <div
        className="w-full max-w-sm rounded-lg border border-[#23232e] bg-[#14141a] p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="text-sm font-medium text-[#ebe5db]">{title}</p>
        <p className="mt-1.5 text-xs text-[#9a9aa8]">{description}</p>
        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="rounded-md border border-[#2f2f3c] px-4 py-1.5 text-sm text-[#ebe5db] hover:bg-white/5 disabled:opacity-50"
          >
            キャンセル
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="rounded-md bg-red-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-red-500 disabled:opacity-50"
          >
            {loading ? '削除中...' : '削除する'}
          </button>
        </div>
      </div>
    </div>
  )
}
