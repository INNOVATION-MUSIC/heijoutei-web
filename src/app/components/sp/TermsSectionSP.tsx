"use client";

import { useEffect, useRef } from "react";
import TermsBody from "../TermsBody";

// /terms SP 版（設計幅 390）。ヘッダーは SpStickyHeader が固定表示するため先頭に 153px spacer のみ置く。
// 本文量で全高が決まるため ResizeObserver で実測して親へ通知する（/contact SP と同方式）。

const mincho = "'Shippori Mincho', serif";
const display = "'Cormorant Garamond', serif";
const PANEL = "#171717";
const GOLD_BAR = "rgba(217,184,107,0.8)";

export default function TermsSectionSP({ height, onMeasured }: { height: number; onMeasured: (h: number) => void }) {
  const contentRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;
    const report = () => onMeasured(el.offsetHeight);
    report();
    const ro = new ResizeObserver(report);
    ro.observe(el);
    return () => ro.disconnect();
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", width: 390, height, background: "#0a0a0a", overflow: "hidden" }}>
      <div ref={contentRef} style={{ display: "flex", flexDirection: "column" }}>
        <div style={{ height: 153, flexShrink: 0 }} />

        {/* 見出し（縦書きラベル + Terms・/contact SP と統一） */}
        <div style={{ display: "flex", alignItems: "flex-start", paddingLeft: 19, paddingTop: 24, gap: 28 }}>
          <h1 style={{ boxSizing: "border-box", width: 44, height: 94, margin: 0, padding: "8px 7px", border: "1px solid rgba(255,255,255,0.3)", overflow: "hidden", flexShrink: 0, display: "flex", justifyContent: "center", alignItems: "center", fontWeight: 400 }}>
            <span style={{ writingMode: "vertical-rl" as const, whiteSpace: "nowrap", fontFamily: mincho, fontSize: 12, letterSpacing: "7px", lineHeight: "1", color: "#fff", transform: "translateY(4px)" }}>
              利用規約
            </span>
          </h1>
          <p style={{ margin: 0, paddingTop: 36, fontFamily: display, fontSize: 56, letterSpacing: "-1px", color: "#ebe5db", lineHeight: "normal" }}>Terms</p>
        </div>

        {/* 本文パネル */}
        <div style={{ paddingLeft: 20, paddingRight: 20, paddingTop: 40 }}>
          <div style={{ background: PANEL, overflow: "hidden" }}>
            <div style={{ height: 2, background: GOLD_BAR }} />
            <div style={{ padding: "32px 20px 40px" }}>
              <TermsBody sp />
            </div>
          </div>
        </div>

        <div style={{ height: 80, flexShrink: 0 }} />
      </div>
    </div>
  );
}
