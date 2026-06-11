'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

type NavItem = { href: string; label: string; icon: string; badge?: number; adminOnly?: boolean }
type NavGroup = { title: string; items: NavItem[] }

export default function AdminSidebar({
  userRole,
  unreadOrders = 0,
  unreadContacts = 0,
}: {
  userRole: string
  unreadOrders?: number
  unreadContacts?: number
}) {
  const pathname = usePathname()

  const groups: NavGroup[] = [
    {
      title: 'メイン',
      items: [{ href: '/admin', label: 'ダッシュボード', icon: '🏠' }],
    },
    {
      title: 'コンテンツ',
      items: [
        { href: '/admin/news', label: 'お知らせ', icon: '📰' },
        { href: '/admin/stores', label: '店舗', icon: '🏬' },
        { href: '/admin/menus', label: 'メニュー', icon: '🍽️' },
        { href: '/admin/courses', label: 'コース', icon: '🥩' },
        { href: '/admin/business-calendar', label: '営業カレンダー', icon: '📅' },
      ],
    },
    {
      title: 'テイクアウト',
      items: [
        { href: '/admin/takeout-menus', label: 'テイクアウトメニュー', icon: '🍱' },
        { href: '/admin/takeout-slots', label: '受付枠管理', icon: '🗓️' },
        { href: '/admin/takeout-orders', label: '注文受付', icon: '📦', badge: unreadOrders },
      ],
    },
    {
      title: '採用・問い合わせ',
      items: [
        { href: '/admin/recruitments', label: '採用情報', icon: '🧑‍🍳' },
        { href: '/admin/contact', label: 'お問い合わせ', icon: '📧', badge: unreadContacts },
      ],
    },
    {
      title: 'システム',
      items: [
        { href: '/admin/settings/categories', label: 'カテゴリ管理', icon: '🏷️' },
        { href: '/admin/media', label: 'メディア', icon: '🖼️' },
        { href: '/admin/users', label: 'ユーザー管理', icon: '👥', adminOnly: true },
      ],
    },
  ]

  function isActive(href: string): boolean {
    if (href === '/admin') return pathname === '/admin'
    return pathname === href || pathname.startsWith(href + '/')
  }

  return (
    <aside className="flex w-60 flex-shrink-0 flex-col overflow-y-auto border-r border-[#23232e] bg-[#14141a]">
      <Link href="/admin" className="flex h-16 flex-shrink-0 items-center gap-2 border-b border-[#23232e] px-5">
        <span className="text-base font-bold tracking-wide text-[#d9b86b]">平壌亭</span>
        <span className="text-xs text-[#6f6f80]">CMS</span>
      </Link>

      <nav className="flex-1 px-3 py-4">
        {groups.map((group) => (
          <div key={group.title} className="mb-5">
            <p className="mb-1.5 px-3 text-[10px] font-semibold uppercase tracking-wider text-[#5a5a6a]">
              {group.title}
            </p>
            <ul className="space-y-0.5">
              {group.items
                .filter((item) => !item.adminOnly || userRole === 'admin')
                .map((item) => {
                  const active = isActive(item.href)
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors ${
                          active
                            ? 'border-l-2 border-[#d9b86b] bg-[#d9b86b]/10 font-medium text-[#ebe5db]'
                            : 'text-[#9a9aa8] hover:bg-white/5 hover:text-[#ebe5db]'
                        }`}
                      >
                        <span className="text-base leading-none">{item.icon}</span>
                        <span className="flex-1 truncate">{item.label}</span>
                        {item.badge ? (
                          <span className="rounded-full bg-[#3b82f6] px-1.5 py-0.5 text-[10px] font-bold leading-none text-white">
                            {item.badge}
                          </span>
                        ) : null}
                      </Link>
                    </li>
                  )
                })}
            </ul>
          </div>
        ))}
      </nav>
    </aside>
  )
}
