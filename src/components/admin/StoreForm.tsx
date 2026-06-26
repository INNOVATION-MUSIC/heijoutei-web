'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import ImageUploader from '@/components/admin/ImageUploader'
import GalleryUploader from '@/components/admin/GalleryUploader'
import SaveSuccessBanner from '@/components/admin/SaveSuccessBanner'
import { createStore, updateStore, type StorePayload } from '@/lib/actions/stores'
import type { Tables } from '@/types/supabase'

const inputClass =
  'w-full rounded-lg border border-[#2f2f3c] bg-[#0a0a0f] px-3 py-2 text-sm text-[#ebe5db] placeholder-[#3a3a4a] focus:border-[#d9b86b] focus:outline-none focus:ring-1 focus:ring-[#d9b86b]/30'
const labelClass = 'mb-1.5 block text-xs font-medium text-[#9a9aa8]'

function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <div>
      <label className={labelClass}>{label}</label>
      {children}
      {hint && <p className="mt-1 text-xs text-[#5a5a6a]">{hint}</p>}
    </div>
  )
}

export default function StoreForm({ initial }: { initial?: Tables<'stores'> }) {
  const router = useRouter()
  const isEdit = Boolean(initial)

  const [form, setForm] = useState<StorePayload>({
    name: initial?.name ?? '',
    slug: initial?.slug ?? '',
    name_en: initial?.name_en ?? '',
    address: initial?.address ?? '',
    phone: initial?.phone ?? '',
    business_hours: initial?.business_hours ?? '',
    closed_days: initial?.closed_days ?? '',
    access: initial?.access ?? '',
    description: initial?.description ?? '',
    seat_description: initial?.seat_description ?? '',
    hero_image_url: initial?.hero_image_url ?? '',
    logo_image_url: initial?.logo_image_url ?? '',
    gallery_image_urls: initial?.gallery_image_urls ?? [],
    line_id: initial?.line_id ?? '',
    is_active: initial?.is_active ?? true,
    is_coming_soon: initial?.is_coming_soon ?? false,
    sort_order: initial?.sort_order ?? 0,
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  // 郵便番号は住所自動入力の補助のみ（DB 保存・フロント表示はしない）
  const [postal, setPostal] = useState('')
  const [zipLoading, setZipLoading] = useState(false)
  const [zipError, setZipError] = useState<string | null>(null)

  function set<K extends keyof StorePayload>(key: K, val: StorePayload[K]) {
    setForm((f) => ({ ...f, [key]: val }))
  }

  // 郵便番号(7桁)から zipcloud で都道府県〜町域を取得し、住所欄に自動入力する
  async function lookupAddress(raw: string) {
    const zip = raw.replace(/[^0-9]/g, '')
    if (zip.length !== 7) {
      setZipError('郵便番号は7桁で入力してください')
      return
    }
    setZipLoading(true)
    setZipError(null)
    try {
      const res = await fetch(`https://zipcloud.ibsnet.co.jp/api/search?zipcode=${zip}`)
      const json = await res.json()
      const r = json?.results?.[0]
      if (!r) {
        setZipError('住所が見つかりませんでした')
        return
      }
      set('address', `${r.address1}${r.address2}${r.address3}`)
    } catch {
      setZipError('住所の取得に失敗しました')
    } finally {
      setZipLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    setSaved(false)
    const result = isEdit ? await updateStore(initial!.id, form) : await createStore(form)
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
    router.push('/admin/stores')
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <SaveSuccessBanner show={saved} />
      {error && (
        <div className="flex items-start gap-3 rounded-lg border border-red-800/50 bg-red-900/20 px-4 py-3">
          <span className="mt-0.5 text-red-400">⚠️</span>
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* メイン情報 */}
        <div className="space-y-5 lg:col-span-2">
          <div className="rounded-xl border border-[#23232e] bg-[#14141a] p-5">
            <h2 className="mb-4 text-sm font-semibold text-[#ebe5db]">基本情報</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="店舗名 *">
                  <input className={inputClass} value={form.name} onChange={(e) => set('name', e.target.value)} required />
                </Field>
                <Field label="スラッグ *" hint="URL に使用（例: kameoka）。英数字とハイフン">
                  <input className={inputClass} value={form.slug} onChange={(e) => set('slug', e.target.value)} required />
                </Field>
              </div>
              <Field label="英字ラベル" hint="例: HEIJOHTEI  KAMEOKA">
                <input className={inputClass} value={form.name_en ?? ''} onChange={(e) => set('name_en', e.target.value)} />
              </Field>
              <Field label="説明文" hint="改行で複数行。店舗詳細ページのリード文に表示">
                <textarea className={`${inputClass} min-h-20`} value={form.description ?? ''} onChange={(e) => set('description', e.target.value)} />
              </Field>
            </div>
          </div>

          <div className="rounded-xl border border-[#23232e] bg-[#14141a] p-5">
            <h2 className="mb-4 text-sm font-semibold text-[#ebe5db]">店舗情報</h2>
            <div className="space-y-4">
              <Field label="郵便番号（住所自動入力用・フロント非表示）" hint="7桁を入力すると住所欄に都道府県〜町域を自動入力。番地・建物名は続けて入力してください">
                <>
                  <div className="flex gap-2">
                    <input
                      className={inputClass}
                      value={postal}
                      inputMode="numeric"
                      placeholder="例: 6210825（ハイフン不要）"
                      onChange={(e) => {
                        const v = e.target.value
                        setPostal(v)
                        if (v.replace(/[^0-9]/g, '').length === 7) lookupAddress(v)
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => lookupAddress(postal)}
                      disabled={zipLoading}
                      className="shrink-0 rounded-lg border border-[#2f2f3c] px-4 text-sm text-[#9a9aa8] transition-colors hover:text-[#ebe5db] disabled:opacity-50"
                    >
                      {zipLoading ? '検索中...' : '住所検索'}
                    </button>
                  </div>
                  {zipError && <p className="mt-1 text-xs text-red-400">{zipError}</p>}
                </>
              </Field>
              <Field label="住所">
                <input className={inputClass} value={form.address ?? ''} onChange={(e) => set('address', e.target.value)} />
              </Field>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="電話番号">
                  <input className={inputClass} value={form.phone ?? ''} onChange={(e) => set('phone', e.target.value)} />
                </Field>
                <Field label="定休日">
                  <input className={inputClass} value={form.closed_days ?? ''} onChange={(e) => set('closed_days', e.target.value)} />
                </Field>
              </div>
              <Field label="営業時間" hint="改行で複数行">
                <textarea className={`${inputClass} min-h-20`} value={form.business_hours ?? ''} onChange={(e) => set('business_hours', e.target.value)} />
              </Field>
              <Field label="アクセス">
                <textarea className={`${inputClass} min-h-16`} value={form.access ?? ''} onChange={(e) => set('access', e.target.value)} />
              </Field>
              <Field label="座席の説明" hint="店舗詳細ページの「お席」欄に表示">
                <input className={inputClass} value={form.seat_description ?? ''} onChange={(e) => set('seat_description', e.target.value)} />
              </Field>
              <Field label="LINE 友だち追加 URL" hint="https:// から始まる友だち追加URL（例: https://lin.ee/xxxx）。入力すると店舗詳細ページにLINEボタンが表示されます">
                <input className={inputClass} value={form.line_id ?? ''} onChange={(e) => set('line_id', e.target.value)} placeholder="https://lin.ee/xxxx" />
              </Field>
            </div>
          </div>

          <div className="rounded-xl border border-[#23232e] bg-[#14141a] p-5">
            <h2 className="mb-4 text-sm font-semibold text-[#ebe5db]">画像</h2>
            <div className="space-y-4">
              <ImageUploader label="ヒーロー画像" value={form.hero_image_url ?? ''} onChange={(url) => set('hero_image_url', url)} />
              <ImageUploader label="ロゴ画像（白背景に表示・写真が無い店舗向け）" value={form.logo_image_url ?? ''} onChange={(url) => set('logo_image_url', url)} />
              <GalleryUploader value={form.gallery_image_urls ?? []} onChange={(urls) => set('gallery_image_urls', urls)} />
            </div>
          </div>
        </div>

        {/* サイドバー設定 */}
        <div className="space-y-5">
          <div className="rounded-xl border border-[#23232e] bg-[#14141a] p-5">
            <h2 className="mb-4 text-sm font-semibold text-[#ebe5db]">公開設定</h2>
            <div className="space-y-4">
              <label className="flex items-center gap-2 text-sm text-[#ebe5db]">
                <input type="checkbox" checked={form.is_active ?? true} onChange={(e) => set('is_active', e.target.checked)} className="accent-[#d9b86b]" />
                公開する（フロントに表示）
              </label>
              <label className="flex items-center gap-2 text-sm text-[#ebe5db]">
                <input type="checkbox" checked={form.is_coming_soon ?? false} onChange={(e) => set('is_coming_soon', e.target.checked)} className="accent-[#d9b86b]" />
                Coming Soon 表示
              </label>
              <Field label="表示順" hint="小さいほど先頭">
                <input type="number" className={inputClass} value={form.sort_order ?? 0} onChange={(e) => set('sort_order', Number(e.target.value))} />
              </Field>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <button type="submit" disabled={saving} className="rounded-lg bg-[#d9b86b] py-2.5 text-sm font-medium text-[#1a1410] transition-opacity hover:opacity-90 disabled:opacity-50">
              {saving ? '保存中...' : isEdit ? '更新する' : '作成する'}
            </button>
            <button type="button" onClick={() => router.push('/admin/stores')} className="rounded-lg border border-[#2f2f3c] py-2.5 text-sm text-[#9a9aa8] transition-colors hover:text-[#ebe5db]">
              キャンセル
            </button>
          </div>
        </div>
      </div>
    </form>
  )
}
