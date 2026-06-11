import { createStaticClient } from "@/lib/supabase/static";

// フロント営業カレンダーの日種別（既存 CalendarSection の DayType と同一ユニオン）。
export type BizDayType = "normal" | "teikyu" | "lunch";

export type BusinessMonth = {
  year: number;                          // 西暦（例: 2026）
  month: number;                         // 1-12
  startDay: number;                      // 月初の曜日 0=日 … 6=土
  totalDays: number;                     // その月の日数
  specials: Record<number, BizDayType>;  // 日(1-31) → 種別（normal は省略）
};

// 管理画面 business_calendars.status → フロント表示種別。
// open=通常 / closed=定休 / special_closed=臨時休業（赤＝定休扱い） / limited=時短・特別営業（ランチのみ扱い）。
function mapStatus(status: string): BizDayType {
  switch (status) {
    case "closed":
    case "special_closed":
      return "teikyu";
    case "limited":
      return "lunch";
    default:
      return "normal";
  }
}

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * トップ「営業日」カレンダー用に、当月＋翌月の営業ステータスを取得する（代表店=kameoka）。
 * business_calendars に当該期間のデータが1件も無い／失敗時は undefined を返し、
 * フロントは従来の静的カレンダーにフォールバックする（デザイン不変・安全）。
 */
export async function fetchBusinessCalendar(storeSlug = "kameoka"): Promise<BusinessMonth[] | undefined> {
  try {
    const supabase = createStaticClient();
    const { data: store } = await supabase.from("stores").select("id").eq("slug", storeSlug).maybeSingle();
    if (!store) return undefined;

    const today = new Date();
    const y0 = today.getFullYear();
    const m0 = today.getMonth(); // 0-based
    const monthsMeta = [
      { year: y0, month0: m0 },
      m0 === 11 ? { year: y0 + 1, month0: 0 } : { year: y0, month0: m0 + 1 },
    ];

    const startIso = `${monthsMeta[0].year}-${pad(monthsMeta[0].month0 + 1)}-01`;
    const lastNext = new Date(monthsMeta[1].year, monthsMeta[1].month0 + 1, 0);
    const endIso = `${lastNext.getFullYear()}-${pad(lastNext.getMonth() + 1)}-${pad(lastNext.getDate())}`;

    const { data, error } = await supabase
      .from("business_calendars")
      .select("date, status")
      .eq("store_id", store.id)
      .gte("date", startIso)
      .lte("date", endIso);
    if (error || !data || data.length === 0) return undefined;

    return monthsMeta.map(({ year, month0 }) => {
      const specials: Record<number, BizDayType> = {};
      for (const row of data) {
        const [ry, rm, rd] = row.date.split("-").map(Number);
        if (ry === year && rm === month0 + 1) {
          const t = mapStatus(row.status);
          if (t !== "normal") specials[rd] = t; // normal は既定なので省略
        }
      }
      return {
        year,
        month: month0 + 1,
        startDay: new Date(year, month0, 1).getDay(),
        totalDays: new Date(year, month0 + 1, 0).getDate(),
        specials,
      };
    });
  } catch {
    return undefined;
  }
}
