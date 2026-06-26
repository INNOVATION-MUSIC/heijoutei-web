'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import ImageUploader from '@/components/admin/ImageUploader'
import RichTextEditor from '@/components/admin/RichTextEditor'
import DateTimePicker from '@/components/admin/DateTimePicker'
import NewsTagsEditor from '@/components/admin/NewsTagsEditor'
import SaveSuccessBanner from '@/components/admin/SaveSuccessBanner'
import { createNews, updateNews, type NewsPayload, type NewsStatus, type NewsTagInput } from '@/lib/actions/news'
import { generateSlug } from '@/lib/slug'
import type { Tables } from '@/types/supabase'

const inputClass =
  'w-full rounded-lg border border-[#2f2f3c] bg-[#0a0a0f] px-3 py-2 text-sm text-[#ebe5db] focus:border-[#d9b86b] focus:outline-none focus:ring-1 focus:ring-[#d9b86b]/30'
const labelClass = 'mb-1.5 block text-xs font-medium text-[#9a9aa8]'

function toLocalInput(iso: string | null): string {
  if (!iso) return ''
  const d = new Date(iso)
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16)
}

export default function NewsForm({
  initial,
  initialTags = [],
}: {
  initial?: Tables<'news'>
  initialTags?: NewsTagInput[]
}) {
  const router = useRouter()
  const isEdit = Boolean(initial)

  const initialStatus: NewsStatus = !initial
    ? 'draft'
    : !initial.is_published
      ? 'draft'
      : initial.published_at && new Date(initial.published_at) > new Date()
        ? 'scheduled'
        : 'published'

  const [title, setTitle] = useState(initial?.title ?? '')
  const [slug, setSlug] = useState(initial?.slug ?? '')
  const [slugTouched, setSlugTouched] = useState(Boolean(initial?.slug))
  const [body, setBody] = useState(initial?.body ?? '')
  const [thumbnail, setThumbnail] = useState(initial?.thumbnail_url ?? '')
  const [status, setStatus] = useState<NewsStatus>(initialStatus)
  const [publishedAt, setPublishedAt] = useState(toLocalInput(initial?.published_at ?? null))
  const [tags, setTags] = useState<NewsTagInput[]>(initialTags)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  function onTitleChange(v: string) {
    setTitle(v)
    if (!slugTouched) setSlug(generateSlug(v))
  }

  async function submit(forceStatus?: NewsStatus) {
    setSaving(true)
    setError(null)
    setSaved(false)
    const finalStatus = forceStatus ?? status
    const payload: NewsPayload = {
      title,
      slug,
      body,
      thumbnail_url: thumbnail,
      status: finalStatus,
      published_at: finalStatus === 'draft' ? null : publishedAt ? new Date(publishedAt).toISOString() : null,
    }
    const result = isEdit ? await updateNews(initial!.id, payload, tags) : await createNews(payload, tags)
    if (result?.error) {
      setError(result.error)
      setSaving(false)
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }
    // 編集は一覧に遷移せず詳細画面に留まり「更新しました」を表示。新規作成は一覧へ
    if (isEdit) {
      setSaving(false)
      setSaved(true)
      router.refresh()
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }
    router.push('/admin/news')
    router.refresh()
  }

  return (
    <form onSubmit={(e) => { e.preventDefault(); submit() }} className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <SaveSuccessBanner show={saved} className="lg:col-span-3" />
      {error && (
        <div className="rounded-lg border border-red-800/50 bg-red-900/20 px-4 py-3 text-sm text-red-400 lg:col-span-3">{error}</div>
      )}

      <div className="space-y-5 lg:col-span-2">
        <div className="space-y-4 rounded-xl border border-[#23232e] bg-[#14141a] p-5">
          <div>
            <label className={labelClass}>タイトル *</label>
            <input className={inputClass} value={title} onChange={(e) => onTitleChange(e.target.value)} required />
          </div>
          <div>
            <label className={labelClass}>スラッグ</label>
            <input className={inputClass} value={slug} onChange={(e) => { setSlug(e.target.value); setSlugTouched(true) }} />
          </div>
        </div>

        <div className="rounded-xl border border-[#23232e] bg-[#14141a] p-5">
          <label className={labelClass}>本文</label>
          <RichTextEditor value={body} onChange={setBody} />
        </div>
      </div>

      <div className="space-y-5">
        <div className="space-y-4 rounded-xl border border-[#23232e] bg-[#14141a] p-5">
          <h2 className="text-sm font-semibold text-[#ebe5db]">公開設定</h2>
          <div>
            <label className={labelClass}>状態</label>
            <select className={inputClass} value={status} onChange={(e) => setStatus(e.target.value as NewsStatus)}>
              <option value="draft">下書き</option>
              <option value="published">公開</option>
              <option value="scheduled">予約公開</option>
            </select>
          </div>
          {status !== 'draft' && (
            <div>
              <label className={labelClass}>公開日時</label>
              <DateTimePicker value={publishedAt} onChange={setPublishedAt} />
              <p className="mt-1 text-xs text-[#5a5a6a]">未入力で公開すると現在時刻が設定されます</p>
            </div>
          )}
        </div>

        <div className="rounded-xl border border-[#23232e] bg-[#14141a] p-5">
          <ImageUploader label="サムネイル" value={thumbnail} onChange={setThumbnail} />
        </div>

        <div className="rounded-xl border border-[#23232e] bg-[#14141a] p-5">
          <p className={labelClass}>タグ</p>
          <NewsTagsEditor tags={tags} onChange={setTags} />
        </div>

        <div className="flex flex-col gap-2">
          <button type="submit" disabled={saving} className="rounded-lg bg-[#d9b86b] py-2.5 text-sm font-medium text-[#1a1410] hover:opacity-90 disabled:opacity-50">
            {saving ? '保存中...' : isEdit ? '更新する' : '保存する'}
          </button>
          {status === 'draft' && (
            <button type="button" disabled={saving} onClick={() => submit('published')} className="rounded-lg border border-[#d9b86b]/40 py-2.5 text-sm text-[#d9b86b] hover:bg-[#d9b86b]/10 disabled:opacity-50">
              すぐ公開する
            </button>
          )}
          <button type="button" onClick={() => router.push('/admin/news')} className="rounded-lg border border-[#2f2f3c] py-2.5 text-sm text-[#9a9aa8] hover:text-[#ebe5db]">
            キャンセル
          </button>
        </div>
      </div>
    </form>
  )
}
