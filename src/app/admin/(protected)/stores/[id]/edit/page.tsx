import Link from 'next/link'
import { notFound } from 'next/navigation'
import { adminSupabase } from '@/lib/supabase/admin'
import StoreForm from '@/components/admin/StoreForm'

export const dynamic = 'force-dynamic'

export default async function EditStorePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { data: store } = await adminSupabase.from('stores').select('*').eq('id', id).single()

  if (!store) notFound()

  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/stores" className="text-xs text-[#6f6f80] hover:text-[#ebe5db]">
          ← 店舗一覧へ
        </Link>
        <h1 className="mt-1 text-2xl font-bold text-[#ebe5db]">店舗を編集：{store.name}</h1>
      </div>
      <StoreForm initial={store} />
    </div>
  )
}
