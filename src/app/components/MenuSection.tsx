"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";

const mincho = "'Shippori Mincho', serif";
const sans = "'Noto Sans JP', sans-serif";

const PHOTOS = [
  { src: "/images/cuisine1.jpg" },
  { src: "/images/cuisine2.jpg" },
  { src: "/images/cuisine3.jpg" },
  { src: "/images/cuisine4.jpg" },
];

const CARD_WIDTH = 400;
const GAP = 50;
const CARD_STEP = CARD_WIDTH + GAP; // 450px
const CARD_SET_WIDTH = CARD_STEP * PHOTOS.length; // 1800px
const SPEED = 0.3;

export default function MenuSection() {
  const trackRef = useRef<HTMLDivElement>(null);
  const posRef = useRef(33); // Figmaの初期表示(-33px)に合わせてオフセット
  const pausedRef = useRef(false);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const animate = () => {
      if (!pausedRef.current && trackRef.current) {
        posRef.current += SPEED;
        if (posRef.current >= CARD_SET_WIDTH) posRef.current -= CARD_SET_WIDTH;
        trackRef.current.style.transform = `translateX(-${posRef.current}px)`;
      }
      rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  return (
    <section className="relative bg-[#0a0a0a] overflow-hidden" style={{ width: 1440, height: 1120 }}>
      {/* ラベル + Cuisine タイトル */}
      <div className="absolute" style={{ left: 93, top: 140, display: "flex", alignItems: "center", gap: 69 }}>
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", width: 44, height: 85, border: "1px solid rgba(255,255,255,0.3)", flexShrink: 0, overflow: "hidden" }}>
          <p style={{ margin: 0, fontFamily: mincho, fontSize: 12, letterSpacing: "7px", lineHeight: "1", color: "#fff", writingMode: "vertical-rl" as const, transform: "translateY(4px)" }}>おすすめ</p>
        </div>
        <p style={{ fontFamily: mincho, fontSize: 80, letterSpacing: "-1px", color: "#ebe5db", lineHeight: "normal" }}>Cuisine</p>
      </div>

      {/* 右縦書き */}
      <p className="absolute" style={{ left: 1068, top: 156, width: 28, fontFamily: mincho, fontSize: 32, color: "#fff", writingMode: "vertical-rl" as const, letterSpacing: "13px" }}>心を込めた</p>
      <p className="absolute" style={{ left: 1005, top: 226, width: 28, fontFamily: mincho, fontSize: 32, color: "#fff", writingMode: "vertical-rl" as const, letterSpacing: "13px" }}>自信の一皿</p>

      {/* 説明文 */}
      <p className="absolute" style={{ left: 206, top: 262, width: 596, fontFamily: mincho, fontSize: 15, fontWeight: 400, letterSpacing: "0.1em", color: "rgba(235,229,219,0.85)", lineHeight: "40px" }}>
        地元・京都産和牛をはじめ、全国各地から厳選した<br />上質な和牛をご提供しております。<br />素材の良さを最大限に引き出した、こだわりの焼肉をぜひご堪能ください。
      </p>

      {/* メニューボタン */}
      <a href="#" className="absolute flex items-center overflow-hidden" style={{ left: 206, top: 424, width: 171, height: 50, borderRadius: 25, border: "1px solid rgba(221,168,63,0.6)", textDecoration: "none" }}>
        <span className="absolute" style={{ left: 22, top: 11, fontFamily: "sans-serif", fontSize: 16, color: "#fff" }}>·</span>
        <span className="absolute" style={{ left: 35, top: 15, fontFamily: mincho, fontSize: 12, letterSpacing: "0.083em", color: "#fff" }}>メニュー</span>
        <span className="absolute" style={{ left: 105, top: 15, fontFamily: sans, fontSize: 12, fontWeight: 700, letterSpacing: "0.125em", color: "#ebe5db" }}>Menu</span>
      </a>

      {/* 料理写真 自動横スクロール */}
      <div className="absolute" style={{ top: 538, left: 0, width: 1440, overflow: "hidden" }}>
        <div
          ref={trackRef}
          style={{ display: "flex", gap: GAP, width: "max-content", transform: `translateX(-${posRef.current}px)` }}
          onMouseEnter={() => { pausedRef.current = true; }}
          onMouseLeave={() => { pausedRef.current = false; }}
        >
          {[...PHOTOS, ...PHOTOS].map((photo, index) => (
            <div key={index} style={{ width: CARD_WIDTH, height: 400, flexShrink: 0, position: "relative", overflow: "hidden", background: "#472914" }}>
              <Image src={photo.src} alt="料理" fill className="object-cover" sizes="400px" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
