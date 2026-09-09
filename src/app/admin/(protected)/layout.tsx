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

  let profile: { full_name: string | null; role: string; avatar_url: string | null; store_ids: string[] | null } | null = null
  {
    const { data } = await adminSupabase
      .from('profiles')
      .select('full_name, role, avatar_url, store_ids')
      .eq('id', user.id)
      .single()
    profile = data
  }

  // 店舗スコープ: admin か store_ids 未設定は全店（null）。指定ありの editor はその店舗のみ。
  const role = profile?.role ?? 'editor'
  const assigned = profile?.store_ids ?? null
  const scopedStoreIds = role === 'admin' || !assigned || assigned.length === 0 ? null : assigned
  const isHq = scopedStoreIds === null

  let storeNames: string[] = []
  if (!isHq) {
    const { data: rows } = await adminSupabase
      .from('stores')
      .select('name')
      .in('id', scopedStoreIds)
      .order('sort_order')
    storeNames = (rows ?? []).map((r) => r.name)
  }

  // 未読バッジ（注文受付・お問い合わせ）。店舗スタッフは担当店舗分のみ数える。
  const ordersQ = adminSupabase.from('takeout_orders').select('id', { count: 'exact', head: true }).eq('is_read', false)
  const contactsQ = adminSupabase.from('contact_messages').select('id', { count: 'exact', head: true }).eq('is_read', false)
  if (!isHq) {
    ordersQ.in('store_id', scopedStoreIds)
    contactsQ.in('store_id', scopedStoreIds)
  }
  const [{ count: unreadOrders }, { count: unreadContacts }] = await Promise.all([ordersQ, contactsQ])

  return (
    <AdminShell
      userRole={role}
      unreadOrders={unreadOrders ?? 0}
      unreadContacts={unreadContacts ?? 0}
      isHq={isHq}
      storeNames={storeNames}
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
