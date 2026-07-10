'use client'

import ImageUploader from '@/components/admin/ImageUploader'
import type { MenuItemInput } from '@/lib/actions/menus'
import type { CategoryRef } from '@/lib/actions/refs'

const inputClass =
  'w-full rounded-lg border border-[#2f2f3c] bg-[#0a0a0f] px-3 py-2 text-sm text-[#ebe5db] focus:border-[#d9b86b] focus:outline-none'
// 追加メニュー行用（幅は flex で制御するため w-full を付けない）
const addonInputClass =
  'rounded-lg border border-[#2f2f3c] bg-[#0a0a0f] px-3 py-2 text-sm text-[#ebe5db] focus:border-[#d9b86b] focus:outline-none'

export default function MenuItemsEditor({
  items,
  onChange,
  lunchCategories,
}: {
  items: MenuItemInput[]
  onChange: (items: MenuItemInput[]) => void
  // 指定時、各品目に「ランチカテゴリ」選択を表示する（/menu/lunch のサブタブ用）
  lunchCategories?: CategoryRef[]
}) {
  function update(idx: number, patch: Partial<MenuItemInput>) {
    onChange(items.map((it, i) => (i === idx ? { ...it, ...patch } : it)))
  }
  function add() {
    onChange([...items, { name: '', description: '', price_label: '', image_url: '' }])
  }
  function remove(idx: number) {
    onChange(items.filter((_, i) => i !== idx))
  }
  function move(idx: number, dir: -1 | 1) {
    const next = [...items]
    const t = idx + dir
    if (t < 0 || t >= next.length) return
    ;[next[idx], next[t]] = [next[t], next[idx]]
    onChange(next)
  }

  return (
    <div className="space-y-3">
      {items.map((it, idx) => (
        <div key={idx} className="rounded-lg border border-[#2a2a36] bg-[#0f0f15] p-4">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-xs text-[#6f6f80]">項目 {idx + 1}</span>
            <div className="flex items-center gap-2 text-xs">
              <button type="button" onClick={() => move(idx, -1)} disabled={idx === 0} className="text-[#9a9aa8] disabled:opacity-30">▲</button>
              <button type="button" onClick={() => move(idx, 1)} disabled={idx === items.length - 1} className="text-[#9a9aa8] disabled:opacity-30">▼</button>
              <button type="button" onClick={() => remove(idx)} className="text-red-400/80 hover:text-red-400">削除</button>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-3">
              <input className={inputClass} value={it.name} onChange={(e) => update(idx, { name: e.target.value })} placeholder="品名 *" />
              <input className={inputClass} value={it.price_label ?? ''} onChange={(e) => update(idx, { price_label: e.target.value })} placeholder="価格表示（例: 1,200円 / 時価）" />
              <input className={inputClass} value={it.description ?? ''} onChange={(e) => update(idx, { description: e.target.value })} placeholder="注意書き（任意・例: 内容は日によって変わります）" />
              {lunchCategories && (
                <select
                  className={inputClass}
                  value={it.lunch_category_id ?? ''}
                  onChange={(e) => update(idx, { lunch_category_id: e.target.value || null })}
                >
                  <option value="">カテゴリ：未分類（タブなし）</option>
                  {lunchCategories.map((c) => (
                    <option key={c.id} value={c.id}>カテゴリ：{c.name}</option>
                  ))}
                </select>
              )}
            </div>
            <ImageUploader label="品目画像" value={it.image_url ?? ''} onChange={(url) => update(idx, { image_url: url })} />
          </div>

          {/* 追加メニュー（任意）: この品目に付属する追加品。フロントでは品目カード内に入れ子表示される。 */}
          <div className="mt-3 rounded-lg border border-[#23232e] bg-[#0a0a0f]/50 p-3">
            <div className="mb-2 text-xs text-[#9a9aa8]">追加メニュー（任意・例: サムギョプサルの追加）</div>
            <div className="space-y-2">
              {(it.addons ?? []).map((a, ai) => (
                <div key={ai} className="flex items-center gap-2">
                  <input
                    className={`${addonInputClass} flex-1`}
                    value={a.name}
                    onChange={(e) => update(idx, { addons: (it.addons ?? []).map((x, i) => (i === ai ? { ...x, name: e.target.value } : x)) })}
                    placeholder="品名（例: 豚バラ）"
                  />
                  <input
                    className={`${addonInputClass} w-28`}
                    value={a.price}
                    onChange={(e) => update(idx, { addons: (it.addons ?? []).map((x, i) => (i === ai ? { ...x, price: e.target.value } : x)) })}
                    placeholder="価格（例: 740）"
                  />
                  <button
                    type="button"
                    onClick={() => update(idx, { addons: (it.addons ?? []).filter((_, i) => i !== ai) })}
                    className="shrink-0 px-1 text-xs text-red-400/80 hover:text-red-400"
                  >
                    削除
                  </button>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() => update(idx, { addons: [...(it.addons ?? []), { name: '', price: '' }] })}
              className="mt-2 rounded-lg border border-dashed border-[#2f2f3c] px-3 py-1.5 text-xs text-[#9a9aa8] hover:border-[#d9b86b]/40"
            >
              ＋ 追加メニューを追加
            </button>
          </div>
        </div>
      ))}
      <button type="button" onClick={add} className="rounded-lg border border-dashed border-[#2f2f3c] px-4 py-2 text-sm text-[#9a9aa8] hover:border-[#d9b86b]/40">
        ＋ 品目を追加
      </button>
    </div>
  )
}
