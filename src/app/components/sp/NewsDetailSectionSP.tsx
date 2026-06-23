"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { newsBody, newsHero, type NewsListItem } from "@/app/lib/newsData";

const mincho = "'Shippori Mincho', serif";
const sans = "'Noto Sans JP', sans-serif";

/** 本文が（TipTap 由来の）HTML か、静的フォールバックのプレーンテキストかを判定 */
function isHtmlBody(body: string): boolean {
  return /<\/?[a-z][\s\S]*>/i.test(body);
}

/**
 * /news/[id] お知らせ詳細ページ SP 版メインコンテンツ。Figma 設計幅 390（node 2135:621）。
 * ヘッダーは SpStickyHeader が固定表示するため先頭に 153px spacer のみ置く。
 * 縦並び: ヒーロー画像(350×300) → タイトル → 日付+タグ → 本文 → 本文中画像(350×300)。
 * 縦位置は paddingTop（gap）で制御し marginTop / 配置目的の absolute は不使用。
 * タイトル＋本文は高さ可変のため一括で実測し、全高（height）算出に使う。
 */
export default function NewsDetailSectionSP({
  article,
  height,
  onBodyMeasured,
}: {
  article: NewsListItem;
  height: number;
  /** タイトル+日付+本文ブロックの実測高さ（design 390 幅でのpx）を親へ通知 */
  onBodyMeasured?: (h: number) => void;
}) {
  const body = newsBody(article);
  const bodyIsHtml = isHtmlBody(body);

  // タイトル(改行可変) + 本文(HTML は高さ可変)を一括実測。transform: scale() は offsetHeight に影響しない。
  const textRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = textRef.current;
    if (!el || !onBodyMeasured) return;
    const report = () => onBodyMeasured(el.offsetHeight);
    report();
    const ro = new ResizeObserver(report);
    ro.observe(el);
    return () => ro.disconnect();
  }, [body, onBodyMeasured]);

  return (
    <div style={{ display: "flex", flexDirection: "column", width: 390, height, background: "#0a0a0a", overflow: "hidden" }}>

      {/* ヘッダー高さ分のスペーサー（SpStickyHeader が上に固定表示） */}
      <div style={{ height: 153, flexShrink: 0 }} />

      {/* ヒーロー画像（350×300） */}
      <div style={{ paddingLeft: 20 }}>
        <div style={{ position: "relative", width: 350, height: 300, overflow: "hidden", background: "#472914" }}>
          <Image src={newsHero(article)} alt={article.title} fill className="object-cover" sizes="350px" preload />
        </div>
      </div>

      {/* タイトル + 日付/タグ + 本文（一括実測ブロック） */}
      <div ref={textRef} style={{ display: "flex", flexDirection: "column", paddingLeft: 20, paddingRight: 20, paddingTop: 28 }}>
        {/* タイトル */}
        <h1 style={{ fontFamily: mincho, fontSize: 20, fontWeight: 400, letterSpacing: "1px", color: "#ebe5db", lineHeight: 1.45, margin: 0 }}>
          {article.title}
        </h1>

        {/* 日付 + タグ */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, paddingTop: 20 }}>
          <span style={{ fontFamily: sans, fontSize: 13, fontWeight: 300, letterSpacing: "1.5px", color: "rgba(217,184,107,0.6)", whiteSpace: "nowrap" }}>
            {article.date}
          </span>
          {article.tags.filter((t) => t.label !== "NEW").map((tag, i) => (
            <span
              key={i}
              style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "0 8px", height: 20, backgroundColor: tag.color, borderRadius: 10, fontFamily: mincho, fontSize: 10, fontWeight: 500, color: "#fff", flexShrink: 0 }}
            >
              {tag.label}
            </span>
          ))}
        </div>

        {/* 本文（DB由来は TipTap の HTML を .rte-content で装飾描画／静的フォールバックはプレーンテキスト） */}
        <div
          className={bodyIsHtml ? "rte-content" : undefined}
          style={{
            paddingTop: 46,
            fontFamily: mincho,
            fontSize: 15,
            fontWeight: 400,
            letterSpacing: "1px",
            lineHeight: "30px",
            color: "#ebe5db",
            ...(bodyIsHtml ? {} : { whiteSpace: "pre-wrap" }),
          }}
          {...(bodyIsHtml
            ? { dangerouslySetInnerHTML: { __html: body } }
            : { children: body })}
        />
      </div>

      {/* 本文中画像（350×300・任意） */}
      {article.bodyImg && (
        <div style={{ paddingLeft: 20, paddingTop: 36 }}>
          <div style={{ position: "relative", width: 350, height: 300, overflow: "hidden", background: "#472914" }}>
            <Image src={article.bodyImg} alt={article.title} fill className="object-cover" sizes="350px" />
          </div>
        </div>
      )}

      {/* 残余スペーサー（全高まで） */}
      <div style={{ flex: 1 }} />
    </div>
  );
}
