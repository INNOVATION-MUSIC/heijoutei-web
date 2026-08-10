"use client";

import { TakeoutHeader, TakeoutStepper, RedButton, mincho, sans } from "./TakeoutShared";
import {
  WEEKDAY_LABELS,
  formatJpDate,
  type CalendarDay,
  type TakeoutStore,
  type TimeSlotView,
} from "@/app/lib/takeoutData";

const PANEL = "#171717";
const GOLD_BAR = "rgba(217,184,107,0.8)";
const SELECT_BG = "rgba(217,184,107,0.18)";
const SELECT_BORDER = "rgba(217,184,107,0.55)";
const GREEN = "#6f9e6f";
const AMBER = "#d3a24e";

const NOTICE = [
  "ご注文されてから商品のお渡しまでに、最短でも60分頂戴しております。",
  "お急ぎの方は直接お電話でご注文ください。",
];

// 予約に関する注意事項（締切）
const RESERVE_NOTES: [string, string][] = [
  ["予約受付締切", "1時間前まで"],
  ["キャンセル締切", "4時間前まで"],
];

type Props = {
  height: number;
  onOpenModal: () => void;
  stores: TakeoutStore[];
  store: TakeoutStore;
  onSelectStore: (s: TakeoutStore) => void;
  calendar: CalendarDay[];
  view: { year: number; month: number };
  onPrevMonth: () => void;
  onNextMonth: () => void;
  dateIso: string | null;
  onSelectDate: (iso: string) => void;
  time: string | null;
  onSelectTime: (t: string) => void;
  timeSlots: TimeSlotView[]; // 選択中受取日の受取時間枠（満枠/受付締切のdisabledを含む）
  onNext: () => void;
};

