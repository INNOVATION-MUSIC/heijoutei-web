import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/supabase'

// generateStaticParams / generateMetadata はリクエストスコープ外で実行されるため
// cookies() を使う server.ts は使えない。ビルド時・静的生成時はこのクライアントを使う。
export function createStaticClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
