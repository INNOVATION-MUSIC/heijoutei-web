'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { deleteMedia } from '@/lib/actions/media'

export default function MediaItem({ name, url }: { name: string; url: string }) {
  const router = useRouter()
  const [copied, setCopied] = useState(false)
  const [loading, setLoading] = useState(false)

  async function copy() {
    await navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }
  async function handleDelete() {
    if (!confirm('この画像を削除しますか？')) return
    setLoading(true)
    const res = await deleteMedia(name)
    if (res?.error) { alert(res.error); setLoading(false); return }
    router.refresh()
  }

  return (
    <div className="group overflow-hidden rounded-lg border border-[#23232e] bg-[#14141a]">
      <div className="aspect-square overflow-hidden bg-[#0a0a0f]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={url} alt={name} className="h-full w-full object-cover" />
      </div>
      <div className="flex items-center justify-between gap-1 px-2 py-1.5">
        <button onClick={copy} className="truncate text-xs text-[#9a9aa8] hover:text-[#ebe5db]">
          {copied ? '✓ コピー済' : 'URLをコピー'}
        </button>
        <button onClick={handleDelete} disabled={loading} className="text-xs text-red-400/70 hover:text-red-400 disabled:opacity-50">削除</button>
      </div>
    </div>
  )
}
