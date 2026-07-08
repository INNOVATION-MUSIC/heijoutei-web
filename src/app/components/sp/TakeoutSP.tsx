"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import type { CSSProperties } from "react";
import { StepIcon, STEPS, RedButton, OutlineButton, mincho, sans, display, RED } from "../takeout/TakeoutShared";
import Turnstile, { turnstileEnabled } from "../Turnstile";
import {
  WEEKDAY_LABELS,
  formatJpDate,
  TAKEOUT_TIME_SLOTS,
  type CalendarDay,
  type TakeoutStore,
  type TakeoutMenuItem,
} from "@/app/lib/takeoutData";
import type { CartLine, TakeoutForm } from "../takeout/TakeoutClient";

// /takeout テイクアウト注文フロー SP 版（Figma「テイクアウト_sp」node 2216:2 / 設計幅 390）。
// PC 版 takeout/* と同じ状態・データ層（TakeoutClient）を使い、見た目のみ SP 向けに作り直したもの。
// ヘッダーは SpStickyHeader が固定表示するため各セクション先頭に 153px spacer のみ置き、
// それ以降（ヒーロー〜）を ResizeObserver で実測してセクション全高を確定する。
// 縦位置は paddingTop（gap）で制御し marginTop / 配置 absolute は不使用。

const PANEL = "#171717";
const FIELD_BG = "#171717";
const FIELD_BORDER = "1px solid rgba(235,229,219,0.12)";
const LABEL = "#ebe5db";
const GOLD = "#d9b86b";
const GOLD_BAR = "rgba(217,184,107,0.8)";
const GOLD_BORDER = "rgba(221,168,63,0.6)";
const HR = "rgba(235,229,219,0.15)";
const SELECT_BG = "rgba(217,184,107,0.18)";
const SELECT_BORDER = "rgba(217,184,107,0.55)";
const GREEN = "#6f9e6f";
const AMBER = "#d3a24e";

// 注意書き（PC Step1DateTime と同文・presentation コピー）
const NOTICE = [
  "本日より31日目までのご予約を承ります（毎週水曜日は定休日のためお渡しができません）。1つの時間帯につき受取人数制限を設けております。",
  "お持ち帰り商品の受け渡しはご注文より1時間ほどお時間を頂戴しております。",
  "お持ち帰り商品のお電話での受付時間は10:00〜21:30です。",
  "お持ち帰り商品は店舗休業日(通常は火曜日)を除く11:30〜22:00の間、店頭でのお渡しとなります。",
  "お持ち帰り商品のご注文はお電話またはオンラインで受け付けております。",
];

const COMPLETE_MESSAGE = [
  "ご注文内容を受け付けました。",
  "店舗より確認のお電話をさせていただく場合がございます。",
  "商品のお受け取り日時に、お気をつけてご来店ください。",
  "スタッフ一同、ご来店を心よりお待ちしております。",
  "",
  "キャンセルや注文内容に変更がある場合は、",
  "お手数ではございますがお電話にてお願いいたします。",
];

// SP ステッパーのラベル（Figma 準拠・step1 のみ「店舗・日時選択」）
const SP_STEP_LABELS = ["店舗・日時選択", "メニュー", "情報入力", "注文確認", "完了"];

/* ─────────── 153px ヘッダースペーサー + ResizeObserver で実測する外枠 ─────────── */
function SectionShell({
  height,
  onMeasured,
  children,
}: {
  height: number;
  onMeasured?: (h: number) => void;
  children: React.ReactNode;
}) {
  const contentRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = contentRef.current;
    if (!el || !onMeasured) return;
    const report = () => onMeasured(el.offsetHeight);
    report();
    const ro = new ResizeObserver(report);
    ro.observe(el);
    return () => ro.disconnect();
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", width: 390, height, background: "#0a0a0a", overflow: "hidden" }}>
      <div style={{ height: 153, flexShrink: 0 }} />
      <div ref={contentRef} style={{ display: "flex", flexDirection: "column" }}>
        {children}
      </div>
    </div>
  );
}

