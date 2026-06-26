'use client'

// 編集の更新成功時に「更新しました」を表示する共通バナー（一覧へ遷移せず詳細画面に留まる）
export default function SaveSuccessBanner({ show, className = '' }: { show: boolean; className?: string }) {
  if (!show) return null
  return (
    <div
      className={`flex items-start gap-3 rounded-lg border border-emerald-800/50 bg-emerald-900/20 px-4 py-3 ${className}`}
      role="status"
    >
      <span className="mt-0.5 text-emerald-400">✓</span>
      <p className="text-sm text-emerald-400">更新しました</p>
    </div>
  )
}