export default function Step1DateTime(p: Props) {
  const canProceed = !!p.dateIso && !!p.time;

  return (
    <div style={{ display: "flex", flexDirection: "column", width: 1440, height: p.height, background: "#0a0a0a", overflow: "hidden" }}>
      <TakeoutHeader onOpenModal={p.onOpenModal} />

      {/* ステッパー */}
      <div style={{ paddingTop: 120 }}>
        <TakeoutStepper current={1} />
      </div>

      {/* 注意書きパネル */}
      <div style={{ paddingLeft: 140, paddingRight: 140, paddingTop: 40 }}>
        <div style={{ width: 1160, background: PANEL, padding: "28px 48px", display: "flex", flexDirection: "column", gap: 18 }}>
          {/* リード */}
          <p style={{ margin: 0, fontFamily: mincho, fontSize: 18, letterSpacing: "0.06em", color: "#d9b86b" }}>
            お店の味をご家庭でも楽しめます！
          </p>
          {/* 注意事項 */}
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {NOTICE.map((n, i) => (
              <p key={i} style={{ margin: 0, fontFamily: mincho, fontSize: 13, letterSpacing: "0.04em", color: "rgba(235,229,219,0.65)", lineHeight: "22px", display: "flex", gap: 8 }}>
                <span style={{ color: "rgba(217,184,107,0.7)" }}>・</span>
                <span>{n}</span>
              </p>
            ))}
          </div>
          {/* 予約に関する注意事項 */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10, borderTop: "1px solid rgba(234,229,219,0.15)", paddingTop: 18 }}>
            <p style={{ margin: 0, fontFamily: mincho, fontSize: 14, letterSpacing: "0.08em", color: "#ebe5db" }}>予約に関する注意事項</p>
            <div style={{ display: "flex", gap: 64 }}>
              {RESERVE_NOTES.map(([label, val], i) => (
                <div key={i} style={{ display: "flex", alignItems: "baseline", gap: 16 }}>
                  <span style={{ fontFamily: mincho, fontSize: 12, letterSpacing: "0.06em", color: "rgba(235,229,219,0.55)" }}>{label}</span>
                  <span style={{ fontFamily: mincho, fontSize: 16, letterSpacing: "0.04em", color: "#d9b86b" }}>{val}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 1. 店舗を選択 */}
      <div style={{ display: "flex", alignItems: "center", paddingLeft: 140, paddingTop: 74 }}>
        <p style={{ margin: 0, width: 211, fontFamily: mincho, fontSize: 18, letterSpacing: "0.06em", color: "#ebe5db" }}>1. 店舗を選択</p>
        <StoreSelect stores={p.stores} store={p.store} onSelectStore={p.onSelectStore} />
      </div>

      {/* 受取日 + 受取時間 */}
      <div style={{ display: "flex", gap: 40, paddingLeft: 140, paddingRight: 60, paddingTop: 50 }}>
        {/* 2. 受取希望日 */}
        <div style={{ width: 620, display: "flex", flexDirection: "column", gap: 24 }}>
          <p style={{ margin: 0, fontFamily: mincho, fontSize: 18, letterSpacing: "0.06em", color: "#ebe5db" }}>2. 受取希望日を選択</p>
          <Calendar {...p} />
        </div>

        {/* 3. 受取時間 */}
        <div style={{ width: 580, display: "flex", flexDirection: "column", gap: 24 }}>
          <p style={{ margin: 0, fontFamily: mincho, fontSize: 18, letterSpacing: "0.06em", color: "#ebe5db" }}>3. 受取時間を選択</p>
          <TimeGrid dateIso={p.dateIso} time={p.time} onSelectTime={p.onSelectTime} timeSlots={p.timeSlots} />
        </div>
      </div>

      {/* 次へ（時間列の下に中央寄せ） */}
      <div style={{ display: "flex", paddingTop: 50 }}>
        <div style={{ width: 760 }} />
        <div style={{ flex: 1, display: "flex", justifyContent: "center" }}>
          <RedButton label="メニュー選択へ進む" onClick={p.onNext} disabled={!canProceed} width={230} />
        </div>
      </div>

      <div style={{ flex: 1 }} />
    </div>
  );
}

/* ─────────── 店舗セレクト ─────────── */
function StoreSelect({ stores, store, onSelectStore }: { stores: TakeoutStore[]; store: TakeoutStore; onSelectStore: (s: TakeoutStore) => void }) {
  return (
    <div style={{ position: "relative", width: 242 }}>
      <select
        value={store.id}
        onChange={(e) => {
          const next = stores.find((s) => String(s.id) === e.target.value);
          if (next) onSelectStore(next);
        }}
        style={{
          width: "100%",
          height: 52,
          background: PANEL,
          border: "1px solid rgba(235,229,219,0.15)",
          borderRadius: 4,
          padding: "0 36px 0 16px",
          fontFamily: sans,
          fontSize: 14,
          color: "#ebe5db",
          outline: "none",
          appearance: "none",
          WebkitAppearance: "none",
          cursor: "pointer",
        }}
      >
        {stores.map((s) => (
          <option key={s.id} value={s.id} style={{ background: PANEL, color: "#ebe5db" }}>{s.name}</option>
        ))}
      </select>
      {/* ▼ */}
      <span style={{ position: "absolute", right: 16, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", fontSize: 10, color: "rgba(235,229,219,0.7)" }}>▼</span>
    </div>
  );
}

/* ─────────── カレンダー ─────────── */
function Calendar(p: Props) {
  return (
    <div style={{ width: 620, background: PANEL, overflow: "hidden" }}>
      <div style={{ height: 2, background: GOLD_BAR }} />
      <div style={{ padding: "28px 30px 24px" }}>
        {/* 月ヘッダー */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 40, paddingBottom: 24 }}>
          <button onClick={p.onPrevMonth} style={{ background: "none", border: "none", cursor: "pointer", color: "#ebe5db", fontSize: 20, lineHeight: 1 }}>←</button>
          <span style={{ fontFamily: mincho, fontSize: 20, letterSpacing: "0.1em", color: "#f5f2ed" }}>{p.view.year}年 {p.view.month + 1}月</span>
          <button onClick={p.onNextMonth} style={{ background: "none", border: "none", cursor: "pointer", color: "#ebe5db", fontSize: 20, lineHeight: 1 }}>→</button>
        </div>

        {/* 曜日 */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", paddingBottom: 8 }}>
          {WEEKDAY_LABELS.map((w, i) => (
            <div key={w} style={{ textAlign: "center", fontFamily: "'Noto Sans JP', sans-serif", fontWeight: 300, fontSize: 12, color: i === 0 ? "#cc6659" : i === 6 ? "#8cadd9" : "#b8b2ad" }}>{w}</div>
          ))}
        </div>
        <div style={{ height: 1, background: "rgba(235,229,219,0.12)", marginBottom: 8 }} />

        {/* 日付グリッド */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)" }}>
          {p.calendar.map((c, i) => (
            <CalendarCell key={i} cell={c} selected={c.iso !== "" && c.iso === p.dateIso} onSelect={p.onSelectDate} />
          ))}
        </div>

        {/* 凡例 */}
        <div style={{ display: "flex", gap: 22, paddingTop: 20, alignItems: "center" }}>
          <Legend mark={<span style={{ color: GREEN, fontSize: 11 }}>○</span>} label="予約可能" />
          <Legend mark={<span style={{ color: AMBER, fontSize: 10 }}>▲</span>} label="残りわずか" />
          <Legend mark={<span style={{ color: "#b0322d", fontSize: 11 }}>×</span>} label="予約不可" />
          <Legend mark={<span style={{ width: 12, height: 12, background: "rgba(166,49,49,0.4)", display: "inline-block", borderRadius: 2 }} />} label="定休日" />
        </div>
      </div>
    </div>
  );
}

function Legend({ mark, label }: { mark: React.ReactNode; label: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      {mark}
      <span style={{ fontFamily: "'Noto Sans JP', sans-serif", fontSize: 11, color: "rgba(235,229,219,0.7)" }}>{label}</span>
    </div>
  );
}

function CalendarCell({ cell, selected, onSelect }: { cell: CalendarDay; selected: boolean; onSelect: (iso: string) => void }) {
  if (cell.status === "empty") return <div style={{ height: 52 }} />;

  const numColor =
    cell.status === "past" ? "rgba(235,229,219,0.25)" : cell.weekday === 0 ? "#cc6659" : cell.weekday === 6 ? "#8cadd9" : "#ebe5db";
  const clickable = cell.status === "available" || cell.status === "few";
  const isClosed = cell.status === "closed";

  let mark: React.ReactNode = null;
  if (cell.status === "available") mark = <span style={{ color: GREEN, fontSize: 10, lineHeight: 1 }}>○</span>;
  else if (cell.status === "few") mark = <span style={{ color: AMBER, fontSize: 9, lineHeight: 1 }}>▲</span>;
  else if (cell.status === "unavailable") mark = <span style={{ color: "#b0322d", fontSize: 10, lineHeight: 1 }}>×</span>;
  else if (isClosed) mark = <span style={{ fontFamily: "'Noto Sans JP', sans-serif", fontSize: 9, color: "rgba(235,229,219,0.5)", lineHeight: 1 }}>定休</span>;

  return (
    <div style={{ height: 52, padding: 2 }}>
      <div
        onClick={clickable ? () => onSelect(cell.iso) : undefined}
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 3,
          borderRadius: 2,
          cursor: clickable ? "pointer" : "default",
          background: selected ? SELECT_BG : isClosed ? "rgba(166,49,49,0.22)" : "transparent",
          border: selected ? `1px solid ${SELECT_BORDER}` : "1px solid transparent",
        }}
      >
        <span style={{ fontFamily: mincho, fontSize: 15, color: numColor, lineHeight: 1 }}>{cell.day}</span>
        {mark}
      </div>
    </div>
  );
}

/* ─────────── 時間枠 ─────────── */
function TimeGrid({ dateIso, time, onSelectTime, timeSlots }: { dateIso: string | null; time: string | null; onSelectTime: (t: string) => void; timeSlots: TimeSlotView[] }) {
  return (
    <div style={{ width: 580, background: PANEL, overflow: "hidden" }}>
      <div style={{ height: 2, background: GOLD_BAR }} />
      <div style={{ padding: "24px 28px 28px" }}>
        {/* 選択中の受取日 */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, paddingBottom: 22 }}>
          <span style={{ fontFamily: "'Noto Sans JP', sans-serif", fontSize: 13, color: "rgba(235,229,219,0.7)" }}>選択中の受取日:</span>
          <span style={{ fontFamily: mincho, fontSize: 16, letterSpacing: "0.04em", color: dateIso ? "#ebe5db" : "rgba(235,229,219,0.4)" }}>
            {dateIso ? `${formatJpDate(dateIso)} ${time ? time.replace(/ /g, "") : ""}` : "日付を選択してください"}
          </span>
        </div>

        {/* スロット */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 9 }}>
          {timeSlots.map((slot) => {
            const sel = slot.label === time;
            const enabled = !slot.disabled;
            return (
              <button
                key={slot.label}
                onClick={enabled ? () => onSelectTime(slot.label) : undefined}
                disabled={!enabled}
                style={{
                  height: 50,
                  borderRadius: 6,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 2,
                  background: sel ? SELECT_BG : "transparent",
                  border: sel ? `1px solid ${SELECT_BORDER}` : "1px solid rgba(235,229,219,0.12)",
                  cursor: enabled ? "pointer" : "not-allowed",
                  opacity: enabled ? 1 : 0.4,
                }}
              >
                <span style={{ fontFamily: mincho, fontSize: 13, color: "#ebe5db", lineHeight: 1 }}>{slot.label}</span>
                {slot.disabled && slot.reason ? (
                  <span style={{ color: slot.reason === "full" ? "#b0322d" : "rgba(235,229,219,0.5)", fontSize: 9, lineHeight: 1 }}>
                    {slot.reason === "full" ? "満席" : "受付終了"}
                  </span>
                ) : (
                  <span style={{ color: GREEN, fontSize: 9, lineHeight: 1 }}>○</span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
