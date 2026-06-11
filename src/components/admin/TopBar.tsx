'use client'

import { signOut } from '@/lib/actions/auth'

type AdminUser = {
  email: string
  full_name: string | null
  role: string
  avatar_url: string | null
}

export default function AdminTopBar({ user }: { user: AdminUser }) {
  const initial = (user.full_name || user.email || '?').charAt(0).toUpperCase()

  return (
    <header className="flex h-16 flex-shrink-0 items-center justify-between border-b border-[#23232e] bg-[#14141a] px-6">
      <a
        href="/"
        target="_blank"
        rel="noopener noreferrer"
        className="text-xs text-[#9a9aa8] transition-colors hover:text-[#ebe5db]"
      >
        ↗ サイトを表示
      </a>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#d9b86b]/20 text-sm font-bold text-[#d9b86b]">
            {initial}
          </div>
          <div className="text-right leading-tight">
            <p className="text-sm text-[#ebe5db]">{user.full_name || user.email}</p>
            <p className="text-[10px] text-[#6f6f80]">
              {user.role === 'admin' ? '管理者' : '編集者'}
            </p>
          </div>
        </div>
        <form action={signOut}>
          <button
            type="submit"
            className="rounded-lg border border-[#2f2f3c] px-3 py-1.5 text-xs text-[#9a9aa8] transition-colors hover:border-[#d9b86b]/40 hover:text-[#ebe5db]"
          >
            ログアウト
          </button>
        </form>
      </div>
    </header>
  )
}
