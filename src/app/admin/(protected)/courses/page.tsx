import Link from 'next/link'
import { adminSupabase } from '@/lib/supabase/admin'
import DraggableCourseTable, { type CourseRow } from '@/components/admin/DraggableCourseTable'

export const dynamic = 'force-dynamic'

export default async function AdminCoursesPage() {
  const { data: stores } = await adminSupabase.from('stores').select('id, name').eq('is_active', true).order('sort_order')
  const { data: courses } = await adminSupabase
    .from('courses')
    .select('id, store_id, name, type_label, price_label, is_active, sort_order, course_categories(name)')
    .order('store_id')
    .order('sort_order')

  // 店舗ごとにまとめる（並び順＝表示順は店舗単位で意味を持つため店舗別にドラッグ並べ替え）
  const byStore = new Map<string, CourseRow[]>()
  for (const c of courses ?? []) {
    const row: CourseRow = {
      id: c.id,
      name: c.name,
      type_label: c.type_label,
      price_label: c.price_label,
      is_active: c.is_active,
      categoryName: (c.course_categories as { name: string } | null)?.name ?? null,
    }
    const list = byStore.get(c.store_id) ?? []
    list.push(row)
    byStore.set(c.store_id, list)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#ebe5db]">コース管理</h1>
          <p className="text-sm text-[#6f6f80]">全 {courses?.length ?? 0} 件・行をドラッグで並べ替え（表示順に反映）</p>
        </div>
        <Link href="/admin/courses/new" className="inline-flex items-center gap-2 rounded-lg bg-[#d9b86b] px-4 py-2 text-sm font-medium text-[#1a1410] hover:opacity-90">
          ＋ 新規コース
        </Link>
      </div>

      {(stores ?? []).map((s) => {
        const list = byStore.get(s.id) ?? []
        if (list.length === 0) return null
        // 行の集合（複製/削除）が変わったら再マウントして最新を反映する
        return (
          <DraggableCourseTable
            key={`${s.id}:${list.map((r) => r.id).join(',')}`}
            storeName={s.name}
            initial={list}
          />
        )
      })}

      {(!courses || courses.length === 0) && (
        <div className="rounded-xl border border-[#23232e] bg-[#14141a] px-4 py-10 text-center text-sm text-[#6f6f80]">
          コースがありません。
        </div>
      )}
    </div>
  )
}
