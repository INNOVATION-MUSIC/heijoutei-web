'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import SaveSuccessBanner from '@/components/admin/SaveSuccessBanner'
import ImageUploader from '@/components/admin/ImageUploader'
import { createGift, updateGift, type GiftPayload, type GiftSpec } from '@/lib/actions/gifts'
import type { Tables } from '@/types/supabase'

// 幅指定を含まない共通の入力スタイル（幅は各所で付与する）
const fieldBase =
  'rounded-lg border border-[#2f2f3c] bg-[#0a0a0f] px-3 py-2 text-sm text-[#ebe5db] focus:border-[#d9b86b] focus:outline-none focus:ring-1 focus:ring-[#d9b86b]/30'
const inputClass = `w-full ${fieldBase}`
const labelClass = 'mb-1.5 block text-xs font-medium text-[#9a9aa8]'

function initialSpecs(initial?: Tables<'gift_products'>): GiftSpec[] {
  const raw = initial?.specs
  if (!Array.isArray(raw)) return []
  return raw
    .filter((s): s is GiftSpec => !!s && typeof s === 'object' && 'label' in s && 'value' in s)
    .map((s) => ({ label: String(s.label ?? ''), value: String(s.value ?? '') }))
}

export default function GiftForm({ initial }: { initial?: Tables<'gift_products'> }) {
  const router = useRouter()
  const isEdit = Boolean(initial)
  const [form, setForm] = useState<GiftPayload>({
    subtitle: initial?.subtitle ?? '',
    title: initial?.title ?? '',
    price_amount: initial?.price_amount ?? '',
    price_note: initial?.price_note ?? '',
    image_url: initial?.image_url ?? '',
    description: initial?.description ?? '',
    content_label: initial?.content_label ?? '',
    content: initial?.content ?? '',
    is_short: initial?.is_short ?? false,
    is_active: initial?.is_active ?? true,
    sort_order: initial?.sort_order ?? 0,
  })
  const [specs, setSpecs] = useState<GiftSpec[]>(initialSpecs(initial))
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  function set<K extends keyof GiftPayload>(k: K, v: GiftPayload[K]) {
    setForm((f) => ({ ...f, [k]: v }))
  }
  function setSpec(i: number, k: keyof GiftSpec, v: string) {
    setSpecs((rows) => rows.map((r, idx) => (idx === i ? { ...r, [k]: v } : r)))
  }
  function addSpec() {
    setSpecs((rows) => [...rows, { label: '', value: '' }])
  }
  function removeSpec(i: number) {
    setSpecs((rows) => rows.filter((_, idx) => idx !== i))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    setSaved(false)
    const payload: GiftPayload = { ...form, specs }
    const result = isEdit ? await updateGift(initial!.id, payload) : await createGift(payload)
    if (result?.error) {
      setError(result.error)
      setSaving(false)
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }
    if (isEdit) {
      setSaving(false)
      setSaved(true)
      router.refresh()
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }
    router.push('/admin/gifts')
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <SaveSuccessBanner show={saved} className="lg:col-span-3" backHref="/admin/gifts" />
      {error && (
        <div className="rounded-lg border border-red-800/50 bg-red-900/20 px-4 py-3 text-sm text-red-400 lg:col-span-3">
          {error}
        </div>
      )}

      <div className="space-y-5 lg:col-span-2">
        {/* 基本情報 */}
        <div className="space-y-4 rounded-xl border border-[#23232e] bg-[#14141a] p-5">
          <div>
            <label className={labelClass}>小見出し（金色・商品名の上）</label>
            <input className={inputClass} value={form.subtitle ?? ''} onChange={(e) => set('subtitle', e.target.value)} placeholder="例: 厳選した人気部位をバランスよくセットに" />
          </div>
          <div>
            <label className={labelClass}>商品名 *</label>
            <input className={inputClass} value={form.title} onChange={(e) => set('title', e.target.value)} required />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass}>金額（大きく表示）</label>
              <input className={inputClass} value={form.price_amount ?? ''} onChange={(e) => set('price_amount', e.target.value)} placeholder="例: 15,120" />
            </div>
            <div>
              <label className={labelClass}>単位・補足（小さく表示）</label>
              <input className={inputClass} value={form.price_note ?? ''} onChange={(e) => set('price_note', e.target.value)} placeholder="例: 円 / 500g（本体14,000円）" />
            </div>
          </div>
          <div>
            <label className={labelClass}>説明文（改行可）</label>
            <textarea className={`${inputClass} min-h-24`} value={form.description ?? ''} onChange={(e) => set('description', e.target.value)} />
          </div>
        </div>

        {/* 内容 */}
        <div className="space-y-4 rounded-xl border border-[#23232e] bg-[#14141a] p-5">
          <div>
            <label className={labelClass}>内容ラベル</label>
            <input className={inputClass} value={form.content_label ?? ''} onChange={(e) => set('content_label', e.target.value)} placeholder="例: セット内容 / 額 面" />
          </div>
          <div>
            <label className={labelClass}>内容（改行可・全角スペースで桁揃え）</label>
            <textarea className={`${inputClass} min-h-28 font-mono`} value={form.content ?? ''} onChange={(e) => set('content', e.target.value)} placeholder={'ヒレ　　　　　　　140g\nサーロイン　　　　140g'} />
          </div>
        </div>

        {/* スペック行 */}
        <div className="space-y-3 rounded-xl border border-[#23232e] bg-[#14141a] p-5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-[#9a9aa8]">スペック（賞味期限・送料など）</label>
            <button type="button" onClick={addSpec} className="rounded-md border border-[#2f2f3c] px-2.5 py-1 text-xs text-[#d9b86b] hover:bg-white/5">＋ 行を追加</button>
          </div>
          {specs.length === 0 && <p className="text-xs text-[#6f6f80]">「＋ 行を追加」でラベルと値の行を追加します。</p>}
          <div className="space-y-2">
            {specs.map((s, i) => (
              <div key={i} className="flex items-center gap-2">
                <input className={`${fieldBase} w-32 flex-shrink-0`} value={s.label} onChange={(e) => setSpec(i, 'label', e.target.value)} placeholder="ラベル" />
                <input className={`${fieldBase} min-w-0 flex-1`} value={s.value} onChange={(e) => setSpec(i, 'value', e.target.value)} placeholder="値" />
                <button type="button" onClick={() => removeSpec(i)} className="flex-shrink-0 px-2 text-sm text-red-400/80 hover:text-red-400" aria-label="削除">✕</button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* サイド */}
      <div className="space-y-5">
        <div className="rounded-xl border border-[#23232e] bg-[#14141a] p-5">
          <ImageUploader label="商品写真" value={form.image_url ?? ''} onChange={(url) => set('image_url', url)} />
        </div>
        <div className="space-y-4 rounded-xl border border-[#23232e] bg-[#14141a] p-5">
          <label className="flex items-center gap-2 text-sm text-[#ebe5db]">
            <input type="checkbox" checked={form.is_short ?? false} onChange={(e) => set('is_short', e.target.checked)} className="accent-[#d9b86b]" />
            写真を低く表示（お食事券など）
          </label>
          <label className="flex items-center gap-2 text-sm text-[#ebe5db]">
            <input type="checkbox" checked={form.is_active ?? true} onChange={(e) => set('is_active', e.target.checked)} className="accent-[#d9b86b]" />
            公開する
          </label>
          <div>
            <label className={labelClass}>表示順</label>
            <input type="number" className={inputClass} value={form.sort_order ?? 0} onChange={(e) => set('sort_order', Number(e.target.value))} />
            <p className="mt-1 text-xs text-[#6f6f80]">一覧のドラッグでも並べ替えられます。</p>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <button type="submit" disabled={saving} className="rounded-lg bg-[#d9b86b] py-2.5 text-sm font-medium text-[#1a1410] hover:opacity-90 disabled:opacity-50">
            {saving ? '保存中...' : isEdit ? '更新する' : '作成する'}
          </button>
          <button type="button" onClick={() => router.push('/admin/gifts')} className="rounded-lg border border-[#2f2f3c] py-2.5 text-sm text-[#9a9aa8] hover:text-[#ebe5db]">
            キャンセル
          </button>
        </div>
      </div>
    </form>
  )
}
