'use client'

import { useState } from 'react'
import AdminSidebar from '@/components/admin/Sidebar'
import AdminTopBar from '@/components/admin/TopBar'

type AdminUser = {
  email: string
  full_name: string | null
  role: string
  avatar_url: string | null
}

export default function AdminShell({
  userRole,
  unreadOrders,
  unreadContacts,
  user,
  children,
}: {
  userRole: string
  unreadOrders: number
  unreadContacts: number
  user: AdminUser
  children: React.ReactNode
}) {
  const [open, setOpen] = useState(false)

  return (
    <div className="flex h-screen bg-[#0d0d12] text-[#ebe5db]">
      {/* モバイル時の暗幕（サイドバー開時のみ） */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
          onClick={() => setOpen(false)}
          aria-hidden
        />
      )}

      <AdminSidebar
        userRole={userRole}
        unreadOrders={unreadOrders}
        unreadContacts={unreadContacts}
        open={open}
        onClose={() => setOpen(false)}
      />

      <div className="flex flex-1 flex-col overflow-hidden">
        <AdminTopBar user={user} onMenuClick={() => setOpen(true)} />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  )
}
