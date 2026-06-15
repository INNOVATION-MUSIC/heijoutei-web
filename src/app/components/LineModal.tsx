"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { LINE_STORE_LINKS } from "@/app/lib/navLinks";

interface Props {
  open: boolean;
  onClose: () => void;
}

const LINE_STORES = [
  { name: "亀岡店",    href: LINE_STORE_LINKS.kameoka },
  { name: "園部店",    href: LINE_STORE_LINKS.sonobe },
  { name: "福知山店",  href: LINE_STORE_LINKS.fukuchiyama },
  { name: "焼肉ゆらの", href: LINE_STORE_LINKS.yurano },
];

const mincho = "'Shippori Mincho', serif";
const sans = "'Noto Sans JP', sans-serif";

function CloseIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
      <line x1="0.5" y1="0.5" x2="14.5" y2="14.5" stroke="white" strokeLinecap="round" />
      <line x1="14.5" y1="0.5" x2="0.5" y2="14.5" stroke="white" strokeLinecap="round" />
    </svg>
  );
}

export default function LineModal({ open, onClose }: Props) {
  const [isClosing, setIsClosing] = useState(false);

  // body スクロールロックは外部システムの同期なので effect で行う（setState ではないため lint OK）。
  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const handleClose = () => setIsClosing(true);

  const handleAnimationEnd = () => {
    if (isClosing) {
      setIsClosing(false);
      onClose();
    }
  };

  // open 中、または閉じるアニメーション中だけマウントする（visible state を effect で立てない）。
  if (!open && !isClosing) return null;

  const overlayAnim = isClosing
    ? "modal-overlay-out 0.22s ease both"
    : "modal-overlay-in 0.25s ease both";
  const panelAnim = isClosing
    ? "modal-panel-out 0.22s ease both"
    : "modal-panel-in 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) both";

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        animation: overlayAnim,
      }}
      onClick={handleClose}
    >
      {/* 暗幕オーバーレイ */}
      <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.6)" }} />

      {/* パネル: Figma w=342, bg=#273528 */}
      <div
        style={{
          position: "relative",
          width: 342,
          background: "#273528",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "46px 0 44px",
          animation: panelAnim,
        }}
        onClick={(e) => e.stopPropagation()}
        onAnimationEnd={handleAnimationEnd}
      >
        {/* × 閉じるボタン: Figma left=337(section) = 337-25(panel-left) = 312 from panel left */}
        <button
          onClick={handleClose}
          aria-label="閉じる"
          style={{
            position: "absolute",
            top: 15,
            right: 16,
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: 4,
          }}
        >
          <CloseIcon />
        </button>

        {/* タイトル: Figma fontSize=18, fontMedium, letterSpacing=4px, lineHeight=31px */}
        <p
          style={{
            fontFamily: sans,
            fontSize: 18,
            fontWeight: 500,
            letterSpacing: "4px",
            color: "#ebe5db",
            textAlign: "center",
            lineHeight: "31px",
            marginBottom: 47,
            paddingLeft: "4px", // letterSpacing末尾補正
          }}
        >
          LINE登録でお得情報GET
          <br />
          ともだち募集中!!
        </p>

        {/* 店舗ボタン: gap=30 (345→415→485→555 = 70px間隔, 70-40=30px gap) */}
        <div style={{ display: "flex", flexDirection: "column", gap: 30, alignItems: "center" }}>
          {LINE_STORES.map(({ name, href }) => (
            <a
              key={name}
              href={href}
              style={{
                width: 200,
                height: 40,
                borderRadius: 25,
                border: "1px solid rgba(57,176,61,0.6)",
                background: "transparent",
                textDecoration: "none",
                display: "flex",
                alignItems: "center",
                paddingLeft: 15,
                gap: 10,
              }}
            >
              {/* LINEアイコン: Figma size=23×23 */}
              <div style={{ position: "relative", width: 23, height: 23, flexShrink: 0 }}>
                <Image
                  src="/images/line_icon.webp"
                  alt="LINE"
                  fill
                  className="object-contain"
                  sizes="23px"
                />
              </div>

              {/* 店舗名 */}
              <span
                style={{
                  fontFamily: mincho,
                  fontSize: 12,
                  letterSpacing: "1px",
                  color: "#fff",
                  flex: 1,
                }}
              >
                {name}
              </span>

              {/* 友だち追加 */}
              <span
                style={{
                  fontFamily: sans,
                  fontSize: 12,
                  fontWeight: 700,
                  letterSpacing: "1.5px",
                  color: "#ebe5db",
                  paddingRight: 14,
                }}
              >
                友だち追加
              </span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
