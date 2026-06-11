import { adminSupabase } from '@/lib/supabase/admin'
import MarkReadButton from '@/components/admin/MarkReadButton'

export const dynamic = 'force-dynamic'

export default async function AdminContactPage() {
  const { data: messages } = await adminSupabase
    .from('contact_messages')
    .select('*')
    .order('created_at', { ascending: false })

  const unread = (messages ?? []).filter((m) => !m.is_read).length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#ebe5db]">お問い合わせ管理</h1>
        <p className="text-sm text-[#6f6f80]">全 {messages?.length ?? 0} 件 / 未読 {unread} 件</p>
      </div>

      <div className="space-y-3">
        {(messages ?? []).map((m) => (
          <details key={m.id} className={`group rounded-xl border bg-[#14141a] ${m.is_read ? 'border-[#23232e]' : 'border-l-2 border-l-blue-500 border-[#23232e]'}`}>
            <summary className="flex cursor-pointer items-center gap-3 px-5 py-4">
              {!m.is_read && <span className="h-2 w-2 flex-shrink-0 rounded-full bg-blue-500" />}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-[#ebe5db]">
                  {m.name}
                  {m.subject ? <span className="ml-2 text-[#9a9aa8]">{m.subject}</span> : null}
                </p>
                <p className="truncate text-xs text-[#6f6f80]">{m.email} ・ {m.created_at ? new Date(m.created_at).toLocaleString('ja-JP') : ''}</p>
              </div>
            </summary>
            <div className="border-t border-[#23232e] px-5 py-4">
              <dl className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
                <div><dt className="text-xs text-[#6f6f80]">お名前</dt><dd className="text-[#ebe5db]">{m.name}{m.kana ? `（${m.kana}）` : ''}</dd></div>
                <div><dt className="text-xs text-[#6f6f80]">メール</dt><dd className="text-[#ebe5db]">{m.email}</dd></div>
                <div><dt className="text-xs text-[#6f6f80]">電話</dt><dd className="text-[#ebe5db]">{m.phone ?? '—'}</dd></div>
                <div><dt className="text-xs text-[#6f6f80]">種別</dt><dd className="text-[#ebe5db]">{m.subject ?? '—'}</dd></div>
              </dl>
              <div className="mt-3">
                <dt className="text-xs text-[#6f6f80]">お問い合わせ内容</dt>
                <dd className="mt-1 whitespace-pre-wrap text-sm text-[#ebe5db]">{m.message}</dd>
              </div>
              <div className="mt-4 flex items-center gap-3">
                <MarkReadButton messageId={m.id} isRead={m.is_read ?? false} />
                <a href={`mailto:${m.email}`} className="rounded-md border border-[#2f2f3c] px-3 py-1 text-xs text-[#9a9aa8] hover:text-[#ebe5db]">メールで返信</a>
              </div>
            </div>
          </details>
        ))}
        {(!messages || messages.length === 0) && (
          <p className="rounded-xl border border-[#23232e] bg-[#14141a] px-5 py-10 text-center text-sm text-[#6f6f80]">お問い合わせはありません。</p>
        )}
      </div>
    </div>
  )
}
