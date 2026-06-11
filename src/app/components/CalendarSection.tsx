"use client";
import type { BusinessMonth } from "@/app/lib/businessCalendarDb";

const mincho = "'Shippori Mincho', serif";
const display = "'Cormorant Garamond', serif";
const sans = "'Noto Sans JP', sans-serif";

type DayType = "normal" | "teikyu" | "rinji";

const MAY_SPECIALS: Record<number, DayType> = {
  6: "teikyu",
  12: "teikyu", 13: "teikyu", 14: "teikyu",
  20: "teikyu",
  27: "teikyu",
};
const JUN_SPECIALS: Record<number, DayType> = {
  2: "teikyu", 9: "teikyu", 16: "teikyu", 23: "teikyu", 30: "teikyu",
};

const DAYS = ["日", "月", "火", "水", "木", "金", "土"];

function buildCells(startDay: number, totalDays: number): (number | null)[] {
  const cells: (number | null)[] = [];
  for (let i = 0; i < startDay; i++) cells.push(null);
  for (let d = 1; d <= totalDays; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

function CalendarGrid({ year, month, startDay, totalDays, specials, left }: {
  year: number; month: number; startDay: number; totalDays: number;
  specials: Record<number, DayType>; left: number;
}) {
  const cells = buildCells(startDay, totalDays);
  const weeks: (number | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));

  return (
    <div className="absolute" style={{ left, top: 284, width: 620, height: 480, background: "#171717", overflow: "hidden" }}>
      {/* 金色トップバー */}
      <div style={{ height: 2, background: "rgba(217,184,107,0.8)" }} />

      {/* 月ヘッダー */}
      <p style={{ textAlign: "center", fontFamily: mincho, fontSize: 20, color: "#f5f2ed", letterSpacing: "3px", paddingTop: 36, paddingBottom: 32 }}>
        {year}年　{month}月
      </p>

      {/* 曜日ヘッダー */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)" }}>
        {DAYS.map((d, i) => (
          <div key={d} style={{
            textAlign: "center", padding: "4px 0 6px",
            fontFamily: sans, fontWeight: 300, fontSize: 11,
            color: i === 0 ? "#cc6659" : i === 6 ? "#8cadd9" : "#b8b2ad",
          }}>{d}</div>
        ))}
      </div>

      {/* 区切り線 */}
      <div style={{ height: 1, background: "rgba(245,242,237,0.08)", marginLeft: 16, marginRight: 16 }} />
      <div style={{ height: 17 }} />

      {/* 日付行 */}
      {weeks.map((week, wi) => (
        <div key={wi} style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)" }}>
          {week.map((day, di) => {
            const status = day ? (specials[day] ?? "normal") : "normal";
            const isSun = di === 0;
            const isSat = di === 6;
            const sub = status === "teikyu" ? "定休日" : status === "rinji" ? "臨時休業" : "";
            const highlightBg = status === "teikyu"
              ? "rgba(166,49,49,0.35)"
              : status === "rinji"
              ? "rgba(214,138,49,0.35)"
              : undefined;

            return (
              <div key={di} style={{ position: "relative", height: 52, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                {day && highlightBg && (
                  <div style={{ position: "absolute", top: 1, bottom: 1, left: 1, right: 1, borderRadius: 2, background: highlightBg }} />
                )}
                {day && (
                  <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
                    <p style={{
                      fontFamily: mincho, fontSize: 15,
                      color: isSun ? "#cc6659" : isSat ? "#8cadd9" : (status !== "normal" ? "#b8b2ad" : "#f5f2ed"),
                    }}>{day}</p>
                    {sub && (
                      <p style={{
                        fontFamily: sans, fontWeight: 300, fontSize: 9,
                        color: "rgba(184,178,173,0.7)",
                      }}>{sub}</p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

export default function CalendarSection({ months }: { months?: BusinessMonth[] } = {}) {
  const useDb = !!months && months.length > 0;
  const LEFTS = [66, 755];
  return (
    <section className="relative overflow-hidden bg-[#0a0a0a]" style={{ width: 1440, height: 1000 }}>

      {/* ラベル 営業日 */}
      <div className="absolute" style={{ left: 66, top: 51, boxSizing: "border-box", width: 44, height: 94, padding: "8px 7px", border: "1px solid rgba(255,255,255,0.3)", overflow: "hidden", display: "flex", justifyContent: "center", alignItems: "center" }}>
        <p style={{ margin: 0, fontFamily: mincho, fontSize: 12, letterSpacing: "7px", lineHeight: "1", color: "#fff", writingMode: "vertical-rl" as const, whiteSpace: "nowrap", transform: "translateY(4px)" }}>営業日</p>
      </div>

      {/* Business days タイトル */}
      <p className="absolute" style={{ left: 179, top: 41, fontFamily: display, fontSize: 80, letterSpacing: "-1px", color: "#ebe5db", lineHeight: "normal" }}>Business days</p>

      {/* 凡例 */}
      <div className="absolute" style={{ left: 67, top: 241, display: "flex", alignItems: "center", gap: 30 }}>
        {[
          { dot: "rgba(166,49,49,0.85)",   label: "定休日" },
          { dot: "rgba(214,138,49,0.85)",  label: "臨時休業" },
        ].map(({ dot, label }) => (
          <div key={label} style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ display: "inline-block", width: 10, height: 10, borderRadius: "50%", background: dot, flexShrink: 0 }} />
            <span style={{ fontFamily: sans, fontWeight: 300, fontSize: 11, color: "#fff", letterSpacing: "1px" }}>{label}</span>
          </div>
        ))}
      </div>

      {/* カレンダー（DB連動: 当月＋翌月 / 未投入時は従来の静的サンプル） */}
      {useDb ? (
        months!.slice(0, 2).map((m, i) => (
          <CalendarGrid key={`${m.year}-${m.month}`} year={m.year} month={m.month} startDay={m.startDay} totalDays={m.totalDays} specials={m.specials} left={LEFTS[i]} />
        ))
      ) : (
        <>
          <CalendarGrid year={2026} month={5} startDay={4} totalDays={31} specials={MAY_SPECIALS} left={66} />
          <CalendarGrid year={2026} month={6} startDay={1} totalDays={30} specials={JUN_SPECIALS} left={755} />
        </>
      )}

    </section>
  );
}
