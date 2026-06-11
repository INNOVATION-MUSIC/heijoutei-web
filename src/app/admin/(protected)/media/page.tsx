import { adminSupabase } from '@/lib/supabase/admin'
import MediaUploadButton from '@/components/admin/MediaUploadButton'
import MediaItem from '@/components/admin/MediaItem'

export const dynamic = 'force-dynamic'

export default async function AdminMediaPage() {
  const { data: objects } = await adminSupabase.storage
    .from('media')
    .list('', { limit: 200, sortBy: { column: 'created_at', order: 'desc' } })

  const files = (objects ?? []).filter((o) => o.id !== null) // フォルダを除外

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#ebe5db]">メディア</h1>
          <p className="text-sm text-[#6f6f80]">{files.length} 件のファイル（media バケット）</p>
        </div>
        <MediaUploadButton />
      </div>

      {files.length === 0 ? (
        <p className="rounded-xl border border-[#23232e] bg-[#14141a] px-5 py-10 text-center text-sm text-[#6f6f80]">
          まだ画像がありません。
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {files.map((f) => {
            const { data: { publicUrl } } = adminSupabase.storage.from('media').getPublicUrl(f.name)
            return <MediaItem key={f.name} name={f.name} url={publicUrl} />
          })}
        </div>
      )}
    </div>
  )
}
