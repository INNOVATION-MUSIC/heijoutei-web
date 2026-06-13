'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { adminEmailExists } from '@/lib/actions/auth'

export default function AdminForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    // 前段チェック：未登録メールには送信せず「登録なし」を通知（管理者専用CMSのため許容）
    const exists = await adminEmailExists(email)
    if (!exists) {
      setError('このメールアドレスは登録されていません。')
      setLoading(false)
      return
    }

    // リカバリーリンクの遷移先（callback でセッション交換 → 新パスワード入力画面へ）
    const redirectTo = `${window.location.origin}/auth/callback?next=/admin/reset-password`
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo })

    if (error) {
      // メールアドレスの存在有無は秘匿したいが、明確なエラー（レート制限等）のみ通知
      setError('送信に失敗しました。しばらく時間をおいて再度お試しください。')
      setLoading(false)
      return
    }

    setSent(true)
    setLoading(false)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0a0a0f]">
      <div className="w-full max-w-sm rounded-xl border border-[#23232e] bg-[#14141a] p-8">
        <div className="mb-6 flex flex-col items-center">
          <Image src="/images/logo.webp" alt="焼肉平壌亭" width={168} height={88} className="object-contain" priority />
        </div>

        {sent ? (
          <div className="space-y-4">
            <p className="rounded-lg bg-emerald-900/30 px-4 py-3 text-[13px] leading-relaxed text-emerald-300">
              <span className="block whitespace-nowrap">パスワード再設定用のメールを送信しました。</span>
              メール内のリンクから再設定を行ってください。
            </p>
            <p className="text-xs leading-relaxed text-[#9a9aa8]">
              メールが届かない場合は、迷惑メールフォルダをご確認のうえ、メールアドレスに誤りがないか再度お試しください。
            </p>
            <Link
              href="/admin/login"
              className="block w-full rounded-lg border border-[#2f2f3c] py-2.5 text-center text-sm font-medium text-[#ebe5db] transition-colors hover:border-[#d9b86b] hover:text-[#d9b86b]"
            >
              ログイン画面に戻る
            </Link>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <h1 className="mb-1 text-center text-base font-medium text-[#ebe5db]">パスワードの再設定</h1>
              <p className="text-center text-xs leading-relaxed text-[#9a9aa8]">
                登録済みのメールアドレスを入力してください。
                <br />
                再設定用のリンクをお送りします。
              </p>
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
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-[#d9b86b] py-2.5 font-medium text-[#1a1410] transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                {loading ? '送信中...' : '再設定メールを送信'}
              </button>
            </form>

            <Link
              href="/admin/login"
              className="mt-6 block text-center text-xs text-[#9a9aa8] transition-colors hover:text-[#d9b86b]"
            >
              ログイン画面に戻る
            </Link>
          </>
        )}
      </div>
    </div>
  )
}