/* ─────────── ヒーロー(351×130) + 「持ち帰り / Takeout」見出し（全ステップ共通） ─────────── */
function TakeoutHeadingSP() {
  return (
    <>
      {/* ヒーロー画像ストリップ（351×130・左19pxインセット） */}
      <div style={{ paddingLeft: 19 }}>
        <div style={{ position: "relative", width: 351, height: 130, overflow: "hidden", background: "#472914" }}>
          <Image src="/images/takeout_hero.webp" alt="焼肉平壌亭 テイクアウト" fill className="object-cover" sizes="351px" preload />
        </div>
      </div>

      {/* Takeout 見出し（縦書きラベル「持ち帰り」+ Takeout・/contact など SP と統一） */}
      <div style={{ display: "flex", alignItems: "flex-start", paddingLeft: 19, paddingTop: 73, gap: 28 }}>
        <div style={{ boxSizing: "border-box", width: 44, height: 94, padding: "8px 7px", border: "1px solid rgba(255,255,255,0.3)", overflow: "hidden", flexShrink: 0, display: "flex", justifyContent: "center", alignItems: "center" }}>
          <span style={{ margin: 0, writingMode: "vertical-rl" as const, whiteSpace: "nowrap", fontFamily: mincho, fontSize: 12, letterSpacing: "7px", lineHeight: "1", color: "#fff", transform: "translateY(4px)" }}>
            持ち帰り
          </span>
        </div>
        <p style={{ paddingTop: 36, fontFamily: display, fontSize: 56, letterSpacing: "-1px", color: "#ebe5db", lineHeight: "normal", margin: 0 }}>Takeout</p>
      </div>
    </>
  );
}

