import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { adminSupabase } from '@/lib/supabase/admin'
import AdminShell from '@/components/admin/AdminShell'

export const dynamic = 'force-dynamic'

export default async function AdminProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // getUser() で Auth サーバにトークンを検証（署名・期限・失効）。
  // 期限切れトークンは middleware（updateSession）で更新されるため getUser は安定動作する。
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/admin/login') // /admin/login は (protected) 外なので無限ループにならない
  }

  let profile: { full_name: string | null; role: string; avatar_url: string | null } | null = null
  {
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
    <AdminShell
      userRole={profile?.role ?? 'editor'}
      unreadOrders={unreadOrders ?? 0}
      unreadContacts={unreadContacts ?? 0}
      user={{
        email: user?.email ?? '',
        full_name: profile?.full_name ?? null,
        role: profile?.role ?? 'editor',
        avatar_url: profile?.avatar_url ?? null,
      }}
    >
      {children}
    </AdminShell>
  )
}
