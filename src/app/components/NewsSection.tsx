"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { NEWS_DATA, type NewsItem } from "@/app/lib/newsData";
import { SECTION_LINKS } from "@/app/lib/navLinks";
import OutlineButton from "./OutlineButton";

const mincho = "'Shippori Mincho', serif";
const sans = "'Noto Sans JP', sans-serif";
const display = "'Cormorant Garamond', serif";

/** 店舗情報（店舗詳細スライダー）と共通の細身シェブロン矢印。 */
function NewsArrow({ dir, onClick, style }: { dir: "left" | "right"; onClick: () => void; style?: React.CSSProperties }) {
  const [hover, setHover] = useState(false);
  const isLeft = dir === "left";
  const stroke = hover ? "#ebe5db" : "rgba(235,229,219,0.55)";
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      aria-label={isLeft ? "前へ" : "次へ"}
      className="absolute"
      style={{ background: "transparent", border: "none", cursor: "pointer", padding: 0, zIndex: 10, lineHeight: 0, ...style }}
    >
      <svg
        width="22"
        height="40"
        viewBox="0 0 11 20"
        fill="none"
        aria-hidden
        style={{
          display: "block",
          transform: hover ? `translateX(${isLeft ? -5 : 5}px)` : "none",
          transition: "transform 0.3s ease",
        }}
      >
        <path
          d={isLeft ? "M10 1 L1 10 L10 19" : "M1 1 L10 10 L1 19"}
          stroke={stroke}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}

const CARD_WIDTH = 340;
const GAP = 55;
const CARD_STEP = CARD_WIDTH + GAP;

const easeInOut = (t: number) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;

const VIEWPORT_WIDTH = 1370; // カード表示枠の幅（下のコンテナ width と一致）

export default function NewsSection({ items }: { items?: NewsItem[] }) {
  const NEWS = items && items.length > 0 ? items : NEWS_DATA;
  // ループ幅は件数から算出（DB 連携で件数が変わっても崩れないように）
  const CARD_SET_WIDTH = CARD_STEP * NEWS.length;
  // カードが表示枠に収まる件数のときは無限ループ（2セット複製）しない。
  // 複製すると同じカードが並んで「ダブって」見えるため。
  const contentWidth = NEWS.length * CARD_WIDTH + Math.max(0, NEWS.length - 1) * GAP;
  const loop = contentWidth > VIEWPORT_WIDTH;
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
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", boxSizing: "border-box", width: 44, height: 94, padding: "8px 7px", border: "1px solid rgba(255,255,255,0.3)", flexShrink: 0, overflow: "hidden" }}>
            <p style={{ margin: 0, fontFamily: mincho, fontSize: 12, letterSpacing: "7px", lineHeight: "1", color: "#fff", writingMode: "vertical-rl" as const, whiteSpace: "nowrap", transform: "translateY(4px)" }}>お知らせ</p>
          </div>
          <p style={{ fontFamily: display, fontSize: 80, letterSpacing: "-1px", color: "#ebe5db", lineHeight: "normal" }}>News</p>
        </div>
        <OutlineButton jp="お知らせ一覧" href={SECTION_LINKS.news} width={162} padL={32} />
      </div>

      {/* 左右矢印（件数が表示枠を超えてループする場合のみ表示） */}
      {loop && (
        <>
          <NewsArrow dir="left" onClick={() => handleArrow("left")} style={{ left: 76, top: 332 }} />
          <NewsArrow dir="right" onClick={() => handleArrow("right")} style={{ left: 1343, top: 332 }} />
        </>
      )}

      {/* ニュースカード */}
      <div className="absolute" style={{ top: 411, left: 70, width: 1370, overflow: "hidden" }}>
        <div ref={trackRef} style={{ display: "flex", gap: GAP, width: "max-content" }}>
          {(loop ? [...NEWS, ...NEWS] : NEWS).map((item, index) => (
            <a key={index} href={item.id ? `/news/${item.id}` : SECTION_LINKS.news} style={{ width: CARD_WIDTH, flexShrink: 0, display: "flex", flexDirection: "column", gap: 21, textDecoration: "none" }}>
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