/* ─────────── ステッパー（SP・5 段進捗） ─────────── */
function TakeoutStepperSP({ current }: { current: number }) {
  return (
    <div style={{ display: "flex", justifyContent: "center", paddingTop: 36 }}>
      <div style={{ display: "flex", alignItems: "flex-start", width: 350 }}>
        {STEPS.map((step, i) => {
          const stepNo = i + 1;
          const done = stepNo <= current;
          const circleColor = done ? RED : "#1a1a1a";
          const borderColor = done ? RED : "rgba(235,229,219,0.3)";
          const iconColor = done ? "#fff" : "rgba(235,229,219,0.5)";
          const labelColor = done ? "#ebe5db" : "rgba(235,229,219,0.5)";
          const connectorRed = stepNo + 1 <= current;
          return (
            <div key={step.label} style={{ display: "flex", alignItems: "flex-start", flex: i < STEPS.length - 1 ? "1 1 0" : "0 0 auto" }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, flexShrink: 0, width: 56 }}>
                <div style={{ width: 28, height: 28, borderRadius: "50%", background: circleColor, border: `1px solid ${borderColor}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <StepIcon type={step.icon} color={iconColor} />
                </div>
                <span style={{ fontFamily: mincho, fontSize: 8.5, letterSpacing: "0.02em", color: labelColor, whiteSpace: "nowrap" }}>{SP_STEP_LABELS[i]}</span>
              </div>
              {i < STEPS.length - 1 && (
                <div style={{ flex: "1 1 0", height: 28, display: "flex", alignItems: "center", marginLeft: -14, marginRight: -14 }}>
                  <div style={{ width: "100%", height: 1, background: connectorRed ? RED : "rgba(235,229,219,0.2)" }} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─────────── セクション番号見出し（例「1. 店舗を選択」） ─────────── */
function StepLabel({ children, top = 0 }: { children: React.ReactNode; top?: number }) {
  return (
    <p style={{ margin: 0, paddingLeft: 20, paddingTop: top, fontFamily: mincho, fontSize: 17, letterSpacing: "0.06em", color: "#ebe5db" }}>
      {children}
    </p>
  );
}

/* ════════════════════════ STEP 1: 日時選択 ════════════════════════ */
export function Step1DateTimeSP(p: {
  height: number;
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
  timeSlots?: string[];
  onNext: () => void;
  onMeasured?: (h: number) => void;
}) {
  const canProceed = !!p.dateIso && !!p.time;

  return (
    <SectionShell height={p.height} onMeasured={p.onMeasured}>
      <TakeoutHeadingSP />

      <TakeoutStepperSP current={1} />

      {/* 注意書きパネル */}
      <div style={{ paddingLeft: 20, paddingRight: 20, paddingTop: 40 }}>
        <div style={{ background: PANEL, padding: "22px 22px", display: "flex", flexDirection: "column", gap: 14 }}>
          <p style={{ margin: 0, fontFamily: mincho, fontSize: 14, letterSpacing: "0.04em", color: "#ebe5db", lineHeight: "22px" }}>
            1ヶ月先までのテイクアウトご予約ができます
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {NOTICE.map((n, i) => (
              <p key={i} style={{ margin: 0, fontFamily: mincho, fontSize: 11, letterSpacing: "0.02em", color: "rgba(235,229,219,0.55)", lineHeight: "18px", display: "flex", gap: 6 }}>
                <span style={{ flexShrink: 0 }}>・</span>
                <span>{n}</span>
              </p>
            ))}
          </div>
        </div>
      </div>

      {/* 1. 店舗を選択 */}
      <StepLabel top={56}>1. 店舗を選択</StepLabel>
      <div style={{ paddingLeft: 20, paddingRight: 20, paddingTop: 16 }}>
        <StoreSelectSP stores={p.stores} store={p.store} onSelectStore={p.onSelectStore} />
      </div>

      {/* 2. 受取希望日を選択 */}
      <StepLabel top={44}>2. 受取希望日を選択</StepLabel>
      <div style={{ paddingLeft: 20, paddingRight: 20, paddingTop: 16 }}>
        <CalendarSP {...p} />
      </div>

      {/* 3. 受取時間を選択 */}
      <StepLabel top={44}>3. 受取時間を選択</StepLabel>
      <div style={{ paddingLeft: 20, paddingRight: 20, paddingTop: 16 }}>
        <TimeGridSP dateIso={p.dateIso} time={p.time} onSelectTime={p.onSelectTime} timeSlots={p.timeSlots} />
      </div>

      {/* メニュー選択へ進む */}
      <div style={{ display: "flex", justifyContent: "center", paddingTop: 44 }}>
        <RedButton label="メニュー選択へ進む" onClick={p.onNext} disabled={!canProceed} width={230} />
      </div>

      <div style={{ height: 80 }} />
    </SectionShell>
  );
}

/* ─────────── 店舗セレクト（SP・全幅） ─────────── */
function StoreSelectSP({ stores, store, onSelectStore }: { stores: TakeoutStore[]; store: TakeoutStore; onSelectStore: (s: TakeoutStore) => void }) {
  const selectStyle: CSSProperties = {
    boxSizing: "border-box",
    width: "100%",
    height: 52,
    background: PANEL,
    border: "1px solid rgba(235,229,219,0.15)",
    borderRadius: 4,
    padding: "0 36px 0 16px",
    fontFamily: sans,
    fontSize: 16, // iOS フォーカス時の自動ズーム防止
    color: "#ebe5db",
    outline: "none",
    appearance: "none",
    WebkitAppearance: "none",
    cursor: "pointer",
  };
  return (
    <div style={{ position: "relative", width: "100%" }}>
      <select
        value={store.id}
        onChange={(e) => {
          const next = stores.find((s) => String(s.id) === e.target.value);
          if (next) onSelectStore(next);
        }}
        style={selectStyle}
      >
        {stores.map((s) => (
          <option key={s.id} value={s.id} style={{ background: PANEL, color: "#ebe5db" }}>{s.name}</option>
        ))}
      </select>
      <span style={{ position: "absolute", right: 16, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", fontSize: 10, color: "rgba(235,229,219,0.7)" }}>▼</span>
    </div>
  );
}

/* ─────────── カレンダー（SP・全幅 350） ─────────── */
function CalendarSP(p: {
  calendar: CalendarDay[];
  view: { year: number; month: number };
  onPrevMonth: () => void;
  onNextMonth: () => void;
  dateIso: string | null;
  onSelectDate: (iso: string) => void;
}) {
  return (
    <div style={{ width: "100%", background: PANEL, overflow: "hidden" }}>
      <div style={{ height: 2, background: GOLD_BAR }} />
      <div style={{ padding: "22px 16px 20px" }}>
        {/* 月ヘッダー */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 36, paddingBottom: 20 }}>
          <button onClick={p.onPrevMonth} style={{ background: "none", border: "none", cursor: "pointer", color: "#ebe5db", fontSize: 18, lineHeight: 1 }}>←</button>
          <span style={{ fontFamily: mincho, fontSize: 18, letterSpacing: "0.1em", color: "#f5f2ed" }}>{p.view.year}年 {p.view.month + 1}月</span>
          <button onClick={p.onNextMonth} style={{ background: "none", border: "none", cursor: "pointer", color: "#ebe5db", fontSize: 18, lineHeight: 1 }}>→</button>
        </div>

        {/* 曜日 */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", paddingBottom: 6 }}>
          {WEEKDAY_LABELS.map((w, i) => (
            <div key={w} style={{ textAlign: "center", fontFamily: sans, fontWeight: 300, fontSize: 12, color: i === 0 ? "#cc6659" : i === 6 ? "#8cadd9" : "#b8b2ad" }}>{w}</div>
          ))}
        </div>
        <div style={{ height: 1, background: "rgba(235,229,219,0.12)", marginBottom: 6 }} />

        {/* 日付グリッド */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)" }}>
          {p.calendar.map((c, i) => (
            <CalendarCellSP key={i} cell={c} selected={c.iso !== "" && c.iso === p.dateIso} onSelect={p.onSelectDate} />
          ))}
        </div>

        {/* 凡例 */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "10px 16px", paddingTop: 18, alignItems: "center" }}>
          <LegendSP mark={<span style={{ color: GREEN, fontSize: 11 }}>○</span>} label="予約可能" />
          <LegendSP mark={<span style={{ color: AMBER, fontSize: 10 }}>▲</span>} label="残りわずか" />
          <LegendSP mark={<span style={{ color: RED, fontSize: 11 }}>×</span>} label="予約不可" />
          <LegendSP mark={<span style={{ width: 12, height: 12, background: "rgba(166,49,49,0.4)", display: "inline-block", borderRadius: 2 }} />} label="定休日" />
        </div>
      </div>
    </div>
  );
}

function LegendSP({ mark, label }: { mark: React.ReactNode; label: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      {mark}
      <span style={{ fontFamily: sans, fontSize: 11, color: "rgba(235,229,219,0.7)" }}>{label}</span>
    </div>
  );
}

function CalendarCellSP({ cell, selected, onSelect }: { cell: CalendarDay; selected: boolean; onSelect: (iso: string) => void }) {
  if (cell.status === "empty") return <div style={{ height: 52 }} />;

  const numColor =
    cell.status === "past" ? "rgba(235,229,219,0.25)" : cell.weekday === 0 ? "#cc6659" : cell.weekday === 6 ? "#8cadd9" : "#ebe5db";
  const clickable = cell.status === "available" || cell.status === "few";
  const isClosed = cell.status === "closed";

  let mark: React.ReactNode = null;
  if (cell.status === "available") mark = <span style={{ color: GREEN, fontSize: 10, lineHeight: 1 }}>○</span>;
  else if (cell.status === "few") mark = <span style={{ color: AMBER, fontSize: 9, lineHeight: 1 }}>▲</span>;
  else if (cell.status === "unavailable") mark = <span style={{ color: RED, fontSize: 10, lineHeight: 1 }}>×</span>;
  else if (isClosed) mark = <span style={{ fontFamily: sans, fontSize: 9, color: "rgba(235,229,219,0.5)", lineHeight: 1 }}>定休</span>;

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

/* ─────────── 時間枠（SP・3列） ─────────── */
function TimeGridSP({ dateIso, time, onSelectTime, timeSlots }: { dateIso: string | null; time: string | null; onSelectTime: (t: string) => void; timeSlots?: string[] }) {
  const slots = timeSlots && timeSlots.length > 0 ? timeSlots : TAKEOUT_TIME_SLOTS;
  return (
    <div style={{ width: "100%", background: PANEL, overflow: "hidden" }}>
      <div style={{ height: 2, background: GOLD_BAR }} />
      <div style={{ padding: "22px 16px 24px" }}>
        {/* 選択中の受取日 */}
        <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: "4px 10px", paddingBottom: 20 }}>
          <span style={{ fontFamily: sans, fontSize: 13, color: "rgba(235,229,219,0.7)" }}>選択中の受取日:</span>
          <span style={{ fontFamily: mincho, fontSize: 15, letterSpacing: "0.04em", color: dateIso ? "#ebe5db" : "rgba(235,229,219,0.4)" }}>
            {dateIso ? `${formatJpDate(dateIso)} ${time ? time.replace(/ /g, "") : ""}` : "日付を選択してください"}
          </span>
        </div>

        {/* スロット（3列） */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 7 }}>
          {slots.map((t) => {
            const sel = t === time;
            const enabled = !!dateIso;
            return (
              <button
                key={t}
                onClick={enabled ? () => onSelectTime(t) : undefined}
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
                <span style={{ fontFamily: mincho, fontSize: 14, color: "#ebe5db", lineHeight: 1 }}>{t.replace(/ /g, "")}</span>
                <span style={{ color: GREEN, fontSize: 9, lineHeight: 1 }}>○</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════ STEP 2: メニュー ════════════════════════ */
export function Step2MenuSP(p: {
  height: number;
  menuItems: TakeoutMenuItem[];
  categories: string[];
  activeCategory: string;
  onSelectCategory: (c: string) => void;
  cart: Record<string, number>;
  onSetQty: (id: string, qty: number) => void;
  cartLines: CartLine[];
  subtotal: number;
  cartCount: number;
  onBack: () => void;
  onNext: () => void;
  onMeasured?: (h: number) => void;
}) {
  const items = p.menuItems.filter((m) => m.category === p.activeCategory);

  return (
    <SectionShell height={p.height} onMeasured={p.onMeasured}>
      <TakeoutHeadingSP />

      <TakeoutStepperSP current={2} />

      {/* カテゴリタブ（横スクロール・金下線） */}
      <div style={{ paddingTop: 40, overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
        <div style={{ display: "flex", paddingLeft: 20, paddingRight: 20, gap: 28, borderBottom: "1px solid rgba(235,229,219,0.15)", width: "max-content", minWidth: "100%", boxSizing: "border-box" }}>
          {p.categories.map((c) => {
            const active = c === p.activeCategory;
            return (
              <button
                key={c}
                onClick={() => p.onSelectCategory(c)}
                style={{ flexShrink: 0, height: 48, background: "transparent", border: "none", borderBottom: active ? `2px solid ${GOLD_BAR}` : "2px solid transparent", marginBottom: -1, cursor: "pointer", fontFamily: mincho, fontSize: 15, letterSpacing: "0.04em", color: active ? "#ebe5db" : "rgba(235,229,219,0.45)", whiteSpace: "nowrap" }}
              >
                {c}
              </button>
            );
          })}
        </div>
      </div>

      {/* 税込注記 */}
      <div style={{ paddingLeft: 20, paddingTop: 18 }}>
        <span style={{ fontFamily: sans, fontSize: 12, color: "rgba(235,229,219,0.6)" }}>※ 価格はすべて税込表示です</span>
      </div>

      {/* メニューカード（1列） */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10, paddingLeft: 20, paddingRight: 20, paddingTop: 16 }}>
        {items.map((item) => (
          <MenuCardSP key={item.id} item={item} qty={p.cart[item.id] ?? 0} onSetQty={p.onSetQty} />
        ))}
      </div>

      {/* ご注文内容（カート） */}
      <div style={{ paddingLeft: 20, paddingRight: 20, paddingTop: 30 }}>
        <CartPanelSP lines={p.cartLines} subtotal={p.subtotal} />
      </div>

      {/* ボタン */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16, paddingTop: 30 }}>
        <RedButton label="購入者情報入力へ進む" onClick={p.onNext} disabled={p.cartCount === 0} width={250} />
        <OutlineButton label="日時選択へ戻る" onClick={p.onBack} width={210} />
      </div>

      <div style={{ height: 80 }} />
    </SectionShell>
  );
}

/* ─────────── メニューカード（SP・350×150） ─────────── */
function MenuCardSP({ item, qty, onSetQty }: { item: TakeoutMenuItem; qty: number; onSetQty: (id: string, qty: number) => void }) {
  return (
    <div style={{ width: "100%", height: 150, background: PANEL, display: "flex", overflow: "hidden" }}>
      <div style={{ position: "relative", width: 130, height: 150, flexShrink: 0 }}>
        <Image src={item.img} alt={item.name} fill className="object-cover object-top" sizes="130px" />
      </div>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: "14px 16px 14px 18px", minWidth: 0 }}>
        <p style={{ margin: 0, fontFamily: mincho, fontSize: 18, letterSpacing: "0.04em", color: "#ebe5db", lineHeight: 1.1 }}>{item.name}</p>
        <p style={{ margin: 0, paddingTop: 6, fontFamily: sans, fontSize: 11, color: "rgba(235,229,219,0.55)", lineHeight: "17px", whiteSpace: "pre-line" }}>{item.desc}</p>
        <div style={{ flex: 1 }} />
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 2 }}>
            <span style={{ fontFamily: mincho, fontSize: 20, color: "#ebe5db", lineHeight: 1 }}>{item.price.toLocaleString()}</span>
            <span style={{ fontFamily: mincho, fontSize: 12, color: "#ebe5db" }}>円</span>
          </div>
          <QtyStepperSP qty={qty} onChange={(q) => onSetQty(item.id, q)} />
        </div>
      </div>
    </div>
  );
}

function QtyStepperSP({ qty, onChange }: { qty: number; onChange: (q: number) => void }) {
  const btn: CSSProperties = { background: "none", border: "none", cursor: "pointer", color: "#ebe5db", fontSize: 16, lineHeight: 1, width: 22, height: 28, display: "flex", alignItems: "center", justifyContent: "center" };
  return (
    <div style={{ display: "flex", alignItems: "center", width: 80, height: 30, borderRadius: 15, border: `1px solid ${GOLD_BORDER}`, justifyContent: "space-between", padding: "0 8px", flexShrink: 0 }}>
      <button onClick={() => onChange(Math.max(0, qty - 1))} style={btn} aria-label="減らす">−</button>
      <span style={{ fontFamily: mincho, fontSize: 14, color: "#ebe5db", minWidth: 12, textAlign: "center" }}>{qty}</span>
      <button onClick={() => onChange(qty + 1)} style={btn} aria-label="増やす">+</button>
    </div>
  );
}

/* ─────────── ご注文内容（カート・SP 全幅） ─────────── */
function CartPanelSP({ lines, subtotal }: { lines: CartLine[]; subtotal: number }) {
  return (
    <div style={{ width: "100%", background: PANEL, overflow: "hidden" }}>
      <div style={{ height: 2, background: GOLD_BAR }} />
      <div style={{ padding: "24px 22px 26px", display: "flex", flexDirection: "column" }}>
        {/* タイトル */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <BasketIcon />
          <span style={{ fontFamily: mincho, fontSize: 20, letterSpacing: "0.04em", color: "#ebe5db" }}>ご注文内容</span>
        </div>

        {/* 明細 */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14, paddingTop: 22 }}>
          {lines.length === 0 ? (
            <span style={{ fontFamily: sans, fontSize: 13, color: "rgba(235,229,219,0.5)" }}>商品が選択されていません。</span>
          ) : (
            lines.map((l) => (
              <div key={l.item.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8 }}>
                <span style={{ fontFamily: mincho, fontSize: 15, color: "#ebe5db" }}>{l.item.name}</span>
                <span style={{ fontFamily: mincho, fontSize: 13, color: "#ebe5db", display: "flex", alignItems: "baseline", gap: 4, whiteSpace: "nowrap" }}>
                  {l.item.price.toLocaleString()}<span style={{ fontSize: 11 }}>円</span>
                  <span style={{ color: "rgba(235,229,219,0.6)" }}>×</span>
                  <span style={{ color: GOLD }}>{l.qty}</span>
                  <span style={{ fontSize: 11 }}>点</span>
                </span>
              </div>
            ))
          )}
        </div>

        {/* 小計 */}
        <div style={{ height: 1, background: HR, margin: "20px 0 16px" }} />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
          <span style={{ fontFamily: mincho, fontSize: 15, color: "#ebe5db" }}>小計<span style={{ fontSize: 11, color: "rgba(235,229,219,0.6)" }}>（消費税8%含む）</span></span>
          <span style={{ fontFamily: mincho, fontSize: 15, color: "#ebe5db" }}>{subtotal.toLocaleString()}<span style={{ fontSize: 11 }}>円</span></span>
        </div>
        <p style={{ margin: "10px 0 0", fontFamily: sans, fontSize: 11, color: "rgba(235,229,219,0.45)", lineHeight: "17px" }}>
          ※軽減税率（8%）対象。<br />お支払い代金は店頭・受け取り時にお支払いいただけます。
        </p>

        {/* 合計 */}
        <div style={{ height: 1, background: HR, margin: "18px 0 16px" }} />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
          <span style={{ fontFamily: mincho, fontSize: 18, color: "#ebe5db" }}>合計</span>
          <span style={{ fontFamily: mincho, fontSize: 20, color: "#ebe5db" }}>{subtotal.toLocaleString()}<span style={{ fontSize: 12 }}>円</span></span>
        </div>
      </div>
    </div>
  );
}

function BasketIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#ebe5db" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 9h14l-1.2 9.5a2 2 0 0 1-2 1.5H8.2a2 2 0 0 1-2-1.5L5 9z" />
      <path d="M9 9 12 3l3 6" />
    </svg>
  );
}

/* ════════════════════════ STEP 3: 情報入力 ════════════════════════ */
export function Step3FormSP(p: {
  height: number;
  form: TakeoutForm;
  onChange: (f: TakeoutForm) => void;
  onBack: () => void;
  onNext: () => void;
  onMeasured?: (h: number) => void;
}) {
  const f = p.form;
  const set = (k: keyof TakeoutForm, v: string | boolean) => p.onChange({ ...f, [k]: v });

  const emailMatch = f.email.length > 0 && f.email === f.emailConfirm;
  const valid = f.name.trim() !== "" && f.kana.trim() !== "" && f.email.trim() !== "" && emailMatch && f.agreed;

  return (
    <SectionShell height={p.height} onMeasured={p.onMeasured}>
      <TakeoutHeadingSP />

      <TakeoutStepperSP current={3} />

      {/* フォーム */}
      <div style={{ paddingLeft: 20, paddingRight: 20, paddingTop: 44, display: "flex", flexDirection: "column", gap: 28 }}>
        <Field label="お名前" required>
          <SpInput value={f.name} onChange={(v) => set("name", v)} placeholder="平壌　太郎" />
        </Field>
        <Field label="フリガナ" required>
          <SpInput value={f.kana} onChange={(v) => set("kana", v)} placeholder="ヘイジョウ　タロウ" />
        </Field>
        <Field label="メールアドレス" required>
          <SpInput value={f.email} onChange={(v) => set("email", v)} placeholder="info@example.com" type="email" />
        </Field>
        <Field label="メールアドレス確認" required>
          <SpInput value={f.emailConfirm} onChange={(v) => set("emailConfirm", v)} placeholder="info@example.com" type="email" />
          {f.emailConfirm.length > 0 && !emailMatch && (
            <span style={{ fontFamily: sans, fontSize: 12, color: RED, paddingTop: 4 }}>メールアドレスが一致しません</span>
          )}
        </Field>
        <Field label="電話番号">
          <SpInput value={f.phone} onChange={(v) => set("phone", v)} placeholder="075-000-0000" type="tel" />
        </Field>
        <Field label="連絡事項">
          <textarea
            value={f.note}
            onChange={(e) => set("note", e.target.value)}
            placeholder="ご自由にご入力ください。"
            style={{ boxSizing: "border-box", width: "100%", height: 140, background: FIELD_BG, border: FIELD_BORDER, borderRadius: 4, padding: 16, fontFamily: sans, fontSize: 16, color: "#ebe5db", resize: "none", outline: "none", lineHeight: "24px" }}
          />
        </Field>
      </div>

      {/* 同意チェック */}
      <div style={{ display: "flex", justifyContent: "center", paddingTop: 30 }}>
        <label style={{ display: "flex", alignItems: "center", gap: 9, cursor: "pointer" }}>
          <input type="checkbox" checked={f.agreed} onChange={(e) => set("agreed", e.target.checked)} style={{ width: 18, height: 18, accentColor: RED, cursor: "pointer", flexShrink: 0 }} />
          <span style={{ fontFamily: sans, fontSize: 14, color: "#ebe5db" }}>プライバシーポリシーに同意する</span>
        </label>
      </div>

      {/* ボタン */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16, paddingTop: 30 }}>
        <RedButton label="確認画面へ進む" onClick={p.onNext} disabled={!valid} width={210} />
        <OutlineButton label="メニューへ戻る" onClick={p.onBack} width={210} />
      </div>

      <div style={{ height: 80 }} />
    </SectionShell>
  );
}

/* ════════════════════════ STEP 4: 注文確認 ════════════════════════ */
export function Step4ConfirmSP(p: {
  height: number;
  store: TakeoutStore;
  dateIso: string | null;
  time: string | null;
  cartLines: CartLine[];
  subtotal: number;
  form: TakeoutForm;
  onBack: () => void;
  onConfirm: () => void;
  submitting: boolean;
  submitError: string | null;
  onVerify: (token: string) => void;
  turnstileReady: boolean;
  onMeasured?: (h: number) => void;
}) {
  const dateLabel = p.dateIso ? `${formatJpDate(p.dateIso)} ${p.time ? p.time.replace(/ /g, "") : ""}` : "未選択";

  const buyerRows: { label: string; value: string; multiline?: boolean }[] = [
    { label: "お名前", value: p.form.name || "—" },
    { label: "フリガナ", value: p.form.kana || "—" },
    { label: "メールアドレス", value: p.form.email || "—" },
    { label: "電話番号", value: p.form.phone || "—" },
    { label: "連絡事項", value: p.form.note || "—", multiline: true },
  ];

  return (
    <SectionShell height={p.height} onMeasured={p.onMeasured}>
      <TakeoutHeadingSP />

      <TakeoutStepperSP current={4} />

      {/* 確認カード */}
      <div style={{ paddingLeft: 20, paddingRight: 20, paddingTop: 40 }}>
        <div style={{ background: PANEL, overflow: "hidden" }}>
          <div style={{ height: 2, background: GOLD_BAR }} />
          <div style={{ padding: "30px 22px 34px", display: "flex", flexDirection: "column" }}>
            <p style={{ margin: 0, textAlign: "center", fontFamily: mincho, fontSize: 20, letterSpacing: "0.08em", color: "#ebe5db" }}>ご予約内容の最終確認</p>

            {/* お受取予定 */}
            <p style={{ margin: 0, paddingTop: 30, fontFamily: mincho, fontSize: 16, letterSpacing: "0.05em", color: GOLD }}>お受取予定</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 14, paddingTop: 16 }}>
              <ConfirmRowSP label="受取店舗" value={p.store.name} />
              <ConfirmRowSP label="受取日時" value={dateLabel} />
            </div>

            <div style={{ height: 1, background: HR, margin: "24px 0 0" }} />

            {/* ご注文メニュー */}
            <p style={{ margin: 0, paddingTop: 24, fontFamily: mincho, fontSize: 16, letterSpacing: "0.05em", color: GOLD }}>ご注文メニュー</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 12, paddingTop: 16 }}>
              {p.cartLines.map((l) => (
                <div key={l.item.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8 }}>
                  <span style={{ fontFamily: mincho, fontSize: 15, color: "#ebe5db" }}>{l.item.name}</span>
                  <span style={{ fontFamily: mincho, fontSize: 13, color: "#ebe5db", display: "flex", alignItems: "baseline", gap: 4, whiteSpace: "nowrap" }}>
                    {l.item.price.toLocaleString()}<span style={{ fontSize: 11 }}>円</span>
                    <span style={{ color: "rgba(235,229,219,0.6)" }}>×</span>
                    <span style={{ color: GOLD }}>{l.qty}</span>
                    <span style={{ fontSize: 11 }}>点</span>
                  </span>
                </div>
              ))}
            </div>
            <div style={{ height: 1, background: HR, margin: "18px 0 16px" }} />
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <span style={{ fontFamily: mincho, fontSize: 18, color: "#ebe5db" }}>合計</span>
              <span style={{ fontFamily: mincho, fontSize: 20, color: "#ebe5db" }}>{p.subtotal.toLocaleString()}<span style={{ fontSize: 12 }}>円</span></span>
            </div>

            <div style={{ height: 1, background: HR, margin: "24px 0 0" }} />

            {/* 購入者情報 */}
            <p style={{ margin: 0, paddingTop: 24, fontFamily: mincho, fontSize: 16, letterSpacing: "0.05em", color: GOLD }}>購入者情報</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 14, paddingTop: 16 }}>
              {buyerRows.map((r) => (
                <ConfirmRowSP key={r.label} label={r.label} value={r.value} multiline={r.multiline} />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ボタン */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16, paddingTop: 40 }}>
        {p.submitError && (
          <p style={{ margin: 0, fontFamily: sans, fontSize: 13, color: "#e0726a", textAlign: "center", paddingLeft: 20, paddingRight: 20 }}>{p.submitError}</p>
        )}
        {turnstileEnabled && <Turnstile onVerify={p.onVerify} />}
        <RedButton label={p.submitting ? "送信中..." : "予約を確定する"} onClick={p.onConfirm} disabled={p.submitting || (turnstileEnabled && !p.turnstileReady)} width={210} />
        <OutlineButton label="情報入力へ戻る" onClick={p.onBack} width={210} />
      </div>

      <div style={{ height: 80 }} />
    </SectionShell>
  );
}

function ConfirmRowSP({ label, value, multiline }: { label: string; value: string; multiline?: boolean }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <span style={{ fontFamily: mincho, fontSize: 13, letterSpacing: "0.04em", color: "rgba(235,229,219,0.7)" }}>{label}</span>
      <span style={{ fontFamily: mincho, fontSize: 15, color: "#ebe5db", lineHeight: multiline ? "24px" : "normal", whiteSpace: multiline ? "pre-wrap" : "normal", wordBreak: "break-all" }}>{value}</span>
    </div>
  );
}

/* ════════════════════════ STEP 5: 完了 ════════════════════════ */
export function Step5CompleteSP({ height, store, onMeasured }: { height: number; store: TakeoutStore; onMeasured?: (h: number) => void }) {
  return (
    <SectionShell height={height} onMeasured={onMeasured}>
      <TakeoutHeadingSP />

      <TakeoutStepperSP current={5} />

      {/* 完了カード */}
      <div style={{ paddingLeft: 20, paddingRight: 20, paddingTop: 40 }}>
        <div style={{ background: PANEL, overflow: "hidden" }}>
          <div style={{ height: 2, background: GOLD_BAR }} />
          <div style={{ padding: "40px 20px 44px", display: "flex", flexDirection: "column", alignItems: "center" }}>
            <p style={{ margin: 0, fontFamily: mincho, fontSize: 20, letterSpacing: "0.06em", color: "#ebe5db", textAlign: "center" }}>ご注文ありがとうございました</p>

            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, paddingTop: 34 }}>
              {COMPLETE_MESSAGE.map((line, i) => (
                <p key={i} style={{ margin: 0, fontFamily: mincho, fontSize: 13, letterSpacing: "0.05em", color: "rgba(235,229,219,0.75)", lineHeight: "24px", textAlign: "center", minHeight: line === "" ? 10 : undefined }}>{line}</p>
              ))}
            </div>

            <a href={`tel:${store.tel.replace(/[^0-9]/g, "")}`} style={{ margin: 0, paddingTop: 34, fontFamily: mincho, fontSize: 26, letterSpacing: "0.06em", color: GOLD, textDecoration: "none", whiteSpace: "nowrap" }}>{store.tel}</a>
            <p style={{ margin: 0, paddingTop: 10, fontFamily: sans, fontSize: 13, color: "rgba(235,229,219,0.65)" }}>受付時間　10:00〜21:30</p>
          </div>
        </div>
      </div>

      {/* トップページへ */}
      <div style={{ display: "flex", justifyContent: "center", paddingTop: 40 }}>
        <OutlineButton label="トップページへ" href="/" width={210} />
      </div>

      <div style={{ height: 80 }} />
    </SectionShell>
  );
}

/* ─────────── フォーム部品（SP） ─────────── */
function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
        <span style={{ fontFamily: mincho, fontSize: 15, letterSpacing: "0.04em", color: LABEL }}>{label}</span>
        {required && <span style={{ fontFamily: sans, fontSize: 14, color: RED }}>※</span>}
      </div>
      {children}
    </div>
  );
}

// fontSize 16 は iOS のフォーカス時自動ズームを防ぐため（SP のタップ操作性確保）。
function SpInput({ value, onChange, placeholder, type = "text" }: { value: string; onChange: (v: string) => void; placeholder?: string; type?: string }) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      style={{ boxSizing: "border-box", width: "100%", height: 48, background: FIELD_BG, border: FIELD_BORDER, borderRadius: 4, padding: "0 16px", fontFamily: sans, fontSize: 16, color: "#ebe5db", outline: "none" }}
    />
  );
}
