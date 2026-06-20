"use client";

import { Fragment } from "react";
import type { BusinessMonth } from "@/app/lib/businessCalendarDb";

const mincho = "'Shippori Mincho', serif";
const display = "'Cormorant Garamond', serif";
const sans = "'Noto Sans JP', sans-serif";

type DayType = "normal" | "teikyu" | "rinji";

const MAY_SPECIALS: Record<number, DayType> = {
  5: "teikyu", 12: "teikyu", 19: "teikyu", 26: "teikyu",
};
const JUN_SPECIALS: Record<number, DayType> = {
  2: "teikyu", 9: "teikyu", 16: "teikyu", 23: "teikyu", 30: "teikyu",
};

const DAYS = ["日", "月", "火", "水", "木", "金", "土"];
const CW = Math.floor(358 / 7); // 51px per cell

function buildCells(startDay: number, totalDays: number): (number | null)[] {
  const cells: (number | null)[] = [];
  for (let i = 0; i < startDay; i++) cells.push(null);
  for (let d = 1; d <= totalDays; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

function CalendarGrid({
  year,
  month,
  startDay,
  totalDays,
  specials,
  topBorderAlpha,
}: {
  year: number;
  month: number;
  startDay: number;
  totalDays: number;
  specials: Record<number, DayType>;
  topBorderAlpha: number;
}) {
  const cells = buildCells(startDay, totalDays);
  const weeks: (number | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));

  return (
    <div style={{ background: "#171717" }}>
      {/* ゴールドの上線 */}
      <div style={{ height: 2, backgroundColor: `rgba(217,184,107,${topBorderAlpha})` }} />

      {/* 月ヘッダー */}
      <p
        style={{
          textAlign: "center",
          fontFamily: mincho,
          fontSize: 16,
          color: "#f0ebe5",
          letterSpacing: "2px",
          padding: "25px 0 14px",
        }}
      >
        {year}年　{month}月
      </p>

      {/* 曜日ヘッダー */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(7, ${CW}px)`,
          borderTop: "1px solid rgba(240,235,229,0.08)",
        }}
      >
        {DAYS.map((d, i) => (
          <div
            key={d}
            style={{
              textAlign: "center",
              padding: "8px 0",
              fontFamily: sans,
              fontSize: 10,
              fontWeight: 300,
              color: i === 0 ? "#cc6659" : i === 6 ? "#80a6d9" : "#a6a199",
            }}
          >
            {d}
          </div>
        ))}
      </div>

      {/* 日付グリッド */}
      {weeks.map((week, wi) => (
        <div
          key={wi}
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(7, ${CW}px)`,
            borderTop: "1px solid rgba(240,235,229,0.05)",
          }}
        >
          {week.map((day, di) => {
            const status = day ? (specials[day] ?? "normal") : "normal";
            const isTeikyu = status === "teikyu";
            const isRinji = status === "rinji";
            const isClosed = isTeikyu || isRinji;
            const isSun = di === 0;
            const isSat = di === 6;
            const bg = isTeikyu
              ? "rgba(166,49,49,0.35)"
              : isRinji
              ? "rgba(214,138,49,0.35)"
              : "transparent";
            const sub = isTeikyu ? "定休日" : isRinji ? "臨時休業" : "";

            return (
              <div
                key={di}
                style={{
                  textAlign: "center",
                  padding: "9px 0 7px",
                  backgroundColor: day ? bg : "transparent",
                  borderRadius: day && isClosed ? 2 : 0,
                  minHeight: 38,
                }}
              >
                {day && (
                  <>
                    <p
                      style={{
                        fontFamily: mincho,
                        fontSize: 13,
                        color: isClosed
                          ? "#a6a199"
                          : isSun
                          ? "#cc6659"
                          : isSat
                          ? "#80a6d9"
                          : "#f0ebe5",
                        lineHeight: "normal",
                      }}
                    >
                      {day}
                    </p>
                    {sub && (
                      <p
                        style={{
                          fontFamily: sans,
                          fontSize: 8,
                          fontWeight: 300,
                          color: "rgba(166,161,153,0.7)",
                          marginTop: 2,
                          lineHeight: "normal",
                        }}
                      >
                        {sub}
                      </p>
                    )}
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

export default function CalendarSectionSP({ months }: { months?: BusinessMonth[] } = {}) {
  const useDb = !!months && months.length > 0;
  const ALPHAS = [0.8, 0.4];
  return (
    <section
      style={{
        width: 390,
        height: 1090,
        background: "#0a0a0a",
        display: "flex",
        flexDirection: "column",
        paddingTop: 33,
      }}
    >
      {/* ラベル + タイトル（左ラインを上の店舗セクションに合わせて paddingLeft:40 で左寄せ） */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          paddingLeft: 40,
          flexShrink: 0,
          gap: 28,
        }}
      >
        <div
          style={{
            boxSizing: "border-box",
            width: 44,
            height: 94,
            padding: "8px 7px",
            border: "1px solid rgba(255,255,255,0.3)",
            overflow: "hidden",
            flexShrink: 0,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <p
            style={{
              margin: 0,
              fontFamily: mincho,
              fontSize: 12,
              letterSpacing: "7px",
              lineHeight: "1",
              color: "#fff",
              writingMode: "vertical-rl" as const,
              whiteSpace: "nowrap",
              transform: "translateY(4px)",
            }}
          >
            営業日
          </p>
        </div>
        <p
          style={{
            fontFamily: display,
            fontSize: 38,
            letterSpacing: "-1px",
            color: "#ebe5db",
            lineHeight: "normal",
            whiteSpace: "nowrap",
            paddingTop: 26,
          }}
        >
          Business days
        </p>
      </div>

      {/* ラベル底〜凡例上: 212 - 33 - 85 = 94px */}
      <div style={{ height: 94, flexShrink: 0 }} />

      {/* 凡例 */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          paddingLeft: 16,
          gap: 18,
          flexShrink: 0,
        }}
      >
        {[
          { color: "#cc6659", label: "定休日" },
          { color: "#d68a31", label: "臨時休業" },
        ].map(({ color, label }) => (
          <div key={label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span
              style={{
                display: "inline-block",
                width: 10,
                height: 10,
                borderRadius: "50%",
                backgroundColor: color,
                flexShrink: 0,
              }}
            />
            <span
              style={{ fontFamily: sans, fontSize: 11, fontWeight: 300, color: "#fff", letterSpacing: "1px" }}
            >
              {label}
            </span>
          </div>
        ))}
      </div>

      {/* 凡例底〜カレンダー1上: 241 - 212 - 10 = 19px */}
      <div style={{ height: 19, flexShrink: 0 }} />

      {/* カレンダー（DB連動: 当月＋翌月 / 未投入時は従来の静的サンプル） */}
      {useDb ? (
        months!.slice(0, 2).map((m, i) => (
          <Fragment key={`${m.year}-${m.month}`}>
            {i > 0 && <div style={{ height: 30, flexShrink: 0 }} />}
            <div style={{ paddingLeft: 16, paddingRight: 16, flexShrink: 0 }}>
              <CalendarGrid
                year={m.year}
                month={m.month}
                startDay={m.startDay}
                totalDays={m.totalDays}
                specials={m.specials}
                topBorderAlpha={ALPHAS[i]}
              />
            </div>
          </Fragment>
        ))
      ) : (
        <>
          {/* 2026年5月 */}
          <div style={{ paddingLeft: 16, paddingRight: 16, flexShrink: 0 }}>
            <CalendarGrid year={2026} month={5} startDay={5} totalDays={31} specials={MAY_SPECIALS} topBorderAlpha={0.8} />
          </div>
          {/* カレンダー1底〜カレンダー2上: 30px */}
          <div style={{ height: 30, flexShrink: 0 }} />
          {/* 2026年6月 */}
          <div style={{ paddingLeft: 16, paddingRight: 16, flexShrink: 0 }}>
            <CalendarGrid year={2026} month={6} startDay={1} totalDays={30} specials={JUN_SPECIALS} topBorderAlpha={0.4} />
          </div>
        </>
      )}
    </section>
  );
}
