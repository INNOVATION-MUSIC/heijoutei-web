"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { SECTION_LINKS } from "@/app/lib/navLinks";
import { MENU_PHOTOS } from "@/app/lib/menuPhotos";
import SpButton from "./SpButton";

const mincho = "'Shippori Mincho', serif";
const display = "'Cormorant Garamond', serif";

const CARD_WIDTH = 310;
const GAP = 40;
const CARD_STEP = CARD_WIDTH + GAP;
const CARD_SET_WIDTH = CARD_STEP * MENU_PHOTOS.length;
const SPEED = 0.3;

export default function MenuSectionSP() {
  const trackRef = useRef<HTMLDivElement>(null);
  const posRef = useRef(50); // 左に50pxオフセット（Figmaの初期表示に合わせる）
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const animate = () => {
      posRef.current += SPEED;
      if (posRef.current >= CARD_SET_WIDTH) posRef.current -= CARD_SET_WIDTH;
      if (trackRef.current) {
        trackRef.current.style.transform = `translateX(-${posRef.current}px)`;
      }
      rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  return (
    <section
      style={{
        overflow: "hidden",
        width: 390,
        height: 1105,
        background: "#0a0a0a",
        display: "flex",
        flexDirection: "column",
        paddingTop: 93,
        paddingBottom: 50,
      }}
    >
      {/* ラベル + タイトル */}
      <div style={{ display: "flex", alignItems: "flex-start", paddingLeft: 40, gap: 28, flexShrink: 0 }}>
        <div
          style={{
            width: 44, height: 85,
            border: "1px solid rgba(255,255,255,0.3)",
            overflow: "hidden", flexShrink: 0,
            display: "flex", justifyContent: "center", alignItems: "center",
          }}
        >
          <p style={{ fontFamily: mincho, fontSize: 12, letterSpacing: "5px", color: "#fff", writingMode: "vertical-rl" as const, margin: 0 }}>
            おすすめ
          </p>
        </div>
        <p style={{ fontFamily: display, fontSize: 48, letterSpacing: "-1px", color: "#ebe5db", lineHeight: "normal", paddingTop: 20 }}>
          Cuisine
        </p>
      </div>

      <div style={{ height: 59, flexShrink: 0 }} />

      {/* 説明文 */}
      <p
        style={{
          paddingLeft: 39, paddingRight: 39,
          fontFamily: mincho, fontSize: 12,
          letterSpacing: "0.125em", color: "rgba(235,229,219,0.85)",
          lineHeight: "35px", flexShrink: 0,
        }}
      >
        地元・京都産和牛をはじめ、全国各地から厳選した
        <br />上質な和牛をご提供しております。
        <br />素材の良さを最大限に引き出した、こだわりの焼肉をぜひご堪能ください。
      </p>

      <div style={{ height: 28, flexShrink: 0 }} />

      {/* サブキャッチ */}
      <p
        style={{
          fontFamily: mincho, fontSize: 20, color: "#ebe5db",
          letterSpacing: "6px", lineHeight: "44px",
          paddingLeft: 105, whiteSpace: "pre", flexShrink: 0,
        }}
      >
        {`心を込めた\n     自信の一皿`}
      </p>

      <div style={{ height: 28, flexShrink: 0 }} />

      {/* 料理写真 自動横スクロール */}
      <div style={{ width: "100%", overflow: "hidden", height: 310, flexShrink: 0 }}>
        <div
          ref={trackRef}
          style={{
            display: "flex",
            gap: GAP,
            width: "max-content",
            transform: `translateX(-${posRef.current}px)`,
          }}
        >
          {[...MENU_PHOTOS, ...MENU_PHOTOS].map((photo, index) => (
            <div key={index} style={{ width: CARD_WIDTH, height: 310, flexShrink: 0, position: "relative", overflow: "hidden", background: "#472914" }}>
              <Image src={photo.src} alt="料理" fill className="object-cover" sizes="310px" />
            </div>
          ))}
        </div>
      </div>

      <div style={{ height: 50, flexShrink: 0 }} />

      <SpButton href={SECTION_LINKS.menu} label="メニュー" en="Menu" />
    </section>
  );
}
