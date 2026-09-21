"use client";

import { useEffect, useRef } from "react";
import PageHeader from "./PageHeader";
import TermsBody from "./TermsBody";

// /terms PC 版（設計幅 1440）。ヘッダー + 見出し（縦書きラベル「利用規約」+ Terms）+ 本文パネル。
// 本文量でセクション全高が決まるため ResizeObserver で実測して親へ通知する（SP 版と同方式）。
// 縦位置は paddingTop（gap）で制御し marginTop / absolute は不使用。

const mincho = "'Shippori Mincho', serif";
const display = "'Cormorant Garamond', serif";
const PANEL = "#171717";
const GOLD_BAR = "rgba(217,184,107,0.8)";

export default function TermsSection({
  height,
  onOpenModal,
  onMeasured,
}: {
  height: number;
  onOpenModal: () => void;
  onMeasured: (h: number) => void;
}) {
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
    <div style={{ display: "flex", flexDirection: "column", width: 1440, height, background: "#0a0a0a", overflow: "hidden" }}>
      <div ref={contentRef} style={{ display: "flex", flexDirection: "column" }}>
        <PageHeader onOpenModal={onOpenModal} />

        {/* 見出し（縦書きラベル + Terms・/contact 等と同じ構成） */}
        <div style={{ display: "flex", gap: 49, alignItems: "flex-start", paddingLeft: 57, paddingTop: 56 }}>
          <h1 style={{ boxSizing: "border-box", width: 44, height: 94, margin: 0, padding: "8px 7px", border: "1px solid rgba(255,255,255,0.3)", overflow: "hidden", display: "flex", justifyContent: "center", alignItems: "center", flexShrink: 0, fontWeight: 400 }}>
            <span style={{ writingMode: "vertical-rl" as const, fontFamily: mincho, fontSize: 12, letterSpacing: "7px", lineHeight: "1", color: "#fff", whiteSpace: "nowrap", transform: "translateY(4px)" }}>
              利用規約
            </span>
          </h1>
          <p style={{ margin: 0, paddingTop: 0, fontFamily: display, fontSize: 80, letterSpacing: "-1px", color: "#ebe5db", lineHeight: "normal" }}>Terms</p>
        </div>

        {/* 本文パネル */}
        <div style={{ paddingLeft: 280, paddingTop: 72 }}>
          <div style={{ width: 880, background: PANEL, overflow: "hidden" }}>
            <div style={{ height: 2, background: GOLD_BAR }} />
            <div style={{ padding: "56px 64px 64px" }}>
              <TermsBody />
            </div>
          </div>
        </div>

        <div style={{ height: 120, flexShrink: 0 }} />
      </div>
    </div>
  );
}
