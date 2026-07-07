import Link from 'next/link'
import { notFound } from 'next/navigation'
import { adminSupabase } from '@/lib/supabase/admin'
import GiftForm from '@/components/admin/GiftForm'

export const dynamic = 'force-dynamic'

export default async function EditGiftPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { data: gift } = await adminSupabase.from('gift_products').select('*').eq('id', id).single()
  if (!gift) notFound()

  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/gifts" className="text-xs text-[#6f6f80] hover:text-[#ebe5db]">← ギフト一覧へ</Link>
        <h1 className="mt-1 text-2xl font-bold text-[#ebe5db]">ギフトを編集：{gift.title}</h1>
      </div>
      <GiftForm initial={gift} />
    </div>
  )
}
