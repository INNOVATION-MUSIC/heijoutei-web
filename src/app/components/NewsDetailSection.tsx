"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import PageHeader from "./PageHeader";
import { newsBody, newsHero, type NewsListItem } from "@/app/lib/newsData";

type NavItem = { id: string; title: string };

const mincho = "'Shippori Mincho', serif";
const sans = "'Noto Sans JP', sans-serif";

/** 本文が（TipTap 由来の）HTML か、静的フォールバックのプレーンテキストかを判定 */
function isHtmlBody(body: string): boolean {
  return /<\/?[a-z][\s\S]*>/i.test(body);
}

/**
 * 記事末尾の「前 / 次のお知らせ」リンク（Figma 外・サイトのデザインテイストで生成）。
 * 細身の矢印 SVG（news_arrow）＋ ゴールドのラベル＋明朝タイトル。ホバーで矢印がスライドしタイトルが発色。
 */
function NavLink({ dir, item }: { dir: "prev" | "next"; item: NavItem }) {
  const [hover, setHover] = useState(false);
  const isPrev = dir === "prev";

  const stroke = hover ? "#ebe5db" : "rgba(235,229,219,0.55)";
  const arrow = (
    <svg
      width="11"
      height="20"
      viewBox="0 0 11 20"
      fill="none"
      aria-hidden
      style={{
        flexShrink: 0,
        transform: hover ? `translateX(${isPrev ? -5 : 5}px)` : "none",
        transition: "transform 0.3s ease",
      }}
    >
      <path
        d={isPrev ? "M10 1 L1 10 L10 19" : "M1 1 L10 10 L1 19"}
        stroke={stroke}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );

  const text = (
    <div style={{ display: "flex", flexDirection: "column", gap: 9, alignItems: isPrev ? "flex-start" : "flex-end", minWidth: 0 }}>
      <span style={{ fontFamily: sans, fontSize: 11, fontWeight: 300, letterSpacing: "2px", color: "rgba(217,184,107,0.6)", whiteSpace: "nowrap" }}>
        {isPrev ? "前のお知らせ" : "次のお知らせ"}
      </span>
      <span
        style={{
          fontFamily: mincho,
          fontSize: 15,
          letterSpacing: "0.06em",
          color: hover ? "#fff" : "#ebe5db",
          lineHeight: 1.5,
          maxWidth: 340,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          textAlign: isPrev ? "left" : "right",
          transition: "color 0.3s ease",
        }}
      >
        {item.title}
      </span>
    </div>
  );

  return (
    <a
      href={`/news/${item.id}`}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{ display: "flex", alignItems: "center", gap: 24, textDecoration: "none", maxWidth: 440 }}
    >
      {isPrev ? (<>{arrow}{text}</>) : (<>{text}{arrow}</>)}
    </a>
  );
}

/**
 * /news/[id] お知らせ詳細ページのメインコンテンツ（PageHeader 含む）。
 * Figma 設計幅 1440・「お知らせ詳細」（161:287）準拠。
 * 見出し行は左にタイトル＋日付＋タグ、右に 500×500 ヒーロー画像（flex row・上下中央揃え）。
 * 続けて本文（16px / lineHeight34）→ 本文中画像（980×640）の縦並び。
 * セクション全高（height）は本文行数から算出した値を NewsDetailClient から受け取る。
 */
