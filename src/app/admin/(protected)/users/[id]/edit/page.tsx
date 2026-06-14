import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getUser } from '@/lib/actions/users'
import UserEditForm from '@/components/admin/UserEditForm'

export const dynamic = 'force-dynamic'

export default async function EditUserPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  // getUser は内部で requireAdmin。管理者以外・存在しない場合は null。
  const user = await getUser(id)
  if (!user) notFound()

  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/users" className="text-xs text-[#6f6f80] hover:text-[#ebe5db]">← ユーザー一覧へ</Link>
        <h1 className="mt-1 text-2xl font-bold text-[#ebe5db]">スタッフを編集</h1>
      </div>
      <UserEditForm user={user} />
    </div>
  )
}
