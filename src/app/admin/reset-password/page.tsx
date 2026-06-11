'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import PasswordInput from '@/components/admin/PasswordInput'

export default function AdminResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [checking, setChecking] = useState(true)
  const [hasSession, setHasSession] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  // リカバリーセッションの有無を確認（callback でセッション交換済みのはず）
  useEffect(() => {
    let active = true
    supabase.auth.getSession().then(({ data }) => {
      if (!active) return
      setHasSession(!!data.session)
      setChecking(false)
    })
    return () => {
      active = false
    }
  }, [supabase])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (password.length < 8) {
      setError('パスワードは8文字以上で入力してください。')
      return
    }
    if (password !== confirm) {
      setError('パスワードが一致しません。')
      return
    }

    setLoading(true)
    const { error } = await supabase.auth.updateUser({ password })
    if (error) {
      // 失敗理由で出し分け（同一パスワード / 強度不足 / それ以外＝リンク失効等）
      if (error.code === 'same_password') {
        setError('現在と同じパスワードは使用できません。別のパスワードを入力してください。')
      } else if (error.code === 'weak_password') {
        setError('パスワードが脆弱です。より複雑なパスワードを入力してください。')
      } else {
        setError('パスワードの更新に失敗しました。リンクの有効期限が切れている可能性があります。')
      }
      setLoading(false)
      return
    }
    setDone(true)
    setLoading(false)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0a0a0f]">
      <div className="w-full max-w-sm rounded-xl border border-[#23232e] bg-[#14141a] p-8">
        <div className="mb-6 flex flex-col items-center">
          <Image src="/images/logo.webp" alt="焼肉平壌亭" width={168} height={88} className="object-contain" priority />
        </div>

        {checking ? (
          <p className="text-center text-sm text-[#9a9aa8]">確認中...</p>
        ) : done ? (
          <div className="space-y-4">
            <p className="rounded-lg bg-emerald-900/30 px-4 py-3 text-sm leading-relaxed text-emerald-300">
              パスワードを変更しました。
            </p>
            <button
              onClick={() => {
                router.push('/admin')
                router.refresh()
              }}
              className="w-full rounded-lg bg-[#d9b86b] py-2.5 font-medium text-[#1a1410] transition-opacity hover:opacity-90"
            >
              管理画面へ
            </button>
          </div>
        ) : !hasSession ? (
          <div className="space-y-4">
            <p className="rounded-lg bg-red-900/30 px-4 py-3 text-sm leading-relaxed text-red-400">
              リンクが無効か、有効期限が切れています。
              <br />
              お手数ですが、再度パスワード再設定をお試しください。
            </p>
            <Link
              href="/admin/forgot-password"
              className="block w-full rounded-lg border border-[#2f2f3c] py-2.5 text-center text-sm font-medium text-[#ebe5db] transition-colors hover:border-[#d9b86b] hover:text-[#d9b86b]"
            >
              パスワード再設定に戻る
            </Link>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <h1 className="mb-1 text-center text-base font-medium text-[#ebe5db]">新しいパスワードの設定</h1>
              <p className="text-center text-xs leading-relaxed text-[#9a9aa8]">
                新しいパスワードを入力してください。
              </p>
            </div>

            {error && (
              <p className="mb-4 rounded-lg bg-red-900/30 px-4 py-2 text-sm text-red-400">{error}</p>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1 block text-xs font-medium text-[#9a9aa8]">新しいパスワード</label>
                <PasswordInput
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                />
                <p className="mt-1 text-[11px] text-[#6b6b78]">8文字以上で入力してください。</p>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-[#9a9aa8]">新しいパスワード（確認）</label>
                <PasswordInput
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  required
                  autoComplete="new-password"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-[#d9b86b] py-2.5 font-medium text-[#1a1410] transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                {loading ? '更新中...' : 'パスワードを変更'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
