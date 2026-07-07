import { createStaticClient } from "@/lib/supabase/static";
import { GIFT_PRODUCTS, type GiftProduct, type GiftSpecRow } from "./giftData";

type GiftRowDb = {
  id: string;
  subtitle: string | null;
  title: string;
  price_amount: string | null;
  price_note: string | null;
  image_url: string | null;
  description: string | null;
  content_label: string | null;
  content: string | null;
  specs: unknown;
  is_short: boolean;
};

function toSpecs(raw: unknown): GiftSpecRow[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((s): s is GiftSpecRow => !!s && typeof s === "object" && typeof (s as GiftSpecRow).label === "string" && typeof (s as GiftSpecRow).value === "string")
    .map((s) => ({ label: s.label, value: s.value }));
}

function toProduct(r: GiftRowDb): GiftProduct {
  const price: GiftProduct["price"] = [];
  if (r.price_amount) price.push({ text: r.price_amount, size: "lg" });
  if (r.price_note) price.push({ text: r.price_note, size: "sm" });
  return {
    id: r.id,
    subtitle: r.subtitle ?? "",
    title: r.title,
    price,
    image: r.image_url ?? "",
    imageAlt: r.title,
    description: r.description ?? "",
    contentLabel: r.content_label ?? "",
    content: r.content ?? "",
    specs: toSpecs(r.specs),
    short: r.is_short,
  };
}

/**
 * ギフト商品を DB から取得する（公開商品のみ・sort_order 昇順）。
 * DB が空／取得失敗時は静的 GIFT_PRODUCTS にフォールバックする。
 */
export async function fetchGiftProducts(): Promise<GiftProduct[]> {
  try {
    const supabase = createStaticClient();
    const { data, error } = await supabase
      .from("gift_products")
      .select("id, subtitle, title, price_amount, price_note, image_url, description, content_label, content, specs, is_short")
      .eq("is_active", true)
      .order("sort_order", { ascending: true });
    if (error || !data || data.length === 0) return GIFT_PRODUCTS;
    return (data as unknown as GiftRowDb[]).map(toProduct);
  } catch {
    return GIFT_PRODUCTS;
  }
}
