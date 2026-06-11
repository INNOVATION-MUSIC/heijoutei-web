import { createStaticClient } from "@/lib/supabase/static";
import { LINE_STORE_LINKS } from "./navLinks";
import { STORE_DETAILS, getStoreDetail, type StoreDetail } from "./storeDetailData";

type StoreRow = {
  slug: string;
  name: string;
  name_en: string | null;
  address: string | null;
  phone: string | null;
  access: string | null;
  business_hours: string | null;
  closed_days: string | null;
  description: string | null;
  seat_description: string | null;
  gallery_image_urls: string[] | null;
  hero_image_url: string | null;
  line_id: string | null;
};

function splitLines(s: string | null): string[] {
  if (!s) return [];
  return s.split("\n").map((l) => l.trim()).filter(Boolean);
}

// LINE ボタン用の短い店舗名（"平壌亭 亀岡店" → "亀岡店" / "焼肉ゆらの" → "ゆらの"）
function shortName(name: string): string {
  return name.replace(/^平壌亭\s*/, "").replace(/^焼肉/, "");
}

function toDetail(row: StoreRow): StoreDetail {
  const lineKey = (row.line_id ?? "") as keyof typeof LINE_STORE_LINKS;
  const lineUrl = row.line_id && LINE_STORE_LINKS[lineKey] ? LINE_STORE_LINKS[lineKey] : undefined;
  const photos = row.gallery_image_urls && row.gallery_image_urls.length > 0
    ? row.gallery_image_urls
    : row.hero_image_url
      ? [row.hero_image_url]
      : [];
  return {
    slug: row.slug,
    enLabel: row.name_en ?? row.name,
    name: row.name,
    desc: splitLines(row.description),
    photos,
    address: row.address ?? "",
    phone: row.phone ?? "",
    access: row.access ?? "",
    hours: splitLines(row.business_hours),
    closed: row.closed_days ?? "",
    seats: row.seat_description ?? undefined,
    lineName: lineUrl ? shortName(row.name) : undefined,
    lineUrl,
  };
}

const SELECT =
  "slug, name, name_en, address, phone, access, business_hours, closed_days, description, seat_description, gallery_image_urls, hero_image_url, line_id";

export async function fetchStoreDetail(slug: string): Promise<StoreDetail | undefined> {
  try {
    const supabase = createStaticClient();
    const { data } = await supabase.from("stores").select(SELECT).eq("slug", slug).eq("is_active", true).maybeSingle();
    if (!data) return getStoreDetail(slug);
    return toDetail(data as StoreRow);
  } catch {
    return getStoreDetail(slug);
  }
}

export async function fetchStoreParams(): Promise<{ id: string }[]> {
  try {
    const supabase = createStaticClient();
    const { data } = await supabase.from("stores").select("slug").eq("is_active", true);
    if (!data || data.length === 0) return STORE_DETAILS.map((s) => ({ id: s.slug }));
    return data.map((r) => ({ id: r.slug }));
  } catch {
    return STORE_DETAILS.map((s) => ({ id: s.slug }));
  }
}
