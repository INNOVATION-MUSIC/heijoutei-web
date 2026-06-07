"use client";

import Image from "next/image";
import { useRef } from "react";
import { SECTION_LINKS } from "@/app/lib/navLinks";
import SpButton from "./SpButton";
import { NEWS_DATA } from "@/app/lib/newsData";

const mincho = "'Shippori Mincho', serif";
const display = "'Cormorant Garamond', serif";
const sans = "'Noto Sans JP', sans-serif";

const CARD_WIDTH = 260;
const GAP = 21;
const CARD_STEP = CARD_WIDTH + GAP;
const CARD_SET_WIDTH = CARD_STEP * NEWS_DATA.length;

const easeInOut = (t: number) =>
  t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;

export default function NewsSectionSP() {
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
    const currentCard = Math.round(posRef.current / CARD_STEP);
    const targetCard = dir === "right" ? currentCard - 1 : currentCard + 1;
    const to = targetCard * CARD_STEP;

    if (to < 0) {
      const from = CARD_SET_WIDTH;
      posRef.current = from;
      if (trackRef.current)
        trackRef.current.style.transform = `translateX(-${from}px)`;
      animateTo(from, CARD_SET_WIDTH - CARD_STEP);
    } else if (to >= CARD_SET_WIDTH) {
      animateTo(posRef.current, to, () => {
        posRef.current = 0;
        if (trackRef.current)
          trackRef.current.style.transform = `translateX(0)`;
      });
    } else {
      animateTo(posRef.current, to);
    }
  };

  return (
    <section
      style={{
        position: "relative",
        overflow: "hidden",
        width: 390,
        height: 801,
        background: "#0a0a0a",
        display: "flex",
        flexDirection: "column",
        paddingTop: 53,
        paddingBottom: 50,
      }}
    >
      {/* 背景: 物理的に重なる要素なので absolute 許容 */}
      <div style={{ position: "absolute", inset: 0, background: "rgba(77,41,20,0.2)", overflow: "hidden" }}>
        <Image
          src="/images/news_bg.jpg"
          alt=""
          fill
          className="object-cover"
          style={{ filter: "blur(25px)", opacity: 0.5 }}
          sizes="390px"
        />
      </div>
      <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.5)" }} />

      {/* ラベル + タイトル */}
      <div
        style={{
          position: "relative",
          display: "flex",
          alignItems: "flex-start",
          paddingLeft: 40,
          gap: 28,
          flexShrink: 0,
        }}
      >
        <div
          style={{
            width: 44,
            height: 85,
            border: "1px solid rgba(255,255,255,0.3)",
            overflow: "hidden",
            flexShrink: 0,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <p
            style={{
              fontFamily: mincho,
              fontSize: 12,
              letterSpacing: "5px",
              color: "#fff",
              writingMode: "vertical-rl" as const,
              margin: 0,
            }}
          >
            お知らせ
          </p>
        </div>
        <p
          style={{
            fontFamily: display,
            fontSize: 48,
            letterSpacing: "-1px",
            color: "#ebe5db",
            lineHeight: "normal",
            paddingTop: 40,
          }}
        >
          News
        </p>
      </div>

      {/* ラベル底〜矢印上 */}
      <div style={{ height: 74, flexShrink: 0 }} />

      {/* ナビ矢印 */}
      <div
        style={{
          position: "relative",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          paddingLeft: 40,
          paddingRight: 40,
          flexShrink: 0,
        }}
      >
        <button
          aria-label="前へ"
          onClick={() => handleArrow("left")}
          style={{ background: "none", border: "none", padding: 0, cursor: "pointer" }}
        >
          <img
            src="/images/news_arrow_l.svg"
            alt="←"
            style={{ width: 31, height: 14, filter: "brightness(0) invert(1)" }}
          />
        </button>
        <button
          aria-label="次へ"
          onClick={() => handleArrow("right")}
          style={{ background: "none", border: "none", padding: 0, cursor: "pointer" }}
        >
          <img
            src="/images/news_arrow_r.svg"
            alt="→"
            style={{ width: 31, height: 14, filter: "brightness(0) invert(1)" }}
          />
        </button>
      </div>

      {/* 矢印底〜カード上 */}
      <div style={{ height: 52, flexShrink: 0 }} />

      {/* カードスライダー */}
      <div style={{ position: "relative", flexShrink: 0, overflow: "hidden" }}>
        <div
          ref={trackRef}
          style={{
            display: "flex",
            paddingLeft: 40,
            gap: GAP,
            width: "max-content",
          }}
        >
          {[...NEWS_DATA, ...NEWS_DATA].map((item, i) => (
            <div key={i} style={{ flexShrink: 0, width: CARD_WIDTH }}>
              <div
                style={{
                  width: CARD_WIDTH,
                  height: 260,
                  overflow: "hidden",
                  background: "#4d2914",
                  position: "relative",
                }}
              >
                <Image src={item.img} alt={item.title} fill className="object-cover" sizes="260px" />
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 12, flexWrap: "wrap" as const }}>
                {/* NEWタグは日付の左 */}
                {item.tags.filter(t => t.label === "NEW").map((tag) => (
                  <span
                    key={tag.label}
                    style={{
                      display: "flex", alignItems: "center", justifyContent: "center",
                      width: 44, height: 18,
                      backgroundColor: tag.color,
                      fontFamily: mincho, fontSize: 10, fontWeight: 500, color: "#fff",
                    }}
                  >
                    {tag.label}
                  </span>
                ))}
                {/* 日付 */}
                <p style={{ fontFamily: sans, fontSize: 12, fontWeight: 300, letterSpacing: "0.083em", color: "#948f85", margin: 0 }}>
                  {item.date}
                </p>
                {/* その他のタグは丸み付き */}
                {item.tags.filter(t => t.label !== "NEW").map((tag) => (
                  <span
                    key={tag.label}
                    style={{
                      display: "flex", alignItems: "center", justifyContent: "center",
                      padding: "2px 8px", height: 18,
                      backgroundColor: tag.color,
                      borderRadius: 10,
                      fontFamily: mincho, fontSize: 10, fontWeight: 500, color: "#fff",
                    }}
                  >
                    {tag.label}
                  </span>
                ))}
              </div>
              <p
                style={{
                  fontFamily: mincho,
                  fontSize: 15,
                  letterSpacing: "0.1em",
                  color: "#ebe5db",
                  lineHeight: "1.7",
                  marginTop: 8,
                }}
              >
                {item.title}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div style={{ height: 50, flexShrink: 0 }} />

      <SpButton href={SECTION_LINKS.news} label="お知らせ一覧" />
    </section>
  );
}
