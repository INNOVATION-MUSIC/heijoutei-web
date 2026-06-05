const mincho = "'Shippori Mincho', serif";
const display = "'Cormorant Garamond', serif";
const sans = "'Noto Sans JP', sans-serif";

type DayType = "normal" | "teikyu" | "lunch";

const MAY_SPECIALS: Record<number, DayType> = {
  5: "teikyu", 12: "teikyu", 19: "teikyu", 25: "lunch", 26: "teikyu",
};
const JUN_SPECIALS: Record<number, DayType> = {
  2: "teikyu", 9: "teikyu", 16: "teikyu", 23: "teikyu", 29: "lunch", 30: "teikyu",
};

const DAYS = ["日", "月", "火", "水", "木", "金", "土"];

function buildCells(startDay: number, totalDays: number): (number | null)[] {
  const cells: (number | null)[] = [];
  for (let i = 0; i < startDay; i++) cells.push(null);
  for (let d = 1; d <= totalDays; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

function CalendarGrid({
  year, month, startDay, totalDays, specials, top,
}: {
  year: number; month: number; startDay: number; totalDays: number;
  specials: Record<number, DayType>; top: number;
}) {
  const cells = buildCells(startDay, totalDays);
  const weeks: (number | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));

  const CW = Math.floor(346 / 7);

  return (
    <div className="absolute" style={{ left: 22, top, width: 346, border: "1px solid rgba(217,184,107,0.35)", backgroundColor: "#0d0c0a" }}>
      <p style={{ textAlign: "center", fontFamily: mincho, fontSize: 16, color: "#ebe5db", letterSpacing: "0.3em", padding: "18px 0 14px" }}>
        {year}年　{month}月
      </p>
      <div style={{ display: "grid", gridTemplateColumns: `repeat(7, ${CW}px)`, borderTop: "1px solid rgba(255,255,255,0.07)" }}>
        {DAYS.map((d, i) => (
          <div key={d} style={{
            textAlign: "center", padding: "8px 0",
            fontFamily: mincho, fontSize: 11,
            color: i === 0 ? "#c0392b" : i === 6 ? "#7eacd4" : "rgba(235,229,219,0.55)",
            borderRight: i < 6 ? "1px solid rgba(255,255,255,0.05)" : undefined,
          }}>{d}</div>
        ))}
      </div>
      {weeks.map((week, wi) => (
        <div key={wi} style={{ display: "grid", gridTemplateColumns: `repeat(7, ${CW}px)`, borderTop: "1px solid rgba(255,255,255,0.05)" }}>
          {week.map((day, di) => {
            const status = day ? (specials[day] ?? "normal") : "normal";
            const bg = status === "teikyu" ? "#6b1a1a" : status === "lunch" ? "#4a3e20" : "transparent";
            const sub = status === "teikyu" ? "定休" : status === "lunch" ? "ランチのみ" : "";
            const isSun = di === 0;
            const isSat = di === 6;
            return (
              <div key={di} style={{
                textAlign: "center", padding: "9px 0 7px",
                backgroundColor: day ? bg : "transparent",
                borderRight: di < 6 ? "1px solid rgba(255,255,255,0.04)" : undefined,
                minHeight: 50,
              }}>
                {day && (
                  <>
                    <p style={{ fontFamily: mincho, fontSize: 14, color: isSun ? "#c0392b" : isSat ? "#7eacd4" : "#ebe5db" }}>{day}</p>
                    {sub && <p style={{ fontFamily: mincho, fontSize: 7, color: "rgba(235,229,219,0.65)", marginTop: 2 }}>{sub}</p>}
                  </>
                )}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

export default function CalendarSectionSP() {
  return (
    <section className="relative overflow-hidden bg-[#0a0a0a]" style={{ width: 390, height: 1090 }}>
      {/* ラベル 営業日 */}
      <div className="absolute overflow-hidden" style={{ left: 22, top: 48, width: 44, height: 97, border: "1px solid rgba(255,255,255,0.3)" }}>
        <p className="absolute" style={{ left: 15, top: 10, fontFamily: mincho, fontSize: 12, letterSpacing: "0.083em", color: "#fff", writingMode: "vertical-rl" as const }}>営業日</p>
      </div>

      {/* Business days タイトル */}
      <p className="absolute" style={{ left: 74, top: 42, fontFamily: display, fontSize: 52, fontStyle: "italic", letterSpacing: "-1px", color: "#ebe5db", lineHeight: "normal" }}>Business days</p>

      {/* 凡例 */}
      <div className="absolute flex items-center" style={{ left: 22, top: 155, gap: 18 }}>
        {[
          { dot: "#ffffff", label: "通常営業" },
          { dot: "#8a7a5a", label: "ランチのみ" },
          { dot: "#c0392b", label: "定休日" },
        ].map(({ dot, label }) => (
          <div key={label} className="flex items-center" style={{ gap: 6 }}>
            <span style={{ display: "inline-block", width: 8, height: 8, borderRadius: "50%", backgroundColor: dot, flexShrink: 0 }} />
            <span style={{ fontFamily: sans, fontSize: 10, color: "rgba(235,229,219,0.75)", letterSpacing: "0.08em" }}>{label}</span>
          </div>
        ))}
      </div>

      {/* 2026年5月 */}
      <CalendarGrid year={2026} month={5} startDay={5} totalDays={31} specials={MAY_SPECIALS} top={195} />

      {/* 2026年6月 */}
      <CalendarGrid year={2026} month={6} startDay={1} totalDays={30} specials={JUN_SPECIALS} top={620} />
    </section>
  );
}
