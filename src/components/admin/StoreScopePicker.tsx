'use client'

type StoreOption = { id: string; name: string }

// ユーザーの担当店舗を選ぶチェックボックス群。
// role='admin' のときは常に全店なので非活性表示。何も選ばない＝本部（全店）。
export default function StoreScopePicker({
  stores,
  value,
  onChange,
  disabled = false,
}: {
  stores: StoreOption[]
  value: string[]
  onChange: (next: string[]) => void
  disabled?: boolean
}) {
  function toggle(id: string) {
    onChange(value.includes(id) ? value.filter((s) => s !== id) : [...value, id])
  }

  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-[#9a9aa8]">担当店舗</label>
      <p className="mb-2 text-xs text-[#5a5a6a]">
        {disabled
          ? '管理者は常に全店舗を管理できます。'
          : '選んだ店舗のデータのみ管理できます。何も選ばない場合は全店舗（本部）扱いです。'}
      </p>
      <div className={`space-y-1.5 ${disabled ? 'pointer-events-none opacity-40' : ''}`}>
        {stores.map((s) => (
          <label key={s.id} className="flex items-center gap-2 text-sm text-[#ebe5db]">
            <input
              type="checkbox"
              className="accent-[#d9b86b]"
              checked={value.includes(s.id)}
              onChange={() => toggle(s.id)}
              disabled={disabled}
            />
            {s.name}
          </label>
        ))}
        {stores.length === 0 && <p className="text-xs text-[#5a5a6a]">店舗がありません。</p>}
      </div>
    </div>
  )
}
