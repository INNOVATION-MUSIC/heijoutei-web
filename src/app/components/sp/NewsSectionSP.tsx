"use client";

import Image from "next/image";
import { useRef } from "react";
import { SECTION_LINKS } from "@/app/lib/navLinks";
import SpButton from "./SpButton";
import { NEWS_DATA, type NewsItem } from "@/app/lib/newsData";

const mincho = "'Shippori Mincho', serif";
const display = "'Cormorant Garamond', serif";
const sans = "'Noto Sans JP', sans-serif";

const CARD_WIDTH = 260;
const GAP = 21;
const CARD_STEP = CARD_WIDTH + GAP;

const easeInOut = (t: number) =>
  t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;

export default function NewsSectionSP({ items }: { items?: NewsItem[] }) {
  const NEWS = items && items.length > 0 ? items : NEWS_DATA;
  // ループ幅は件数から算出（DB 連携で件数が変わっても崩れないように）
  const CARD_SET_WIDTH = CARD_STEP * NEWS.length;
  // カードが表示枠（390 - 左padding40 = 350）に収まる件数のときはループ複製しない。
  // 複製すると同じカードが見切れて「ダブって」見えるため。
  const contentWidth = NEWS.length * CARD_WIDTH + Math.max(0, NEWS.length - 1) * GAP;
  const loop = contentWidth > 350;
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
    if (!loop || animating.current) return;
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
          src="/images/news_bg.webp"
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
            boxSizing: "border-box",
            width: 44,
            height: 94,
            padding: "8px 7px",
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
              margin: 0,
              fontFamily: mincho,
              fontSize: 12,
              letterSpacing: "7px",
              lineHeight: "1",
              color: "#fff",
              writingMode: "vertical-rl" as const,
              whiteSpace: "nowrap",
              transform: "translateY(4px)",
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
          height: 20, // 矢印非表示時もレイアウト高さを保つ
        }}
      >
        {/* 店舗情報と共通の細身シェブロン矢印（ループ時のみ表示） */}
        {loop && (
          <>
            <button
              aria-label="前へ"
              onClick={() => handleArrow("left")}
              style={{ background: "none", border: "none", padding: 0, cursor: "pointer", display: "block", lineHeight: 0 }}
            >
              <svg width="11" height="20" viewBox="0 0 11 20" fill="none" aria-hidden style={{ display: "block" }}>
                <path d="M10 1 L1 10 L10 19" stroke="rgba(235,229,219,0.7)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <button
              aria-label="次へ"
              onClick={() => handleArrow("right")}
              style={{ background: "none", border: "none", padding: 0, cursor: "pointer", display: "block", lineHeight: 0 }}
            >
              <svg width="11" height="20" viewBox="0 0 11 20" fill="none" aria-hidden style={{ display: "block" }}>
                <path d="M1 1 L10 10 L1 19" stroke="rgba(235,229,219,0.7)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </>
        )}
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
          {(loop ? [...NEWS, ...NEWS] : NEWS).map((item, i) => (
            <a key={i} href={item.id ? `/news/${item.id}` : SECTION_LINKS.news} style={{ flexShrink: 0, width: CARD_WIDTH, display: "block", textDecoration: "none" }}>
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
            </a>
          ))}
        </div>
      </div>

      <div style={{ height: 50, flexShrink: 0 }} />

      <SpButton href={SECTION_LINKS.news} label="お知らせ一覧" />
    </section>
  );
}
