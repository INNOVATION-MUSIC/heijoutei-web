import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Supabase のメールリンク（パスワードリセット等・PKCE）の着地点。
// ?code を受け取りセッションへ交換してから next（既定 /admin）へ遷移する。
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/admin'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // code が無い／交換失敗：エラー表示付きでログイン画面へ
  return NextResponse.redirect(`${origin}/admin/login?error=auth`)
}
