"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { type NewsListItem } from "@/app/lib/newsData";

const mincho = "'Shippori Mincho', serif";
const sans = "'Noto Sans JP', sans-serif";
const display = "'Cormorant Garamond', serif";

const CARD_WIDTH = 350;

/**
 * 1 枚のニュースカード（SP）。マウント時に Web Animations API でフェードイン＋
 * 軽いスライドアップ。delay でバッチ内の表示を 1 枚ずつずらす（PC 版 NewsCard と同方針）。
 */
function NewsCardSP({ item, delay }: { item: NewsListItem; delay: number }) {
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
    <a ref={ref} href={`/news/${item.id}`} style={{ width: CARD_WIDTH, display: "flex", flexDirection: "column", gap: 12, textDecoration: "none" }}>
      {/* 写真（350×220） */}
      <div style={{ position: "relative", width: CARD_WIDTH, height: 220, overflow: "hidden", background: "#4d2914" }}>
        <Image src={item.img} alt={item.title} fill className="object-cover" sizes="350px" />
      </div>
      {/* メタ: 日付 + タグ（NEW は一覧では非表示） */}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontFamily: sans, fontSize: 12, fontWeight: 300, letterSpacing: "0.083em", color: "#948f85" }}>{item.date}</span>
        {item.tags.filter((t) => t.label !== "NEW").map((tag, ti) => (
          <span key={ti} style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "0 8px", height: 20, backgroundColor: tag.color, borderRadius: 10, fontFamily: mincho, fontSize: 10, fontWeight: 500, color: "#fff" }}>
            {tag.label}
          </span>
        ))}
      </div>
      {/* タイトル */}
      <p style={{ width: CARD_WIDTH, fontFamily: mincho, fontSize: 15, fontWeight: 400, letterSpacing: "0.1em", color: "#ebe5db", lineHeight: "1.6", margin: 0 }}>{item.title}</p>
    </a>
  );
}

type Props = {
  height: number;
  visibleCount: number;
  hasMore: boolean;
  onShowMore: () => void;
  /** この index 以降のカードを出現アニメーション対象にする（既出カードは再生しない） */
  animateFrom: number;
  items: NewsListItem[];
};

/**
 * /news お知らせ一覧ページ SP 版メインコンテンツ。Figma 設計幅 390（node 2135:381）。
 * ヘッダーは SpStickyHeader が固定表示するため先頭に 153px spacer のみ置く。
 * flex column で各ブロックを積み、縦位置は paddingTop（gap）で制御。marginTop 不使用。
 * カードは 1 列・350px 幅。デフォルト 6 件表示し「もっと見る」で 6 件ずつ追加（PC と共通の件数制御）。
 */
export default function NewsListSectionSP({ height, visibleCount, hasMore, onShowMore, animateFrom, items }: Props) {
  return (
    <div style={{ display: "flex", flexDirection: "column", width: 390, height, background: "#0a0a0a", overflow: "hidden" }}>

      {/* ヘッダー高さ分のスペーサー（SpStickyHeader が上に固定表示） */}
      <div style={{ height: 153, flexShrink: 0 }} />

      {/* ヒーロー画像ストリップ（351×130・左右21pxインセット・黒オーバーレイ0.3） */}
      <div style={{ paddingLeft: 19 }}>
        <div style={{ position: "relative", width: 351, height: 130, overflow: "hidden", background: "#472914" }}>
          <Image src="/images/newslist_hero.webp" alt="京都・丹波の田園風景" fill className="object-cover" sizes="351px" priority />
          <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.3)" }} />
        </div>
      </div>

      {/* News 見出し（縦書きラベル「お知らせ」+ News・トップ NewsSectionSP と統一） */}
      <div style={{ display: "flex", alignItems: "flex-start", paddingLeft: 19, paddingTop: 73, gap: 28 }}>
        <div style={{ boxSizing: "border-box", width: 44, height: 94, padding: "8px 7px", border: "1px solid rgba(255,255,255,0.3)", overflow: "hidden", flexShrink: 0, display: "flex", justifyContent: "center", alignItems: "center" }}>
          <span style={{ margin: 0, writingMode: "vertical-rl" as const, whiteSpace: "nowrap", fontFamily: mincho, fontSize: 12, letterSpacing: "7px", lineHeight: "1", color: "#fff", transform: "translateY(4px)" }}>
            お知らせ
          </span>
        </div>
        <p style={{ paddingTop: 40, fontFamily: display, fontSize: 48, letterSpacing: "-1px", color: "#ebe5db", lineHeight: "normal", margin: 0 }}>News</p>
      </div>

      {/* カード一覧（1列・gap32） */}
      <div style={{ display: "flex", flexDirection: "column", gap: 32, paddingLeft: 20, paddingRight: 20, paddingTop: 63 }}>
        {items.slice(0, visibleCount).map((item, index) => (
          // key に index を使うことで追加表示分だけ新規マウントされ、その時だけアニメーションする。
          <NewsCardSP key={index} item={item} delay={Math.max(0, index - animateFrom) * 110} />
        ))}
      </div>

      {/* もっと見るボタン（未表示の項目が残っている場合のみ） */}
      {hasMore && (
        <div style={{ display: "flex", justifyContent: "center", paddingTop: 80, flexShrink: 0 }}>
          <button
            onClick={onShowMore}
            style={{
              height: 50,
              borderRadius: 25,
              border: "1px solid rgba(221,168,63,0.6)",
              background: "transparent",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 8,
              paddingLeft: 22,
              paddingRight: 22,
            }}
          >
            <span style={{ fontFamily: "sans-serif", fontSize: 16, color: "#fff", lineHeight: 1 }}>·</span>
            <span style={{ fontFamily: mincho, fontSize: 14, letterSpacing: "1px", color: "#fff" }}>もっと見る</span>
          </button>
        </div>
      )}

      {/* 残余スペーサー（全高まで） */}
      <div style={{ flex: 1 }} />
    </div>
  );
}
