'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createUser } from '@/lib/actions/users'

const inputClass =
  'w-full rounded-lg border border-[#2f2f3c] bg-[#0a0a0f] px-3 py-2 text-sm text-[#ebe5db] focus:border-[#d9b86b] focus:outline-none'
const labelClass = 'mb-1.5 block text-xs font-medium text-[#9a9aa8]'

export default function UserCreateForm() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [role, setRole] = useState('editor')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    const res = await createUser({ email, password, full_name: fullName, role })
    if (res?.error) { setError(res.error); setSaving(false); return }
    router.push('/admin/users')
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-lg space-y-4 rounded-xl border border-[#23232e] bg-[#14141a] p-5">
      {error && <div className="rounded-lg border border-red-800/50 bg-red-900/20 px-4 py-2.5 text-sm text-red-400">{error}</div>}
      <div>
        <label className={labelClass}>メールアドレス *</label>
        <input type="email" className={inputClass} value={email} onChange={(e) => setEmail(e.target.value)} required />
      </div>
      <div>
        <label className={labelClass}>パスワード *（8文字以上）</label>
        <input type="password" className={inputClass} value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} />
      </div>
      <div>
        <label className={labelClass}>氏名</label>
        <input className={inputClass} value={fullName} onChange={(e) => setFullName(e.target.value)} />
      </div>
      <div>
        <label className={labelClass}>ロール</label>
        <select className={inputClass} value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="editor">編集者</option>
          <option value="admin">管理者</option>
        </select>
      </div>
      <div className="flex gap-2">
        <button type="submit" disabled={saving} className="rounded-lg bg-[#d9b86b] px-4 py-2 text-sm font-medium text-[#1a1410] hover:opacity-90 disabled:opacity-50">
          {saving ? '作成中...' : 'ユーザーを作成'}
        </button>
        <button type="button" onClick={() => router.push('/admin/users')} className="rounded-lg border border-[#2f2f3c] px-4 py-2 text-sm text-[#9a9aa8] hover:text-[#ebe5db]">キャンセル</button>
      </div>
    </form>
  )
}
