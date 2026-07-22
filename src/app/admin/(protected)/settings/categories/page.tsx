import Link from 'next/link'
import { getCategories, type CategoryKind } from '@/lib/actions/categories'
import { getStoreRefs } from '@/lib/actions/refs'
import DraggableCategoryTable from '@/components/admin/DraggableCategoryTable'

export const dynamic = 'force-dynamic'

export default async function CategoriesSettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>
}) {
  const { tab } = await searchParams
  const kind: CategoryKind =
    tab === 'takeout' ? 'takeout' : tab === 'course' ? 'course' : tab === 'lunch' ? 'lunch' : 'menu'
  // 対象店舗の選択肢はメニュー／テイクアウトカテゴリで使用
  const [categories, stores] = await Promise.all([
    getCategories(kind),
    kind === 'menu' || kind === 'takeout' ? getStoreRefs() : Promise.resolve([]),
  ])

  const tabs: { key: CategoryKind; label: string }[] = [
    { key: 'menu', label: '通常メニュー' },
    { key: 'takeout', label: 'テイクアウト' },
    { key: 'course', label: 'コース' },
    { key: 'lunch', label: 'ランチ' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#ebe5db]">カテゴリ管理</h1>
        <p className="text-sm text-[#6f6f80]">メニュー／テイクアウトのカテゴリと表示順を管理します</p>
      </div>

      <div className="flex gap-1 border-b border-[#23232e]">
        {tabs.map((t) => (
          <Link
            key={t.key}
            href={`/admin/settings/categories?tab=${t.key}`}
            className={`-mb-px border-b-2 px-4 py-2 text-sm transition-colors ${
              kind === t.key
                ? 'border-[#d9b86b] font-medium text-[#ebe5db]'
                : 'border-transparent text-[#9a9aa8] hover:text-[#ebe5db]'
            }`}
          >
            {t.label}
          </Link>
        ))}
      </div>

      <DraggableCategoryTable key={kind} kind={kind} initial={categories} stores={stores} />
    </div>
  )
}
