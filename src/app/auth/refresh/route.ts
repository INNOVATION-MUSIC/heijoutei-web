import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// セッションのキープアライブ。管理画面を開くたびにクライアントから叩かれる。
// Route Handler は cookie を書き込めるため、@supabase/ssr がローテーション後の
// リフレッシュトークン cookie をここで永続化できる（Server Component の getUser では永続化されない）。
export async function GET() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return NextResponse.json({ ok: Boolean(user) })
}
