"use client";

import { useState } from "react";

const mincho = "'Shippori Mincho', serif";
const sans = "'Noto Sans JP', sans-serif";
const GOLD = "rgba(221,168,63,0.6)"; // 金枠ボタンのボーダー色

/**
 * サイト共通の金枠ボタン（ドット + 和文ラベル + 英字ラベル）。
 * ホバーで背景がボーダー色（金）に塗りつぶされ、テキストは白・和文は太字になる。
 * 背景色・色・太さは transition でなめらかに切り替える。
 *
 * href を渡すと <a>、onClick を渡すと <button> としてレンダリングする。
 */
export default function OutlineButton({
  jp,
  en,
  href,
  onClick,
  width = 171,
  height = 50,
  align = "left",
  padL = 22,
  disabled = false,
}: {
  jp: string;
  en?: string;
  href?: string;
  onClick?: () => void;
  width?: number;
  height?: number;
  /** 中身の寄せ方。left=左寄せ（paddingLeft=padL）/ center=中央寄せ */
  align?: "left" | "center";
  /** align="left" 時の左パディング（既定 22） */
  padL?: number;
  /** 無効状態（薄く表示・ホバー無効・操作不可） */
  disabled?: boolean;
}) {
  const [hover, setHover] = useState(false);
  const active = hover && !disabled; // ホバー演出を出すか

  const style: React.CSSProperties = {
    boxSizing: "border-box",
    width,
    height,
    borderRadius: height / 2,
    border: `1px solid ${GOLD}`,
    background: active ? GOLD : "transparent",
    opacity: disabled ? 0.4 : 1,
    cursor: disabled ? "not-allowed" : "pointer",
    pointerEvents: disabled ? "none" : "auto",
    display: "flex",
    alignItems: "center",
    justifyContent: align === "center" ? "center" : "flex-start",
    flexShrink: 0,
    gap: 8,
    padding: 0,
    paddingLeft: align === "center" ? 0 : padL,
    textDecoration: "none",
    transition: "background-color 0.3s ease",
  };

  const handlers = {
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
  };

  const inner = (
    <>
      <span style={{ fontFamily: "sans-serif", fontSize: 16, color: "#fff", lineHeight: 1 }}>·</span>
      <span style={{ fontFamily: mincho, fontSize: 12, fontWeight: active ? 700 : 400, letterSpacing: "0.083em", color: "#fff", whiteSpace: "nowrap", transition: "font-weight 0.3s ease" }}>{jp}</span>
      {en && (
        <span style={{ fontFamily: sans, fontSize: 12, fontWeight: 700, letterSpacing: "0.125em", color: active ? "#fff" : "#ebe5db", whiteSpace: "nowrap", transition: "color 0.3s ease" }}>{en}</span>
      )}
    </>
  );

  if (href) {
    return (
      <a href={href} style={style} {...handlers}>
        {inner}
      </a>
    );
  }
  return (
    <button type="button" onClick={onClick} disabled={disabled} style={style} {...handlers}>
      {inner}
    </button>
  );
}
