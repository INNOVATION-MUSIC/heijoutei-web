'use client'

import { useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Props {
  value?: string
  onChange?: (url: string) => void
  label?: string
}

// Vercel の 4.5MB ボディ制限を回避するため、ブラウザから直接 Supabase Storage（media バケット）へアップロードする。
export default function ImageUploader({ value, onChange, label = '画像' }: Props) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [preview, setPreview] = useState<string | null>(value ?? null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    setError(null)
    const objectUrl = URL.createObjectURL(file)
    setPreview(objectUrl)

    try {
      const supabase = createClient()
      const ext = file.name.split('.').pop()
      const filename = `${crypto.randomUUID()}.${ext}`
      const { data, error } = await supabase.storage
        .from('media')
        .upload(filename, file, { contentType: file.type, upsert: false })

      if (error) {
        setError(`アップロード失敗: ${error.message}`)
        setPreview(value ?? null)
      } else {
        const {
          data: { publicUrl },
        } = supabase.storage.from('media').getPublicUrl(data.path)
        setPreview(publicUrl)
        onChange?.(publicUrl)
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      setError(`アップロード失敗: ${msg}`)
      setPreview(value ?? null)
    } finally {
      setUploading(false)
      URL.revokeObjectURL(objectUrl)
    }
  }

  function handleRemove() {
    setPreview(null)
    onChange?.('')
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-[#9a9aa8]">{label}</label>

      {preview ? (
        <div className="relative overflow-hidden rounded-lg border border-[#2f2f3c]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={preview} alt="プレビュー" className="aspect-video w-full object-cover" />
          <div className="absolute right-2 top-2 flex gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="rounded-md bg-black/60 px-3 py-1 text-xs text-white backdrop-blur-sm hover:bg-black/80"
            >
              変更
            </button>
            <button
              type="button"
              onClick={handleRemove}
              className="rounded-md bg-red-900/60 px-3 py-1 text-xs text-red-300 backdrop-blur-sm hover:bg-red-900/80"
            >
              削除
            </button>
          </div>
          {uploading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
              <span className="text-sm text-white">アップロード中...</span>
            </div>
          )}
        </div>
      ) : (
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="flex w-full flex-col items-center gap-2 rounded-lg border border-dashed border-[#2f2f3c] bg-[#0a0a0f] py-8 text-center transition-colors hover:border-[#d9b86b]/40 disabled:opacity-50"
        >
          <span className="text-2xl">📸</span>
          <span className="text-sm text-[#9a9aa8]">
            {uploading ? 'アップロード中...' : 'クリックして画像をアップロード'}
          </span>
          <span className="text-xs text-[#5a5a6a]">JPG, PNG, WebP（最大 10MB）</span>
        </button>
      )}

      {error && <p className="mt-1 text-xs text-red-400">{error}</p>}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        onChange={handleFileChange}
        className="hidden"
        aria-hidden="true"
      />
    </div>
  )
}
