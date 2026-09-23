'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { updateUserRole, deleteUser } from '@/lib/actions/users'
import DeleteButton from './DeleteButton'

export default function UserRoleSelect({ id, role, email }: { id: string; role: string; email: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function changeRole(r: string) {
    setLoading(true)
    const res = await updateUserRole(id, r)
    if (res?.error) alert(res.error)
    setLoading(false)
    router.refresh()
  }

  return (
    <div className="flex items-center justify-end gap-3">
      <select value={role} onChange={(e) => changeRole(e.target.value)} disabled={loading} className="rounded-md border border-[#2f2f3c] bg-[#0a0a0f] px-2 py-1 text-xs text-[#ebe5db] disabled:opacity-50">
        <option value="editor">編集者</option>
        <option value="admin">管理者</option>
      </select>
      <DeleteButton confirmTitle={`「${email}」を削除しますか？`} onDelete={() => deleteUser(id)} />
    </div>
  )
}
