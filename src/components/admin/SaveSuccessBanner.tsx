'use client'

import Link from 'next/link'

// 編集の更新成功時に「更新しました」を表示する共通バナー（一覧へ遷移せず詳細画面に留まる）。
// backHref を渡すと「一覧に戻る」ボタンを表示する（保存後に一覧へ戻りやすくする）。
export default function SaveSuccessBanner({
  show,
  className = '',
  backHref,
  backLabel = '一覧に戻る',
}: {
  show: boolean
  className?: string
  backHref?: string
  backLabel?: string
}) {
  if (!show) return null
  return (
    <div
      className={`flex flex-wrap items-center justify-between gap-3 rounded-lg border border-emerald-800/50 bg-emerald-900/20 px-4 py-3 ${className}`}
      role="status"
    >
      <div className="flex items-start gap-3">
        <span className="mt-0.5 text-emerald-400">✓</span>
        <p className="text-sm text-emerald-400">更新しました</p>
      </div>
      {backHref && (
        <Link
          href={backHref}
          className="shrink-0 rounded-lg bg-[#d9b86b] px-4 py-1.5 text-sm font-medium text-[#1a1410] hover:opacity-90"
        >
          {backLabel}
        </Link>
      )}
    </div>
  )
}
