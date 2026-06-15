"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { MENU_PHOTOS } from "@/app/lib/menuPhotos";
import OutlineButton from "./OutlineButton";
import { SECTION_LINKS } from "@/app/lib/navLinks";

const mincho = "'Shippori Mincho', serif";

const PHOTOS = MENU_PHOTOS;

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
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", boxSizing: "border-box", width: 44, height: 94, padding: "8px 7px", border: "1px solid rgba(255,255,255,0.3)", flexShrink: 0, overflow: "hidden" }}>
          <p style={{ margin: 0, fontFamily: mincho, fontSize: 12, letterSpacing: "7px", lineHeight: "1", color: "#fff", writingMode: "vertical-rl" as const, whiteSpace: "nowrap", transform: "translateY(4px)" }}>おすすめ</p>
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
      <div className="absolute" style={{ left: 206, top: 424 }}>
        <OutlineButton jp="メニュー" en="Menu" href={SECTION_LINKS.menu} />
      </div>

      {/* 料理写真 自動横スクロール */}
      <div className="absolute" style={{ top: 538, left: 0, width: 1440, overflow: "hidden" }}>
        <div
          ref={trackRef}
          // 初期オフセットのみ静的指定（以降の位置は rAF が trackRef へ命令的に適用）
          style={{ display: "flex", gap: GAP, width: "max-content", transform: "translateX(-33px)" }}
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
