'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function AdminLoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError('メールアドレスまたはパスワードが正しくありません')
      setLoading(false)
      return
    }
    router.push('/admin')
    router.refresh()
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0a0a0f]">
      <div className="w-full max-w-sm rounded-xl border border-[#23232e] bg-[#14141a] p-8">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-[#ebe5db]">
            <span className="text-[#d9b86b]">平壌亭</span> CMS
          </h1>
          <p className="mt-1 text-sm text-[#6f6f80]">管理画面ログイン</p>
        </div>

        {error && (
          <p className="mb-4 rounded-lg bg-red-900/30 px-4 py-2 text-sm text-red-400">{error}</p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-[#9a9aa8]">メールアドレス</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-lg border border-[#2f2f3c] bg-[#0a0a0f] px-4 py-2.5 text-[#ebe5db] placeholder-[#3a3a4a] focus:border-[#d9b86b] focus:outline-none focus:ring-1 focus:ring-[#d9b86b]/40"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-[#9a9aa8]">パスワード</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full rounded-lg border border-[#2f2f3c] bg-[#0a0a0f] px-4 py-2.5 text-[#ebe5db] focus:border-[#d9b86b] focus:outline-none focus:ring-1 focus:ring-[#d9b86b]/40"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-[#d9b86b] py-2.5 font-medium text-[#1a1410] transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {loading ? 'ログイン中...' : 'ログイン'}
          </button>
        </form>
      </div>
    </div>
  )
}
