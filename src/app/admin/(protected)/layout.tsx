import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { adminSupabase } from '@/lib/supabase/admin'
import AdminSidebar from '@/components/admin/Sidebar'
import AdminTopBar from '@/components/admin/TopBar'

export const dynamic = 'force-dynamic'

export default async function AdminProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // クッキーベースの認証チェック（getUser() は環境によってネットワーク呼び出しで失敗しうるため使わない）
  const cookieStore = await cookies()
  const isLoggedIn = cookieStore
    .getAll()
    .some((c) => c.name.startsWith('sb-') && c.name.endsWith('-auth-token'))

  if (!isLoggedIn) {
    redirect('/admin/login') // /admin/login は (protected) 外なので無限ループにならない
  }

  // プロフィール取得
  const supabase = await createClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()
  const user = session?.user

  let profile: { full_name: string | null; role: string; avatar_url: string | null } | null = null
  if (user) {
    const { data } = await adminSupabase
      .from('profiles')
      .select('full_name, role, avatar_url')
      .eq('id', user.id)
      .single()
    profile = data
  }

  // 未読バッジ（注文受付・お問い合わせ）
  const [{ count: unreadOrders }, { count: unreadContacts }] = await Promise.all([
    adminSupabase.from('takeout_orders').select('id', { count: 'exact', head: true }).eq('is_read', false),
    adminSupabase.from('contact_messages').select('id', { count: 'exact', head: true }).eq('is_read', false),
  ])

  return (
    <div className="flex h-screen bg-[#0d0d12] text-[#ebe5db]">
      <AdminSidebar
        userRole={profile?.role ?? 'editor'}
        unreadOrders={unreadOrders ?? 0}
        unreadContacts={unreadContacts ?? 0}
      />
      <div className="flex flex-1 flex-col overflow-hidden">
        <AdminTopBar
          user={{
            email: user?.email ?? '',
            full_name: profile?.full_name ?? null,
            role: profile?.role ?? 'editor',
            avatar_url: profile?.avatar_url ?? null,
          }}
        />
        <main className="flex-1 overflow-y-auto p-6 lg:p-8">{children}</main>
      </div>
    </div>
  )
}
