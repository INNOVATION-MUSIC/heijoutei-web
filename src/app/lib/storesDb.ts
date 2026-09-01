import { createStaticClient } from "@/lib/supabase/static";

// フロント各所の「店舗タブ／店舗選択」を DB の店舗マスタに連動させるための共通フェッチャ。
// id は slug（フロントの ?store= キーや求人の店舗一致に使う）。is_active のみ・sort_order 順。
export type PublicStore = { id: string; name: string; tel: string; hours: string; closedDays: string };

// 公開店舗一覧（is_active=true・sort_order 順）。DB 空・失敗時は空配列（呼び出し側で静的フォールバック）。
export async function fetchPublicStores(): Promise<PublicStore[]> {
  try {
    const supabase = createStaticClient();
    const { data, error } = await supabase
      .from("stores")
      .select("slug, name, phone, business_hours, closed_days")
      .eq("is_active", true)
      .order("sort_order", { ascending: true });
    if (error || !data || data.length === 0) return [];
    return data.map((s) => ({ id: s.slug, name: s.name, tel: s.phone ?? "", hours: s.business_hours ?? "", closedDays: s.closed_days ?? "" }));
  } catch {
    return [];
  }
}
