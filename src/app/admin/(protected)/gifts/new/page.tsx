import Link from 'next/link'
import GiftForm from '@/components/admin/GiftForm'

export const dynamic = 'force-dynamic'

export default function NewGiftPage() {
  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/gifts" className="text-xs text-[#6f6f80] hover:text-[#ebe5db]">← ギフト一覧へ</Link>
        <h1 className="mt-1 text-2xl font-bold text-[#ebe5db]">新規ギフト</h1>
      </div>
      <GiftForm />
    </div>
  )
}
