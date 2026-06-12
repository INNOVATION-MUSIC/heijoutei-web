import { type NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

// 管理エリアのセッション更新（Next.js 16 の Proxy 規約・旧 middleware）。
// 期限切れアクセストークンをリフレッシュしクッキーへ書き戻すことで、
// layout / Server Action の getUser() を安定動作させる「楽観的更新」。
// 認可の本体は layout / 各 action の getUser 検証側に置く（Proxy は認可の最終防壁にしない）。
// matcher を /admin・/auth に限定し、公開フロントには認証呼び出しを乗せない。
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  await supabase.auth.getUser()

  return response
}

export const config = {
  matcher: ['/admin/:path*', '/auth/:path*'],
}
