"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

const DESIGN_WIDTH = 390;
const sans = "'Noto Sans JP', sans-serif";

// 通常状態 (Figma: KV_SP)
const HEADER_H_LARGE = 153;
const LOGO_W_LARGE = 168;
const LOGO_H_LARGE = 88;
const PADDING_TOP_LARGE = 32;

// スクロール後 (Figma: 追従ボタン/メニュー)
const HEADER_H_SMALL = 56;
const LOGO_W_SMALL = 85;
const LOGO_H_SMALL = 44;
const PADDING_TOP_SMALL = 6;

const EASING = "0.35s ease";

interface Props {
  onOpenMenu: () => void;
}

export default function SpStickyHeader({ onOpenMenu }: Props) {
  const [scale, setScale] = useState(1);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const updateScale = () => setScale(window.innerWidth / DESIGN_WIDTH);
    updateScale();
    window.addEventListener("resize", updateScale);
    return () => window.removeEventListener("resize", updateScale);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const headerH = scrolled ? HEADER_H_SMALL : HEADER_H_LARGE;
  const logoW   = scrolled ? LOGO_W_SMALL   : LOGO_W_LARGE;
  const logoH   = scrolled ? LOGO_H_SMALL   : LOGO_H_LARGE;
  const pt      = scrolled ? PADDING_TOP_SMALL : PADDING_TOP_LARGE;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: headerH * scale,
        zIndex: 200,
        overflow: "hidden",
        pointerEvents: "none",
        transition: `height ${EASING}`,
      }}
    >
      <div
        style={{
          width: DESIGN_WIDTH,
          height: headerH,
          transformOrigin: "top left",
          transform: `scale(${scale})`,
          background: "#0a0a0a",
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "center",
          paddingTop: pt,
          position: "relative",
          transition: `height ${EASING}, padding-top ${EASING}`,
        }}
      >
        {/* ロゴ */}
        <div
          style={{
            position: "relative",
            width: logoW,
            height: logoH,
            transition: `width ${EASING}, height ${EASING}`,
            flexShrink: 0,
          }}
        >
          <Image
            src="/images/footer_logo.png"
            alt="焼肉平壌亭"
            fill
            className="object-contain"
            sizes="168px"
          />
        </div>

        {/* ハンバーガーボタン */}
        <button
          onClick={onOpenMenu}
          aria-label="メニューを開く"
          style={{
            position: "absolute",
            right: 17,
            top: 19,
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-end",
            gap: 5,
            pointerEvents: "auto",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
            <div style={{ width: 20, height: 1, backgroundColor: "#fff" }} />
            <div style={{ width: 20, height: 1, backgroundColor: "#fff" }} />
          </div>
          <span
            style={{
              fontFamily: sans,
              fontSize: 7,
              letterSpacing: "0.2em",
              color: "rgba(255,255,255,0.5)",
              lineHeight: 1,
            }}
          >
            MENU
          </span>
        </button>
      </div>
    </div>
  );
}
