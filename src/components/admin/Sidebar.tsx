'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

type NavItem = { href: string; label: string; icon: string; badge?: number; adminOnly?: boolean }
type NavGroup = { title: string; items: NavItem[] }

// 白(currentColor)モノクロのラインアイコン。emoji を廃し見た目を統一する。
const ICON_PATHS: Record<string, React.ReactNode> = {
  home: (
    <>
      <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <path d="M9 22V12h6v10" />
    </>
  ),
  news: (
    <>
      <path d="M4 22h14a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2" />
      <path d="M16 6h-6v4h6V6Z" />
      <path d="M16 14h-6" />
      <path d="M13 18h-3" />
    </>
  ),
  store: (
    <>
      <path d="M4 9v10a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1V9" />
      <path d="m2 9 2.5-5h15L22 9" />
      <path d="M2 9h20" />
      <path d="M9 20v-6h6v6" />
    </>
  ),
  menu: (
    <>
      <path d="M3 2v7c0 1.1.9 2 2 2h0a2 2 0 0 0 2-2V2" />
      <path d="M7 2v20" />
      <path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" />
    </>
  ),
  course: (
    <>
      <path d="m16 2-2.3 2.3a3 3 0 0 0 0 4.2l1.8 1.8a3 3 0 0 0 4.2 0L22 8" />
      <path d="M15 15 3.3 3.3a4.2 4.2 0 0 0 0 6l7.3 7.3c.7.7 2 .7 2.8 0L15 15Zm0 0 7 7" />
      <path d="m2.1 21.8 6.4-6.3" />
      <path d="m19 5-7 7" />
    </>
  ),
  lunch: (
    <>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2" />
      <path d="M12 20v2" />
      <path d="m4.93 4.93 1.41 1.41" />
      <path d="m17.66 17.66 1.41 1.41" />
      <path d="M2 12h2" />
      <path d="M20 12h2" />
      <path d="m6.34 17.66-1.41 1.41" />
      <path d="m19.07 4.93-1.41 1.41" />
    </>
  ),
  calendar: (
    <>
      <rect width="18" height="18" x="3" y="4" rx="2" />
      <path d="M3 10h18" />
      <path d="M8 2v4" />
      <path d="M16 2v4" />
    </>
  ),
  bag: (
    <>
      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
      <path d="M3 6h18" />
      <path d="M16 10a4 4 0 0 1-8 0" />
    </>
  ),
  'calendar-days': (
    <>
      <rect width="18" height="18" x="3" y="4" rx="2" />
      <path d="M3 10h18" />
      <path d="M8 2v4" />
      <path d="M16 2v4" />
      <path d="M8 14h.01" />
      <path d="M12 14h.01" />
      <path d="M16 14h.01" />
      <path d="M8 18h.01" />
      <path d="M12 18h.01" />
    </>
  ),
  package: (
    <>
      <path d="M11 21.73a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73z" />
      <path d="M12 22V12" />
      <path d="m3.3 7 8.7 5 8.7-5" />
      <path d="m7.5 4.27 9 5.15" />
    </>
  ),
  gift: (
    <>
      <rect x="3" y="8" width="18" height="4" rx="1" />
      <path d="M12 8v13" />
      <path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7" />
      <path d="M7.5 8a2.5 2.5 0 0 1 0-5A4.8 8 0 0 1 12 8a4.8 8 0 0 1 4.5-5 2.5 2.5 0 0 1 0 5" />
    </>
  ),
  recruit: (
    <>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <line x1="19" x2="19" y1="8" y2="14" />
      <line x1="22" x2="16" y1="11" y2="11" />
    </>
  ),
  mail: (
    <>
      <rect width="20" height="16" x="2" y="4" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </>
  ),
  tag: (
    <>
      <path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z" />
      <circle cx="7.5" cy="7.5" r=".5" fill="currentColor" />
    </>
  ),
  image: (
    <>
      <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
      <circle cx="9" cy="9" r="2" />
      <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
    </>
  ),
  users: (
    <>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </>
  ),
}

function NavIcon({ name }: { name: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="flex-shrink-0"
      aria-hidden="true"
    >
      {ICON_PATHS[name]}
    </svg>
  )
}

export default function AdminSidebar({
  userRole,
  unreadOrders = 0,
  unreadContacts = 0,
  open = false,
  onClose,
}: {
  userRole: string
  unreadOrders?: number
  unreadContacts?: number
  open?: boolean
  onClose?: () => void
}) {
  const pathname = usePathname()

  const groups: NavGroup[] = [
    {
      title: 'メイン',
      items: [{ href: '/admin', label: 'ダッシュボード', icon: 'home' }],
    },
    {
      title: 'コンテンツ',
      items: [
        { href: '/admin/news', label: 'お知らせ', icon: 'news' },
        { href: '/admin/stores', label: '店舗', icon: 'store' },
        { href: '/admin/menus', label: 'メニュー', icon: 'menu' },
        { href: '/admin/lunch', label: 'ランチ', icon: 'lunch' },
        { href: '/admin/courses', label: 'コース', icon: 'course' },
        { href: '/admin/gifts', label: 'ギフト', icon: 'gift' },
        { href: '/admin/business-calendar', label: '営業カレンダー', icon: 'calendar' },
      ],
    },
    {
      title: 'テイクアウト',
      items: [
        { href: '/admin/takeout-menus', label: 'テイクアウトメニュー', icon: 'bag' },
        { href: '/admin/takeout-slots', label: '受付枠管理', icon: 'calendar-days' },
        { href: '/admin/takeout-orders', label: '注文受付', icon: 'package', badge: unreadOrders },
      ],
    },
    {
      title: '採用・問い合わせ',
      items: [
        { href: '/admin/recruitments', label: '採用情報', icon: 'recruit' },
        { href: '/admin/contact', label: 'お問い合わせ', icon: 'mail', badge: unreadContacts },
      ],
    },
    {
      title: 'システム',
      items: [
        { href: '/admin/settings/categories', label: 'カテゴリ管理', icon: 'tag' },
        { href: '/admin/media', label: 'メディア', icon: 'image' },
        { href: '/admin/users', label: 'ユーザー管理', icon: 'users', adminOnly: true },
      ],
    },
  ]

  function isActive(href: string): boolean {
    if (href === '/admin') return pathname === '/admin'
    return pathname === href || pathname.startsWith(href + '/')
  }

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-50 flex w-60 flex-shrink-0 transform flex-col overflow-y-auto border-r border-[#23232e] bg-[#14141a] transition-transform duration-300 lg:static lg:z-auto lg:translate-x-0 ${
        open ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      <Link
        href="/admin"
        onClick={onClose}
        className="flex h-16 flex-shrink-0 items-center justify-center border-b border-[#23232e] px-5"
      >
        <Image src="/images/logo.webp" alt="焼肉平壌亭" width={104} height={54} className="object-contain" priority />
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
                        onClick={onClose}
                        className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors ${
                          active
                            ? 'border-l-2 border-[#d9b86b] bg-[#d9b86b]/10 font-medium text-[#ebe5db]'
                            : 'text-[#9a9aa8] hover:bg-white/5 hover:text-[#ebe5db]'
                        }`}
                      >
                        <NavIcon name={item.icon} />
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
