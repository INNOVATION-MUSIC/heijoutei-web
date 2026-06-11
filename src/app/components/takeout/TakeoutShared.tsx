"use client";

import Image from "next/image";
import PageHeader from "../PageHeader";
import CommonOutlineButton from "../OutlineButton";

const mincho = "'Shippori Mincho', serif";
const sans = "'Noto Sans JP', sans-serif";
const display = "'Cormorant Garamond', serif";

export const RED = "#b0322d";
export const GOLD_BORDER = "rgba(221,168,63,0.6)";

/* ─────────── ヘッダー + Takeout 見出し（全ステップ共通） ─────────── */
export function TakeoutHeader({ onOpenModal }: { onOpenModal: () => void }) {
  return (
    <>
      <PageHeader onOpenModal={onOpenModal} />
      {/* 見出し + ヒーロー画像（Hero 上端 y=297） */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", paddingLeft: 57, paddingRight: 40, paddingTop: 144 }}>
        <div style={{ display: "flex", gap: 49, alignItems: "flex-start", paddingTop: 48 }}>
          {/* 縦書きラベル「持ち帰り」 */}
          <div style={{ boxSizing: "border-box", width: 44, height: 94, padding: "8px 7px", border: "1px solid rgba(255,255,255,0.3)", overflow: "hidden", display: "flex", justifyContent: "center", alignItems: "center", flexShrink: 0 }}>
            <span style={{ margin: 0, writingMode: "vertical-rl" as const, fontFamily: mincho, fontSize: 12, letterSpacing: "7px", lineHeight: "1", color: "#fff", whiteSpace: "nowrap", transform: "translateY(4px)" }}>
              持ち帰り
            </span>
          </div>
          <p style={{ fontFamily: display, fontSize: 80, letterSpacing: "-1px", color: "#ebe5db", lineHeight: "normal", margin: 0 }}>Takeout</p>
        </div>
        {/* ヒーロー画像（820×320） */}
        <div style={{ position: "relative", width: 820, height: 320, overflow: "hidden", flexShrink: 0, background: "#472914" }}>
          <Image src="/images/takeout_hero.webp" alt="焼肉平壌亭 テイクアウト" fill className="object-cover" sizes="820px" priority />
        </div>
      </div>
    </>
  );
}

/* ─────────── ステップアイコン ─────────── */
function StepIcon({ type, color }: { type: string; color: string }) {
  const s = { width: 13, height: 13, fill: "none", stroke: color, strokeWidth: 1.6, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  switch (type) {
    case "calendar":
      return (
        <svg viewBox="0 0 24 24" style={s}><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M3 9h18M8 3v4M16 3v4" /></svg>
      );
    case "menu":
      return (
        <svg viewBox="0 0 24 24" style={s}><rect x="3" y="4" width="18" height="16" rx="2" /><path d="M3 12h18M9 4v16" /></svg>
      );
    case "person":
      return (
        <svg viewBox="0 0 24 24" style={s}><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4 3.6-7 8-7s8 3 8 7" /></svg>
      );
    case "memo":
      return (
        <svg viewBox="0 0 24 24" style={s}><rect x="4" y="3" width="16" height="18" rx="2" /><path d="M8 8h8M8 12h8M8 16h5" /></svg>
      );
    case "check":
      return (
        <svg viewBox="0 0 24 24" style={s}><path d="M5 12l4.5 4.5L19 7" /></svg>
      );
    default:
      return null;
  }
}

const STEPS = [
  { label: "日時選択", icon: "calendar" },
  { label: "メニュー", icon: "menu" },
  { label: "情報入力", icon: "person" },
  { label: "注文確認", icon: "memo" },
  { label: "完了", icon: "check" },
];

/* ─────────── ステッパー（進捗バー・全ステップ共通） ─────────── */
export function TakeoutStepper({ current }: { current: number }) {
  // 5 つの円を均等配置し、円の間を線でつなぐ。current 以下の円・線は赤で点灯。
  return (
    <div style={{ display: "flex", justifyContent: "center", paddingTop: 14 }}>
      <div style={{ display: "flex", alignItems: "flex-start", width: 1000 }}>
        {STEPS.map((step, i) => {
          const stepNo = i + 1;
          const done = stepNo <= current;
          const circleColor = done ? RED : "#1a1a1a";
          const borderColor = done ? RED : "rgba(235,229,219,0.3)";
          const iconColor = done ? "#fff" : "rgba(235,229,219,0.5)";
          const labelColor = done ? "#ebe5db" : "rgba(235,229,219,0.5)";
          // 円と円の間の線（i 番目の線 = step i+1 と i+2 の間）。次ステップに到達済みなら赤。
          const connectorRed = stepNo + 1 <= current;
          return (
            <div key={step.label} style={{ display: "flex", alignItems: "flex-start", flex: i < STEPS.length - 1 ? "1 1 0" : "0 0 auto" }}>
              {/* 円 + ラベル */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, flexShrink: 0, width: 56 }}>
                <div style={{ width: 28, height: 28, borderRadius: "50%", background: circleColor, border: `1px solid ${borderColor}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <StepIcon type={step.icon} color={iconColor} />
                </div>
                <span style={{ fontFamily: mincho, fontSize: 13, letterSpacing: "0.05em", color: labelColor, whiteSpace: "nowrap" }}>{step.label}</span>
              </div>
              {/* 接続線（最後のステップ以外） */}
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

/* ─────────── 赤い CTA ボタン ─────────── */
export function RedButton({ label, onClick, disabled, width = 210 }: { label: string; onClick?: () => void; disabled?: boolean; width?: number }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
        width,
        height: 52,
        borderRadius: 26,
        border: "none",
        background: RED,
        opacity: disabled ? 0.4 : 1,
        cursor: disabled ? "not-allowed" : "pointer",
        transition: "opacity 0.2s, transform 0.2s",
      }}
    >
      <span style={{ fontFamily: "sans-serif", fontSize: 16, color: "#fff", lineHeight: 1 }}>·</span>
      <span style={{ fontFamily: mincho, fontSize: 16, letterSpacing: "0.08em", color: "#fff", whiteSpace: "nowrap" }}>{label}</span>
    </button>
  );
}

/* ─────────── ゴールド枠ボタン（共通 OutlineButton のラッパー・label/en API 維持） ─────────── */
export function OutlineButton({ label, en, onClick, href, width = 172 }: { label: string; en?: string; onClick?: () => void; href?: string; width?: number }) {
  return <CommonOutlineButton jp={label} en={en} onClick={onClick} href={href} width={width} align="center" />;
}

export { mincho, sans, display };
