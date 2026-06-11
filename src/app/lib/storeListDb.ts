import { createStaticClient } from "@/lib/supabase/static";

// /store 一覧カード用のシリアライズ可能な店舗データ（hours は文字列配列）。
export type StoreCardData = {
  slug: string;
  enLabel: string;
  name: string;
  address: string;
  phone: string;
  access: string;
  hours: string[];
  closed: string;
  img?: string; // 写真（白背景ロゴが無い店舗）
  logo?: string; // 白背景に contain 表示するロゴ（写真が無い店舗）
};

type Row = {
  slug: string;
  name: string;
  name_en: string | null;
  address: string | null;
  phone: string | null;
  access: string | null;
  business_hours: string | null;
  closed_days: string | null;
  hero_image_url: string | null;
  logo_image_url: string | null;
};

function splitLines(s: string | null): string[] {
  if (!s) return [];
  return s.split("\n").map((l) => l.trim()).filter(Boolean);
}

function toCard(r: Row): StoreCardData {
  return {
    slug: r.slug,
    enLabel: r.name_en ?? r.name,
    name: r.name,
    address: r.address ?? "",
    phone: r.phone ?? "",
    access: r.access ?? "",
    hours: splitLines(r.business_hours),
    closed: r.closed_days ? `定休日 ${r.closed_days}` : "",
    img: r.logo_image_url ? undefined : r.hero_image_url ?? undefined,
    logo: r.logo_image_url ?? undefined,
  };
}

/** /store 一覧用の店舗カード一覧（is_active・sort_order 順）。DB 空時は空配列（呼び出し側で静的フォールバック）。 */
export async function fetchStoreList(): Promise<StoreCardData[]> {
  try {
    const supabase = createStaticClient();
    const { data, error } = await supabase
      .from("stores")
      .select("slug, name, name_en, address, phone, access, business_hours, closed_days, hero_image_url, logo_image_url")
      .eq("is_active", true)
      .order("sort_order", { ascending: true });
    if (error || !data || data.length === 0) return [];
    return (data as Row[]).map(toCard);
  } catch {
    return [];
  }
}
