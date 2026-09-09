'use client'

import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

const REMEMBER_KEY = 'admin-remember'
const SESSION_ALIVE_KEY = 'admin-session-alive'

// 管理画面の認証済みブランチに配置。
// 1) マウント時に /auth/refresh を叩き、ローテーション後のセッション cookie を再永続化する
// 2)「ログイン状態を保持する」OFF のとき、ブラウザを閉じて開き直したらログアウトさせる
export default function SessionKeepalive() {
  useEffect(() => {
    let remember = '1'
    let sessionAlive: string | null = null
    try {
      remember = localStorage.getItem(REMEMBER_KEY) ?? '1'
      sessionAlive = sessionStorage.getItem(SESSION_ALIVE_KEY)
    } catch {}

    // 保持しない設定 かつ 新しいブラウザセッション（sessionStorage が空）＝閉じて開き直した
    if (remember === '0' && !sessionAlive) {
      createClient()
        .auth.signOut()
        .finally(() => {
          window.location.reload()
        })
      return
    }

    try {
      sessionStorage.setItem(SESSION_ALIVE_KEY, '1')
    } catch {}

    // セッション cookie を再永続化（best-effort）
    fetch('/auth/refresh', { cache: 'no-store' }).catch(() => {})
  }, [])

  return null
}
