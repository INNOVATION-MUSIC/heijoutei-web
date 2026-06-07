"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import PageHeader from "./PageHeader";
import { NEWS_LIST_DATA as LIST, type NewsListItem } from "@/app/lib/newsData";

const mincho = "'Shippori Mincho', serif";
const sans = "'Noto Sans JP', sans-serif";
const display = "'Cormorant Garamond', serif";

const CARD_WIDTH = 340;

/**
 * 1 枚のニュースカード。マウント時（＝画面に現れた時）に Web Animations API で
 * ふわっとフェードイン＆軽いスライドアップさせる。globals.css のキーフレームに依存しない。
 * delay でバッチ内の表示を 1 枚ずつずらす。
 */
function NewsCard({ item, delay }: { item: NewsListItem; delay: number }) {
  const ref = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    const anim = el.animate(
      [
        { opacity: 0, transform: "translateY(16px)" },
        { opacity: 1, transform: "translateY(0)" },
      ],
      { duration: 750, delay, easing: "cubic-bezier(0.22, 0.61, 0.36, 1)", fill: "both" }
    );
    return () => anim.cancel();
  }, [delay]);

  return (
    <a ref={ref} href={`/news/${item.id}`} style={{ width: CARD_WIDTH, display: "flex", flexDirection: "column", gap: 21, textDecoration: "none" }}>
      <div style={{ position: "relative", width: CARD_WIDTH, height: 340, overflow: "hidden", background: "#4d2914" }}>
        <Image src={item.img} alt={item.title} fill className="object-cover" sizes="340px" />
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontFamily: sans, fontSize: 12, fontWeight: 300, letterSpacing: "0.083em", color: "#948f85" }}>{item.date}</span>
          {item.tags.map((tag, ti) => (
            <span key={ti} style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 60, height: 20, backgroundColor: tag.color, borderRadius: 10, fontFamily: mincho, fontSize: 10, fontWeight: 500, color: "#fff" }}>
              {tag.label}
            </span>
          ))}
        </div>
        <p style={{ width: CARD_WIDTH, fontFamily: mincho, fontSize: 15, fontWeight: 400, letterSpacing: "0.1em", color: "#ebe5db", lineHeight: "1.6", margin: 0 }}>{item.title}</p>
      </div>
    </a>
  );
}

type Props = {
  onOpenModal: () => void;
  height: number;
  visibleCount: number;
  hasMore: boolean;
  onShowMore: () => void;
  /** この index 以降のカードを出現アニメーション対象にする（既出カードは再生しない） */
  animateFrom: number;
};

/**
 * /news お知らせ一覧ページのメインコンテンツ（PageHeader 含む）。
 * Figma 設計幅 1440。見出しは /about と同じ構成、本体は 3 列グリッド（flex-wrap・列gap60 / 行gap66）。
 * デフォルト 6 件表示し「もっと見る」で 6 件ずつ追加表示する。表示件数に応じて高さ（height）を可変にする。
 * タグ色・デザインは PC トップ NewsSection と統一。NEW タグは一覧では表示しない。
 */
export default function NewsListSection({ onOpenModal, height, visibleCount, hasMore, onShowMore, animateFrom }: Props) {
  return (
    <div style={{ display: "flex", flexDirection: "column", width: 1440, height, background: "#0a0a0a", overflow: "hidden" }}>

      {/* 共通ヘッダー */}
      <PageHeader onOpenModal={onOpenModal} />

      {/* News 見出し + ヒーロー画像（Hero 上端 y=297） */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", paddingLeft: 57, paddingRight: 40, paddingTop: 144 }}>
        {/* 左: ラベル + News */}
        <div style={{ display: "flex", gap: 49, alignItems: "flex-start", paddingTop: 48 }}>
          {/* 縦書きラベル「お知らせ」 */}
          <div style={{ width: 44, height: 85, border: "1px solid rgba(255,255,255,0.3)", display: "flex", justifyContent: "center", alignItems: "center", flexShrink: 0 }}>
            <span style={{ writingMode: "vertical-rl" as const, fontFamily: mincho, fontSize: 12, letterSpacing: "0.083em", color: "#fff", lineHeight: 1 }}>
              お知らせ
            </span>
          </div>
          {/* News タイトル */}
          <p style={{ fontFamily: display, fontSize: 80, letterSpacing: "-1px", color: "#ebe5db", lineHeight: "normal", margin: 0 }}>News</p>
        </div>

        {/* 右: ヒーロー画像（820×320） */}
        <div style={{ position: "relative", width: 820, height: 320, overflow: "hidden", flexShrink: 0, background: "#472914" }}>
          <Image src="/images/newslist_hero.webp" alt="京都・丹波の田園風景" fill className="object-cover" sizes="820px" />
        </div>
      </div>

      {/* 3列グリッド */}
      <div style={{ display: "flex", flexWrap: "wrap", rowGap: 66, columnGap: 60, paddingLeft: 150, paddingRight: 150, paddingTop: 211 }}>
        {LIST.slice(0, visibleCount).map((item, index) => (
          // key に index を使うことで、追加表示分だけが新規マウントされ、その時だけアニメーションする。
          // delay はそのバッチ内での出現順（index - animateFrom）に応じて 1 枚ずつずらす。
          <NewsCard key={index} item={item} delay={Math.max(0, index - animateFrom) * 110} />
        ))}
      </div>

      {/* もっと見るボタン（未表示の項目が残っている場合のみ） */}
      {hasMore && (
        <div style={{ display: "flex", justifyContent: "center", paddingTop: 140 }}>
          <button
            onClick={onShowMore}
            style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, width: 151, height: 50, borderRadius: 25, border: "1px solid rgba(221,168,63,0.6)", background: "transparent", cursor: "pointer" }}
          >
            <span style={{ fontFamily: "sans-serif", fontSize: 16, color: "#fff", lineHeight: 1 }}>·</span>
            <span style={{ fontFamily: mincho, fontSize: 12, letterSpacing: "0.083em", color: "#fff" }}>もっと見る</span>
          </button>
        </div>
      )}

      {/* 残余スペーサー（全高まで） */}
      <div style={{ flex: 1 }} />
    </div>
  );
}
