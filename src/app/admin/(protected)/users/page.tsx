import Link from 'next/link'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { adminSupabase } from '@/lib/supabase/admin'
import { getUsers } from '@/lib/actions/users'
import UserRoleSelect from '@/components/admin/UserRoleSelect'
import UserAvatarCell from '@/components/admin/UserAvatarCell'

export const dynamic = 'force-dynamic'

export default async function AdminUsersPage() {
  // admin ロールのみアクセス可
  const cookieStore = await cookies()
  const loggedIn = cookieStore.getAll().some((c) => c.name.startsWith('sb-') && c.name.endsWith('-auth-token'))
  if (!loggedIn) redirect('/admin/login')
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  const { data: me } = await adminSupabase.from('profiles').select('role').eq('id', session?.user?.id ?? '').single()
  if (me?.role !== 'admin') {
    return (
      <p className="rounded-lg border border-red-800/50 bg-red-900/20 px-4 py-3 text-sm text-red-400">
        このページは管理者のみアクセスできます。
      </p>
    )
  }

  const users = await getUsers()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#ebe5db]">ユーザー管理</h1>
          <p className="text-sm text-[#6f6f80]">全 {users.length} 名</p>
        </div>
        <Link href="/admin/users/new" className="inline-flex items-center gap-2 rounded-lg bg-[#d9b86b] px-4 py-2 text-sm font-medium text-[#1a1410] hover:opacity-90">
          ＋ ユーザー追加
        </Link>
      </div>

      <div className="overflow-hidden rounded-xl border border-[#23232e] bg-[#14141a]">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#23232e] bg-[#1a1a22] text-left text-xs text-[#6f6f80]">
              <th className="w-20 px-4 py-3 font-medium">アイコン</th>
              <th className="px-4 py-3 font-medium">メール</th>
              <th className="px-4 py-3 font-medium">氏名</th>
              <th className="px-4 py-3 font-medium">作成日</th>
              <th className="px-4 py-3 text-right font-medium">ロール / 操作</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b border-[#1d1d26] last:border-0 hover:bg-white/[0.02]">
                <td className="px-4 py-3"><UserAvatarCell id={u.id} avatarUrl={u.avatar_url} /></td>
                <td className="px-4 py-3 text-[#ebe5db]">{u.email}</td>
                <td className="px-4 py-3 text-[#9a9aa8]">{u.full_name ?? '—'}</td>
                <td className="px-4 py-3 text-[#9a9aa8]">{u.created_at ? new Date(u.created_at).toLocaleDateString('ja-JP') : '—'}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-3">
                    <Link href={`/admin/users/${u.id}/edit`} className="text-xs text-[#d9b86b] hover:underline">編集</Link>
                    <UserRoleSelect id={u.id} role={u.role} email={u.email} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
