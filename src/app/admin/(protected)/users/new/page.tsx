import Link from 'next/link'
import UserCreateForm from '@/components/admin/UserCreateForm'

export const dynamic = 'force-dynamic'

export default function NewUserPage() {
  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/users" className="text-xs text-[#6f6f80] hover:text-[#ebe5db]">← ユーザー一覧へ</Link>
        <h1 className="mt-1 text-2xl font-bold text-[#ebe5db]">ユーザー追加</h1>
      </div>
      <UserCreateForm />
    </div>
  )
}
