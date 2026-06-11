import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/supabase'

// !! SUPABASE_SERVICE_ROLE_KEY は絶対にクライアントへ公開しない !!
// 管理画面の Server Component / Server Action からのみ使用する（RLS をバイパス）。
export const adminSupabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)
