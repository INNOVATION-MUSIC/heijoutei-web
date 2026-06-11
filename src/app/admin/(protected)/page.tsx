import Link from 'next/link'
import { adminSupabase } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

function StatCard({ label, value, href }: { label: string; value: number | string; href?: string }) {
  const inner = (
    <div className="rounded-xl border border-[#23232e] bg-[#14141a] p-5 transition-colors hover:border-[#d9b86b]/30">
      <p className="text-xs text-[#6f6f80]">{label}</p>
      <p className="mt-2 text-3xl font-bold text-[#ebe5db]">{value}</p>
    </div>
  )
  return href ? <Link href={href}>{inner}</Link> : inner
}

export default async function AdminDashboard() {
  const today = new Date().toISOString().slice(0, 10)

  const [
    { count: publishedNews },
    { count: storeCount },
    { count: unreadOrders },
    { count: unreadContacts },
    { data: todayOrderRows },
    { data: recentOrders },
    { data: recentContacts },
    { data: recentNews },
  ] = await Promise.all([
    adminSupabase.from('news').select('id', { count: 'exact', head: true }).eq('is_published', true),
    adminSupabase.from('stores').select('id', { count: 'exact', head: true }).eq('is_active', true),
    adminSupabase.from('takeout_orders').select('id', { count: 'exact', head: true }).eq('is_read', false),
    adminSupabase.from('contact_messages').select('id', { count: 'exact', head: true }).eq('is_read', false),
    adminSupabase.from('takeout_orders').select('total_price').eq('pickup_date', today),
    adminSupabase.from('takeout_orders').select('id, customer_name, total_price, pickup_date, is_read, created_at').order('created_at', { ascending: false }).limit(5),
    adminSupabase.from('contact_messages').select('id, name, subject, is_read, created_at').order('created_at', { ascending: false }).limit(3),
    adminSupabase.from('news').select('id, title, is_published, published_at, news_tags(label, color, sort_order)').order('created_at', { ascending: false }).limit(5),
  ])

  const todayTotal = (todayOrderRows ?? []).reduce((sum, o) => sum + o.total_price, 0)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-[#ebe5db]">ダッシュボード</h1>
        <p className="mt-1 text-sm text-[#6f6f80]">平壌亭 CMS 管理画面</p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        <StatCard label="未読の注文" value={unreadOrders ?? 0} href="/admin/takeout-orders" />
        <StatCard label={`本日の注文 / 合計`} value={`${(todayOrderRows ?? []).length}件 ${todayTotal.toLocaleString('ja-JP')}円`} href="/admin/takeout-orders" />
        <StatCard label="未読の問い合わせ" value={unreadContacts ?? 0} href="/admin/contact" />
        <StatCard label="公開中のお知らせ" value={publishedNews ?? 0} href="/admin/news" />
        <StatCard label="公開中の店舗" value={storeCount ?? 0} href="/admin/stores" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* 最新の注文 */}
        <div className="rounded-xl border border-[#23232e] bg-[#14141a] p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-[#ebe5db]">最新の注文</h2>
            <Link href="/admin/takeout-orders" className="text-xs text-[#d9b86b] hover:underline">すべて見る</Link>
          </div>
          <ul className="space-y-2">
            {(recentOrders ?? []).map((o) => (
              <li key={o.id} className="flex items-center gap-2 text-sm">
                {!o.is_read && <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />}
                <span className="flex-1 truncate text-[#ebe5db]">{o.customer_name} 様</span>
                <span className="text-xs text-[#9a9aa8]">{o.pickup_date} ・ {o.total_price.toLocaleString('ja-JP')}円</span>
              </li>
            ))}
            {(!recentOrders || recentOrders.length === 0) && <li className="text-sm text-[#6f6f80]">注文はまだありません</li>}
          </ul>
        </div>

        {/* 未読の問い合わせ */}
        <div className="rounded-xl border border-[#23232e] bg-[#14141a] p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-[#ebe5db]">最新の問い合わせ</h2>
            <Link href="/admin/contact" className="text-xs text-[#d9b86b] hover:underline">すべて見る</Link>
          </div>
          <ul className="space-y-2">
            {(recentContacts ?? []).map((c) => (
              <li key={c.id} className="flex items-center gap-2 text-sm">
                {!c.is_read && <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />}
                <span className="flex-1 truncate text-[#ebe5db]">{c.name}</span>
                <span className="truncate text-xs text-[#9a9aa8]">{c.subject ?? ''}</span>
              </li>
            ))}
            {(!recentContacts || recentContacts.length === 0) && <li className="text-sm text-[#6f6f80]">問い合わせはまだありません</li>}
          </ul>
        </div>
      </div>

      {/* 最近のお知らせ */}
      <div className="rounded-xl border border-[#23232e] bg-[#14141a] p-5">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-[#ebe5db]">最近のお知らせ</h2>
          <Link href="/admin/news" className="text-xs text-[#d9b86b] hover:underline">すべて見る</Link>
        </div>
        <ul className="space-y-1">
          {(recentNews ?? []).map((n) => {
            const tags = [...(n.news_tags ?? [])].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
            const publishedDate = n.published_at
              ? new Date(n.published_at).toLocaleDateString('ja-JP', { timeZone: 'Asia/Tokyo', year: 'numeric', month: '2-digit', day: '2-digit' })
              : null
            return (
              <li key={n.id}>
                <Link
                  href={`/admin/news/${n.id}/edit`}
                  className="flex items-center gap-3 rounded-lg px-2 py-1.5 text-sm transition-colors hover:bg-white/5"
                >
                  <span className="w-[88px] shrink-0 text-xs text-[#9a9aa8]">{publishedDate ?? '—'}</span>
                  <span className="w-16 shrink-0">
                    {n.is_published ? (
                      <span className="rounded-full bg-green-900/30 px-2 py-0.5 text-xs text-green-400">公開</span>
                    ) : (
                      <span className="rounded-full bg-yellow-900/30 px-2 py-0.5 text-xs text-yellow-400">下書き</span>
                    )}
                  </span>
                  {/* タグ列は固定幅。タグが無い行でも幅を確保してタイトル左端を揃える */}
                  <span className="hidden w-28 shrink-0 items-center gap-1 overflow-hidden sm:flex">
                    {tags.map((t) => (
                      <span
                        key={t.label}
                        className="shrink-0 rounded px-1.5 py-0.5 text-[10px] leading-none"
                        style={{ color: t.color, border: `1px solid ${t.color}55` }}
                      >
                        {t.label}
                      </span>
                    ))}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-[#ebe5db]">{n.title}</span>
                </Link>
              </li>
            )
          })}
          {(!recentNews || recentNews.length === 0) && <li className="text-sm text-[#6f6f80]">お知らせはまだありません</li>}
        </ul>
      </div>
    </div>
  )
}
