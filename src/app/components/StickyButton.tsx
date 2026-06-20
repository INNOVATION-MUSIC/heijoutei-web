"use client";

import { useState } from "react";
import ReserveModal from "./ReserveModal";
import { SECTION_LINKS } from "@/app/lib/navLinks";
import { useIsMobile } from "@/app/lib/useIsMobile";

const mincho = "'Shippori Mincho', serif";
const GOLD = "rgba(221,168,63,0.6)";

const baseBtnStyle: React.CSSProperties = {
  background: `linear-gradient(${GOLD}, ${GOLD}), #0a0a0a`,
  border: "none",
  borderRadius: 25,
  cursor: "pointer",
  color: "#fff",
  fontFamily: mincho,
  letterSpacing: "1px",
  whiteSpace: "nowrap",
  display: "flex",
  alignItems: "center",
  gap: 6,
  textDecoration: "none",
};

// PC は Figma 設計どおりの細身、SP はタップ領域を 44px 以上に拡大（レビュー#10）
const pcBtnStyle: React.CSSProperties = {
  ...baseBtnStyle,
  height: 30,
  paddingLeft: 16,
  paddingRight: 12,
  fontSize: 12,
};
const spBtnStyle: React.CSSProperties = {
  ...baseBtnStyle,
  height: 44,
  paddingLeft: 20,
  paddingRight: 16,
  fontSize: 13,
};

function ArrowIcon({ size = 10 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 10 10" fill="none" style={{ flexShrink: 0 }}>
      <path d="M2 8L8 2M8 2H3M8 2V7" stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function StickyButton() {
  const [modalOpen, setModalOpen] = useState(false);
  const isMobile = useIsMobile();

  const btnStyle = isMobile ? spBtnStyle : pcBtnStyle;
  const arrowSize = isMobile ? 12 : 10;

  return (
    <>
      <div
        style={{
          position: "fixed",
          bottom: isMobile ? 20 : 30,
          right: isMobile ? 16 : 30,
          display: "flex",
          gap: isMobile ? 12 : 10,
          zIndex: 50,
        }}
      >
        <button onClick={() => setModalOpen(true)} style={btnStyle}>
          予約する
          <ArrowIcon size={arrowSize} />
        </button>
        <a href={SECTION_LINKS.takeout} style={btnStyle}>
          テイクアウト
          <ArrowIcon size={arrowSize} />
        </a>
      </div>
      <ReserveModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
}
