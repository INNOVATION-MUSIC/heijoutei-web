'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import ImageUploader from '@/components/admin/ImageUploader'
import SimpleTagsEditor from '@/components/admin/SimpleTagsEditor'
import RecruitmentDetailTable from '@/components/admin/RecruitmentDetailTable'
import {
  createRecruit,
  updateRecruit,
  type RecruitPayload,
  type TagInput,
  type DetailInput,
} from '@/lib/actions/recruitments'
import type { Tables } from '@/types/supabase'
import type { StoreRef } from '@/lib/actions/refs'

const inputClass =
  'w-full rounded-lg border border-[#2f2f3c] bg-[#0a0a0f] px-3 py-2 text-sm text-[#ebe5db] focus:border-[#d9b86b] focus:outline-none focus:ring-1 focus:ring-[#d9b86b]/30'
const labelClass = 'mb-1.5 block text-xs font-medium text-[#9a9aa8]'

export default function RecruitForm({
  stores,
  initial,
  initialTags = [],
  initialDetails = [],
}: {
  stores: StoreRef[]
  initial?: Tables<'recruitments'>
  initialTags?: TagInput[]
  initialDetails?: DetailInput[]
}) {
  const router = useRouter()
  const isEdit = Boolean(initial)
  const [form, setForm] = useState<RecruitPayload>({
    store_id: initial?.store_id ?? stores[0]?.id ?? '',
    title: initial?.title ?? '',
    image_url: initial?.image_url ?? '',
    hero_image_url: initial?.hero_image_url ?? '',
    summary: initial?.summary ?? '',
    body: initial?.body ?? '',
    is_published: initial?.is_published ?? false,
    published_at: initial?.published_at ?? null,
    sort_order: initial?.sort_order ?? 0,
  })
  const [tags, setTags] = useState<TagInput[]>(initialTags)
  const [details, setDetails] = useState<DetailInput[]>(initialDetails)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function set<K extends keyof RecruitPayload>(k: K, v: RecruitPayload[K]) {
    setForm((f) => ({ ...f, [k]: v }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    const result = isEdit
      ? await updateRecruit(initial!.id, form, tags, details)
      : await createRecruit(form, tags, details)
    if (result?.error) {
      setError(result.error)
      setSaving(false)
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }
    router.push('/admin/recruitments')
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      {error && (
        <div className="rounded-lg border border-red-800/50 bg-red-900/20 px-4 py-3 text-sm text-red-400 lg:col-span-3">{error}</div>
      )}

      <div className="space-y-5 lg:col-span-2">
        <div className="space-y-4 rounded-xl border border-[#23232e] bg-[#14141a] p-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass}>店舗 *</label>
              <select className={inputClass} value={form.store_id} onChange={(e) => set('store_id', e.target.value)}>
                {stores.map((s) => (<option key={s.id} value={s.id}>{s.name}</option>))}
              </select>
            </div>
            <div>
              <label className={labelClass}>表示順</label>
              <input type="number" className={inputClass} value={form.sort_order ?? 0} onChange={(e) => set('sort_order', Number(e.target.value))} />
            </div>
          </div>
          <div>
            <label className={labelClass}>タイトル *</label>
            <input className={inputClass} value={form.title} onChange={(e) => set('title', e.target.value)} required />
          </div>
          <div>
            <label className={labelClass}>一覧カードの説明（2行・改行区切り）</label>
            <textarea className={`${inputClass} min-h-16`} value={form.summary ?? ''} onChange={(e) => set('summary', e.target.value)} placeholder={'職種：…\n仕事内容：…'} />
          </div>
          <div>
            <label className={labelClass}>本文（導入文・プレーンテキスト）</label>
            <textarea className={`${inputClass} min-h-28`} value={form.body ?? ''} onChange={(e) => set('body', e.target.value)} />
          </div>
        </div>

        <div className="space-y-4 rounded-xl border border-[#23232e] bg-[#14141a] p-5">
          <h2 className="text-sm font-semibold text-[#ebe5db]">募集要項（項目・内容）</h2>
          <RecruitmentDetailTable details={details} onChange={setDetails} />
        </div>
      </div>

      <div className="space-y-5">
        <div className="space-y-4 rounded-xl border border-[#23232e] bg-[#14141a] p-5">
          <label className="flex items-center gap-2 text-sm text-[#ebe5db]">
            <input type="checkbox" checked={form.is_published ?? false} onChange={(e) => set('is_published', e.target.checked)} className="accent-[#d9b86b]" />
            公開する
          </label>
        </div>
        <div className="space-y-4 rounded-xl border border-[#23232e] bg-[#14141a] p-5">
          <ImageUploader label="求人画像（一覧カード）" value={form.image_url ?? ''} onChange={(url) => set('image_url', url)} />
          <ImageUploader label="詳細ヒーロー画像（任意）" value={form.hero_image_url ?? ''} onChange={(url) => set('hero_image_url', url)} />
        </div>
        <div className="rounded-xl border border-[#23232e] bg-[#14141a] p-5">
          <p className={labelClass}>タグ</p>
          <SimpleTagsEditor tags={tags} onChange={setTags} />
        </div>
        <div className="flex flex-col gap-2">
          <button type="submit" disabled={saving} className="rounded-lg bg-[#d9b86b] py-2.5 text-sm font-medium text-[#1a1410] hover:opacity-90 disabled:opacity-50">
            {saving ? '保存中...' : isEdit ? '更新する' : '作成する'}
          </button>
          <button type="button" onClick={() => router.push('/admin/recruitments')} className="rounded-lg border border-[#2f2f3c] py-2.5 text-sm text-[#9a9aa8] hover:text-[#ebe5db]">
            キャンセル
          </button>
        </div>
      </div>
    </form>
  )
}
