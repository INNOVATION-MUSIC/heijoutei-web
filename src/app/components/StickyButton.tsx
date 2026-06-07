"use client";

import { useState } from "react";
import ReserveModal from "./ReserveModal";
import { SECTION_LINKS } from "@/app/lib/navLinks";

const mincho = "'Shippori Mincho', serif";

const btnStyle: React.CSSProperties = {
  height: 30,
  paddingLeft: 16,
  paddingRight: 12,
  background: "rgba(221,168,63,0.6)",
  border: "none",
  borderRadius: 25,
  cursor: "pointer",
  color: "#fff",
  fontFamily: mincho,
  fontSize: 12,
  letterSpacing: "1px",
  whiteSpace: "nowrap",
  display: "flex",
  alignItems: "center",
  gap: 6,
  textDecoration: "none",
};

function ArrowIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" style={{ flexShrink: 0 }}>
      <path d="M2 8L8 2M8 2H3M8 2V7" stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function StickyButton() {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <div style={{ position: "fixed", bottom: 30, right: 30, display: "flex", gap: 10, zIndex: 50 }}>
        <button onClick={() => setModalOpen(true)} style={btnStyle}>
          予約する
          <ArrowIcon />
        </button>
        <a href={SECTION_LINKS.takeout} style={btnStyle}>
          テイクアウト
          <ArrowIcon />
        </a>
      </div>
      <ReserveModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
}
