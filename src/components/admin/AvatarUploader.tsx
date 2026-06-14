'use client'

import { useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

// 円形のアイコン（プロフィール画像）アップローダー。
// ブラウザから直接 Supabase Storage（media バケット）へ上げ、公開URLを onChange で返す。
export default function AvatarUploader({
  value,
  onChange,
  size = 64,
}: {
  value?: string | null
  onChange: (url: string) => void
  size?: number
}) {
  const [preview, setPreview] = useState<string | null>(value ?? null)
  const [uploading, setUploading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const supabase = createClient()
      const ext = file.name.split('.').pop()
      const filename = `avatar-${crypto.randomUUID()}.${ext}`
      const { data, error } = await supabase.storage
        .from('media')
        .upload(filename, file, { contentType: file.type, upsert: false })
      if (!error && data) {
        const {
          data: { publicUrl },
        } = supabase.storage.from('media').getPublicUrl(data.path)
        setPreview(publicUrl)
        onChange(publicUrl)
      }
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="relative flex-shrink-0 overflow-hidden rounded-full border border-[#2f2f3c] bg-[#0a0a0f] hover:border-[#d9b86b]/60"
        style={{ width: size, height: size }}
        title="クリックしてアイコンを設定"
      >
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt="" className="h-full w-full object-cover" />
        ) : (
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            className="mx-auto text-[#5a5a6a]"
            style={{ width: size * 0.5, height: size * 0.5 }}
            aria-hidden="true"
          >
            <circle cx="12" cy="8" r="4" />
            <path d="M4 20a8 8 0 0 1 16 0" />
          </svg>
        )}
        {uploading && (
          <span className="absolute inset-0 flex items-center justify-center bg-black/60 text-[10px] text-white">…</span>
        )}
      </button>
      {preview && (
        <button
          type="button"
          onClick={() => {
            setPreview(null)
            onChange('')
          }}
          className="text-xs text-red-400/70 hover:text-red-400"
        >
          削除
        </button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        onChange={handleFile}
        className="hidden"
        aria-hidden="true"
      />
    </div>
  )
}