export default function NewsDetailSection({
  article,
  onOpenModal,
  height,
  prev = null,
  next = null,
  onBodyMeasured,
}: {
  article: NewsListItem;
  onOpenModal: () => void;
  height: number;
  /** 前後のお知らせ（一覧の並び順から親が算出して渡す。DB 記事も静的記事も対応） */
  prev?: NavItem | null;
  next?: NavItem | null;
  /** 本文の実測高さ（design 1440 幅でのpx）を親に通知し、全高算出に使わせる */
  onBodyMeasured?: (h: number) => void;
}) {
  const body = newsBody(article);
  const bodyIsHtml = isHtmlBody(body);

  // 本文 HTML は高さが可変（見出し・リスト・画像読み込み・Web フォント反映で変わる）。
  // transform: scale() は offsetHeight に影響しないため、design 幅での実測値をそのまま親へ返す。
  const bodyRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = bodyRef.current;
    if (!el || !onBodyMeasured) return;
    const report = () => onBodyMeasured(el.offsetHeight);
    report();
    const ro = new ResizeObserver(report);
    ro.observe(el);
    return () => ro.disconnect();
  }, [body, onBodyMeasured]);

  return (
    <div style={{ display: "flex", flexDirection: "column", width: 1440, height, background: "#0a0a0a", overflow: "hidden" }}>

      {/* 共通ヘッダー */}
      <PageHeader onOpenModal={onOpenModal} />

      {/* 見出し行: 左=タイトル+日付+タグ / 右=500×500 ヒーロー画像 */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingLeft: 259, paddingRight: 201, paddingTop: 134 }}>
        {/* 左ブロック */}
        <div style={{ display: "flex", flexDirection: "column", gap: 17, maxWidth: 440 }}>
          <h1 style={{ fontFamily: mincho, fontSize: 32, fontWeight: 400, letterSpacing: "1.5px", color: "#ebe5db", lineHeight: 1.4, margin: 0 }}>
            {article.title}
          </h1>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontFamily: sans, fontSize: 14, fontWeight: 300, letterSpacing: "1.5px", color: "rgba(217,184,107,0.6)", whiteSpace: "nowrap" }}>
              {article.date}
            </span>
            {article.tags.filter((t) => t.label !== "NEW").map((tag, i) => (
              <span
                key={i}
                style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 60, height: 20, backgroundColor: tag.color, borderRadius: 10, fontFamily: mincho, fontSize: 10, fontWeight: 500, color: "#fff", flexShrink: 0 }}
              >
                {tag.label}
              </span>
            ))}
          </div>
        </div>

        {/* 右: ヒーロー画像（500×500） */}
        <div style={{ position: "relative", width: 500, height: 500, overflow: "hidden", flexShrink: 0, background: "#472914" }}>
          <Image src={newsHero(article)} alt={article.title} fill className="object-cover" sizes="500px" preload />
        </div>
      </div>

      {/* 本文（DB由来は TipTap の HTML を .rte-content で装飾描画／静的フォールバックはプレーンテキスト） */}
      <div style={{ paddingLeft: 259, paddingTop: 83 }}>
        <div
          ref={bodyRef}
          className={bodyIsHtml ? "rte-content" : undefined}
          style={{
            width: 1101,
            fontFamily: mincho,
            fontSize: 16,
            fontWeight: 400,
            letterSpacing: "1.5px",
            lineHeight: "34px",
            color: "#ebe5db",
            ...(bodyIsHtml ? {} : { whiteSpace: "pre-wrap" }),
          }}
          {...(bodyIsHtml
            ? { dangerouslySetInnerHTML: { __html: body } }
            : { children: body })}
        />
      </div>

      {/* 本文中画像（980×640・任意） */}
      {article.bodyImg && (
        <div style={{ paddingLeft: 259, paddingTop: 77 }}>
          <div style={{ position: "relative", width: 980, height: 640, overflow: "hidden", background: "#472914" }}>
            <Image src={article.bodyImg} alt={article.title} fill className="object-cover" sizes="980px" />
          </div>
        </div>
      )}

      {/* 前 / 次のお知らせ ナビ（本文画像と同じ 980 幅・上に細い区切り線） */}
      <div style={{ paddingLeft: 259, paddingRight: 201, paddingTop: 100 }}>
        <div style={{ borderTop: "1px solid rgba(234,229,219,0.15)", paddingTop: 44, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 40 }}>
          {/* 空スロットを残して space-between の左右位置を保持 */}
          {prev ? <NavLink dir="prev" item={prev} /> : <span />}
          {next ? <NavLink dir="next" item={next} /> : <span />}
        </div>
      </div>

      {/* 残余スペーサー（全高まで） */}
      <div style={{ flex: 1 }} />
    </div>
  );
}
