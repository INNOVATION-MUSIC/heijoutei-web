import Link from 'next/link'
import { getStoreRefs } from '@/lib/actions/refs'
import UserCreateForm from '@/components/admin/UserCreateForm'

export const dynamic = 'force-dynamic'

export default async function NewUserPage() {
  const stores = await getStoreRefs()
  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/users" className="text-xs text-[#6f6f80] hover:text-[#ebe5db]">← ユーザー一覧へ</Link>
        <h1 className="mt-1 text-2xl font-bold text-[#ebe5db]">ユーザー追加</h1>
      </div>
      <UserCreateForm stores={stores.map((s) => ({ id: s.id, name: s.name }))} />
    </div>
  )
}
