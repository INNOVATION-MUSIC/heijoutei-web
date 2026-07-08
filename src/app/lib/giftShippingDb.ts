import { createStaticClient } from "@/lib/supabase/static";
import { GIFT_SHIPPING, type GiftShippingArea } from "./giftData";

type ShippingRowDb = {
  region: string;
  prefectures: string[] | null;
  fee: string | null;
};

/**
 * ギフト送料金表を DB から取得する（sort_order 昇順）。
 * DB が空／取得失敗時は静的 GIFT_SHIPPING にフォールバックする。
 */
export async function fetchGiftShipping(): Promise<GiftShippingArea[]> {
  try {
    const supabase = createStaticClient();
    const { data, error } = await supabase
      .from("gift_shipping_areas")
      .select("region, prefectures, fee")
      .order("sort_order", { ascending: true });
    if (error || !data || data.length === 0) return GIFT_SHIPPING;
    return (data as ShippingRowDb[]).map((r) => ({
      region: r.region,
      prefectures: r.prefectures ?? [],
      fee: r.fee ?? "",
    }));
  } catch {
    return GIFT_SHIPPING;
  }
}
