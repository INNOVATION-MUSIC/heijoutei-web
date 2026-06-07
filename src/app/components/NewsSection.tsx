"use client";

import Image from "next/image";
import { useRef } from "react";
import { NEWS_DATA as NEWS } from "@/app/lib/newsData";

const mincho = "'Shippori Mincho', serif";
const sans = "'Noto Sans JP', sans-serif";
const display = "'Cormorant Garamond', serif";

const CARD_WIDTH = 340;
const GAP = 55;
const CARD_STEP = CARD_WIDTH + GAP;
const CARD_SET_WIDTH = CARD_STEP * NEWS.length;

const easeInOut = (t: number) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;

export default function NewsSection() {
  const trackRef = useRef<HTMLDivElement>(null);
  const posRef = useRef(0);
  const animating = useRef(false);

  const animateTo = (from: number, to: number, onComplete?: () => void) => {
    const duration = 450;
    const startTime = performance.now();
    animating.current = true;

    const frame = (now: number) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const current = from + (to - from) * easeInOut(progress);
      if (trackRef.current) {
        trackRef.current.style.transform = `translateX(-${current}px)`;
      }
      if (progress < 1) {
        requestAnimationFrame(frame);
      } else {
        posRef.current = to;
        animating.current = false;
        onComplete?.();
      }
    };
    requestAnimationFrame(frame);
  };

  const handleArrow = (dir: "left" | "right") => {
    if (animating.current) return;
    const currentCard = Math.floor(posRef.current / CARD_STEP);
    const targetCard = dir === "right" ? currentCard - 1 : currentCard + 1;
    const to = targetCard * CARD_STEP;

    if (to < 0) {
      // 先頭→末尾へのラップ: 末尾相当位置に瞬時移動してから1枚分戻す
      const from = CARD_SET_WIDTH;
      posRef.current = from;
      if (trackRef.current) trackRef.current.style.transform = `translateX(-${from}px)`;
      animateTo(from, CARD_SET_WIDTH - CARD_STEP);
    } else if (to >= CARD_SET_WIDTH) {
      // 末尾→先頭へのラップ: そのまま末尾まで進めてから先頭に瞬時リセット
      animateTo(posRef.current, to, () => {
        posRef.current = 0;
        if (trackRef.current) trackRef.current.style.transform = `translateX(0)`;
      });
    } else {
      animateTo(posRef.current, to);
    }
  };

  return (
    <section className="relative bg-[#0a0a0a] overflow-hidden" style={{ width: 1440, height: 1000 }}>
      {/* ブラー背景 */}
      <div className="absolute overflow-hidden bg-[rgba(77,41,20,0.2)]" style={{ left: 0, top: 0, width: 1440, height: 1000 }}>
        <div className="absolute" style={{ left: -126, top: -837, width: 2589, height: 2556, filter: "blur(25px)" }}>
          <Image src="/images/news1.webp" alt="" fill className="object-cover" sizes="2589px" />
        </div>
        <div className="absolute inset-0 bg-black/50" />
      </div>

      {/* ヘッダー行: ラベル + タイトル + ボタン */}
      <div className="absolute" style={{ top: 141, left: 140, right: 197, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 69 }}>
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", width: 44, height: 85, border: "1px solid rgba(255,255,255,0.3)", flexShrink: 0 }}>
            <p style={{ fontFamily: mincho, fontSize: 12, letterSpacing: "0.083em", color: "#fff", writingMode: "vertical-rl" as const }}>お知らせ</p>
          </div>
          <p style={{ fontFamily: display, fontSize: 80, letterSpacing: "-1px", color: "#ebe5db", lineHeight: "normal" }}>News</p>
        </div>
        <a href="#" style={{ display: "flex", alignItems: "center", gap: 8, paddingLeft: 32, width: 162, height: 50, borderRadius: 25, border: "1px solid rgba(221,168,63,0.6)", textDecoration: "none", flexShrink: 0 }}>
          <span style={{ fontFamily: "sans-serif", fontSize: 16, color: "#fff" }}>·</span>
          <span style={{ fontFamily: mincho, fontSize: 12, letterSpacing: "0.083em", color: "#fff" }}>お知らせ一覧</span>
        </a>
      </div>

      {/* 左矢印 */}
      <button
        onClick={() => handleArrow("left")}
        className="absolute"
        style={{ left: 70, top: 344, background: "transparent", border: "none", cursor: "pointer", padding: 0, zIndex: 10 }}
      >
        <Image src="/images/news_arrow_l.svg" alt="前へ" width={34} height={16} unoptimized />
      </button>

      {/* 右矢印 */}
      <button
        onClick={() => handleArrow("right")}
        className="absolute"
        style={{ left: 1336, top: 344, background: "transparent", border: "none", cursor: "pointer", padding: 0, zIndex: 10 }}
      >
        <Image src="/images/news_arrow_r.svg" alt="次へ" width={34} height={16} unoptimized />
      </button>

      {/* ニュースカード */}
      <div className="absolute" style={{ top: 411, left: 70, width: 1370, overflow: "hidden" }}>
        <div ref={trackRef} style={{ display: "flex", gap: GAP, width: "max-content" }}>
          {[...NEWS, ...NEWS].map((item, index) => (
            <a key={index} href="#" style={{ width: CARD_WIDTH, flexShrink: 0, display: "flex", flexDirection: "column", gap: 21, textDecoration: "none" }}>
              <div style={{ position: "relative", width: CARD_WIDTH, height: 340, overflow: "hidden", background: "#4d2914" }}>
                <Image src={item.img} alt={item.title} fill className="object-cover" sizes="340px" />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  {item.tags.filter(t => t.label === "NEW").map((tag, ti) => (
                    <span key={ti} style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 60, height: 20, backgroundColor: tag.color, fontFamily: mincho, fontSize: 10, fontWeight: 500, color: "#fff" }}>
                      {tag.label}
                    </span>
                  ))}
                  <span style={{ fontFamily: sans, fontSize: 12, fontWeight: 300, letterSpacing: "0.083em", color: "#948f85" }}>{item.date}</span>
                  {item.tags.filter(t => t.label !== "NEW").map((tag, ti) => (
                    <span key={ti} style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 60, height: 20, backgroundColor: tag.color, borderRadius: 10, fontFamily: mincho, fontSize: 10, fontWeight: 500, color: "#fff" }}>
                      {tag.label}
                    </span>
                  ))}
                </div>
                <p style={{ width: 260, fontFamily: mincho, fontSize: 15, fontWeight: 400, letterSpacing: "0.1em", color: "#ebe5db", lineHeight: "1.6" }}>{item.title}</p>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
