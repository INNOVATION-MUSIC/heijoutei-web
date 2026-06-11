'use client'

import { useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Props {
  value: string[]
  onChange: (urls: string[]) => void
  label?: string
}

// 複数画像（ギャラリー）。ブラウザから直接 Supabase Storage へアップロードし、URL 配列を管理する。
export default function GalleryUploader({ value, onChange, label = 'ギャラリー画像' }: Props) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  async function handleFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    if (files.length === 0) return
    setUploading(true)
    setError(null)
    const supabase = createClient()
    const uploaded: string[] = []
    try {
      for (const file of files) {
        const ext = file.name.split('.').pop()
        const filename = `${crypto.randomUUID()}.${ext}`
        const { data, error } = await supabase.storage
          .from('media')
          .upload(filename, file, { contentType: file.type, upsert: false })
        if (error) {
          setError(`アップロード失敗: ${error.message}`)
          continue
        }
        const {
          data: { publicUrl },
        } = supabase.storage.from('media').getPublicUrl(data.path)
        uploaded.push(publicUrl)
      }
      if (uploaded.length) onChange([...value, ...uploaded])
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  function remove(idx: number) {
    onChange(value.filter((_, i) => i !== idx))
  }

  function move(idx: number, dir: -1 | 1) {
    const next = [...value]
    const target = idx + dir
    if (target < 0 || target >= next.length) return
    ;[next[idx], next[target]] = [next[target], next[idx]]
    onChange(next)
  }

  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-[#9a9aa8]">{label}</label>

      {value.length > 0 && (
        <div className="mb-3 grid grid-cols-3 gap-3 sm:grid-cols-4">
          {value.map((url, idx) => (
            <div key={url + idx} className="group relative overflow-hidden rounded-lg border border-[#2f2f3c]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt={`gallery-${idx}`} className="aspect-square w-full object-cover" />
              <div className="absolute inset-x-0 bottom-0 flex justify-between bg-black/60 px-1 py-0.5 opacity-0 transition-opacity group-hover:opacity-100">
                <button type="button" onClick={() => move(idx, -1)} className="text-xs text-white disabled:opacity-30" disabled={idx === 0}>
                  ◀
                </button>
                <button type="button" onClick={() => remove(idx)} className="text-xs text-red-300">
                  削除
                </button>
                <button type="button" onClick={() => move(idx, 1)} className="text-xs text-white disabled:opacity-30" disabled={idx === value.length - 1}>
                  ▶
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading}
        className="rounded-lg border border-dashed border-[#2f2f3c] bg-[#0a0a0f] px-4 py-2 text-sm text-[#9a9aa8] transition-colors hover:border-[#d9b86b]/40 disabled:opacity-50"
      >
        {uploading ? 'アップロード中...' : '＋ 画像を追加（複数可）'}
      </button>

      {error && <p className="mt-1 text-xs text-red-400">{error}</p>}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        multiple
        onChange={handleFiles}
        className="hidden"
        aria-hidden="true"
      />
    </div>
  )
}
