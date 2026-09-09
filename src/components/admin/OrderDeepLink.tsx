'use client'

import { useEffect } from 'react'

// メールの「管理画面で詳細を見る」(?order=<id>) で開いたとき、対象の注文カードまで
// スクロールして一時的にゴールドのリングで強調する。対象が一覧に無ければ何もしない。
export default function OrderDeepLink({ targetId }: { targetId?: string }) {
  useEffect(() => {
    if (!targetId) return
    const el = document.getElementById(`order-${targetId}`)
    if (!el) return
    el.scrollIntoView({ behavior: 'smooth', block: 'center' })
    el.classList.add('ring-2', 'ring-[#d9b86b]', 'ring-offset-2', 'ring-offset-[#0d0d12]')
    const t = setTimeout(() => {
      el.classList.remove('ring-2', 'ring-[#d9b86b]', 'ring-offset-2', 'ring-offset-[#0d0d12]')
    }, 2500)
    return () => clearTimeout(t)
  }, [targetId])

  return null
}
