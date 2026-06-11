import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/types/supabase'

// ブラウザ（クライアントコンポーネント）用クライアント
export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
