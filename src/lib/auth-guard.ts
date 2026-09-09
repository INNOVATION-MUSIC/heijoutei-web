import { createClient } from '@/lib/supabase/server'
import { adminSupabase } from '@/lib/supabase/admin'

// 認証ガード。getUser() は Supabase Auth サーバにトークンを問い合わせ、
// 署名・期限・失効を検証する（getSession / クッキー存在チェックと違い偽装不可）。
//
// storeIds:
//   null            = 全店（本部）アクセス可。role='admin' か、store_ids 未設定の editor。
//   string[]（1件以上）= その店舗のみ管理可（店舗スタッフ）。
export type GuardOk = { ok: true; userId: string; role: string; storeIds: string[] | null }
export type Guard = GuardOk | { ok: false; error: string }

// ログイン済みユーザーを検証し、profiles のロール・担当店舗を返す。
export async function requireAuth(): Promise<Guard> {
  const supabase = await createClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()
  if (error || !user) return { ok: false, error: '認証が必要です' }
  const { data: profile } = await adminSupabase
    .from('profiles')
    .select('role, store_ids')
    .eq('id', user.id)
    .single()
  const role = profile?.role ?? 'editor'
  const assigned = profile?.store_ids ?? null
  // admin か、店舗未指定の editor は全店（null）。指定ありの editor だけスコープする。
  const storeIds = role === 'admin' || !assigned || assigned.length === 0 ? null : assigned
  return { ok: true, userId: user.id, role, storeIds }
}

// admin ロール必須（ユーザー管理など）。
export async function requireAdmin(): Promise<Guard> {
  const g = await requireAuth()
  if (!g.ok) return g
  if (g.role !== 'admin') return { ok: false, error: '権限がありません（管理者のみ）' }
  return g
}

// 全店（本部）アクセスが必要な操作向け（ギフト・カテゴリ管理・店舗の新規作成/削除など）。
export async function requireAllStores(): Promise<Guard> {
  const g = await requireAuth()
  if (!g.ok) return g
  if (g.storeIds !== null) return { ok: false, error: '権限がありません（本部のみ）' }
  return g
}

// Server Action 用の本部限定ガード。範囲外なら { error }、OK なら null。
export async function assertAllStores(): Promise<{ error: string } | null> {
  const g = await requireAuth()
  if (!g.ok) return { error: g.error }
  return g.storeIds === null ? null : { error: '権限がありません（本部のみ）' }
}

// --- 店舗スコープ判定ヘルパー ---

export function isAllStores(guard: GuardOk): boolean {
  return guard.storeIds === null
}

// 指定店舗を操作できるか。storeId が未確定(null/undefined)の行は本部のみ可。
export function canAccessStore(guard: GuardOk, storeId: string | null | undefined): boolean {
  if (guard.storeIds === null) return true
  if (!storeId) return false
  return guard.storeIds.includes(storeId)
}

// 複数店舗すべてを操作できるか（M:N のテイクアウトメニューなど）。
export function canAccessAllStores(guard: GuardOk, storeIds: (string | null | undefined)[]): boolean {
  if (guard.storeIds === null) return true
  if (storeIds.length === 0) return false
  return storeIds.every((s) => !!s && guard.storeIds!.includes(s))
}

// 一覧クエリを絞るための許可店舗 id。null なら絞らない（全店）。未ログインは空配列（何も見えない）。
export async function scopedStoreIds(): Promise<string[] | null> {
  const g = await requireAuth()
  if (!g.ok) return []
  return g.storeIds
}

/**
 * Server Action 用。対象の店舗 id（単数 or 複数）が操作範囲内かを検証する。
 * 範囲外なら { error } を返す。OK なら null。未ログインもエラー。
 */
export async function assertStoreAccess(
  storeId: (string | null | undefined) | (string | null | undefined)[]
): Promise<{ error: string } | null> {
  const g = await requireAuth()
  if (!g.ok) return { error: g.error }
  const ids = Array.isArray(storeId) ? storeId : [storeId]
  const ok = Array.isArray(storeId) ? canAccessAllStores(g, ids) : canAccessStore(g, ids[0])
  return ok ? null : { error: '権限がありません（担当店舗外の操作です）' }
}

// 既存の各 Server Action が使う簡易ブール版。実体は getUser 検証に統一。
export async function isAuthed(): Promise<boolean> {
  return (await requireAuth()).ok
}
