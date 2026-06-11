import Link from 'next/link'
import StoreForm from '@/components/admin/StoreForm'

export const dynamic = 'force-dynamic'

export default function NewStorePage() {
  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/stores" className="text-xs text-[#6f6f80] hover:text-[#ebe5db]">
          ← 店舗一覧へ
        </Link>
        <h1 className="mt-1 text-2xl font-bold text-[#ebe5db]">新規店舗</h1>
      </div>
      <StoreForm />
    </div>
  )
}
