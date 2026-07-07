"use client";

import Image from "next/image";
import PageHeader from "../PageHeader";
import { GIFT_PRODUCTS, type GiftProduct } from "@/app/lib/giftData";

// カード間 gap60・見出しまで 801 と揃えた既定全高（商品4件時）。
const DEFAULT_HEIGHT = 2848;

const mincho = "'Shippori Mincho', serif";
const sans = "'Noto Sans JP', sans-serif";
const display = "'Cormorant Garamond', serif";

/** スペックラベルの金枠チップ（75×25）。 */
function SpecChip({ label }: { label: string }) {
  return (
    <span
      style={{
        boxSizing: "border-box",
        width: 75,
        height: 25,
        flexShrink: 0,
        border: "1px solid rgba(217,184,107,0.6)",
        borderRadius: 2,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: sans,
        fontWeight: 500,
        fontSize: 11,
        color: "#ebe5db",
        lineHeight: "22px",
      }}
    >
      {label}
    </span>
  );
}

/**
 * ギフト商品カード（1340幅）。左に写真（616幅）、右に商品情報。
 * 固定デザイン（1440 キャンバス）を ScaledSection でスケールする前提のため、
 * 右側テキストは Figma 座標どおり絶対配置する（CtaSection 等と同方式）。
 * お食事券（short）は写真が低く 354px、それ以外は 460px。
 */
function GiftCard({ p }: { p: GiftProduct }) {
  const cardH = p.short ? 354 : 460;
  return (
    <div style={{ position: "relative", width: 1340, height: cardH, background: "#171717", overflow: "hidden" }}>
      {/* 写真（左・616幅） */}
      <div style={{ position: "absolute", left: 0, top: 0, width: 616, height: cardH, background: "#1c110a", overflow: "hidden" }}>
        <Image src={p.image} alt={p.imageAlt} fill className="object-cover" sizes="616px" />
      </div>

      {/* 小見出し */}
      <p style={{ position: "absolute", left: 684, top: 45, width: 280, margin: 0, fontFamily: mincho, fontSize: 10, letterSpacing: "4px", color: "rgba(217,184,107,0.7)", lineHeight: "normal" }}>
        {p.subtitle}
      </p>
      {/* 金線 */}
      <div style={{ position: "absolute", left: 684, top: 69, width: 32, height: 1, background: "rgba(217,184,107,0.45)" }} />
      {/* 商品名 */}
      <p style={{ position: "absolute", left: 684, top: 81, width: 728, margin: 0, fontFamily: mincho, fontSize: 26, fontWeight: 600, letterSpacing: "2px", color: "#fff", lineHeight: "normal" }}>
        {p.title}
      </p>
      {/* 価格 */}
      <div style={{ position: "absolute", left: 684, top: 149, display: "flex", alignItems: "baseline" }}>
        {p.price.map((part, i) => (
          <span
            key={i}
            style={{
              fontFamily: mincho,
              fontWeight: 700,
              color: "#d9b86b",
              letterSpacing: "1px",
              fontSize: part.size === "lg" ? 24 : 16,
              whiteSpace: "pre",
            }}
          >
            {part.text}
          </span>
        ))}
      </div>

      {/* 説明文 */}
      <p style={{ position: "absolute", left: 734, top: 201, width: 650, margin: 0, fontFamily: mincho, fontSize: 12, letterSpacing: "1px", color: "#ebe5db", lineHeight: "28px", whiteSpace: "pre-wrap" }}>
        {p.description}
      </p>

      {/* 左カラム: 内容ラベル + 値 */}
      <div style={{ position: "absolute", left: 734, top: 288, display: "flex", alignItems: "flex-start", gap: 19 }}>
        <SpecChip label={p.contentLabel} />
        <p style={{ margin: 0, fontFamily: sans, fontWeight: 300, fontSize: 12, letterSpacing: "0.5px", color: "#ebe5db", lineHeight: "22px", whiteSpace: "pre" }}>
          {p.content}
        </p>
      </div>

      {/* 右カラム: スペック行 */}
      <div style={{ position: "absolute", left: 1019, top: 288, display: "flex", flexDirection: "column", gap: 12 }}>
        {p.specs.map((s, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 19 }}>
            <SpecChip label={s.label} />
            <span style={{ fontFamily: sans, fontWeight: 300, fontSize: 12, letterSpacing: "0.5px", color: "#ebe5db", lineHeight: "22px", whiteSpace: "nowrap" }}>
              {s.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * /gift ギフト（ご進物）ページのメインコンテンツ（PageHeader 含む）。
 * Figma 設計幅 1440。見出しは /about・/news と同じ構成（ラベル + Gift + ヒーロー820×320）、
 * 本体は商品カード（写真左 + 情報右）を縦に並べる。
 * products はサーバー（giftDb）由来。未指定時は静的 GIFT_PRODUCTS にフォールバック。
 * height は商品数に応じた全高（GiftClient が算出）。
 */
export default function GiftMainSection({
  onOpenModal,
  products,
  height = DEFAULT_HEIGHT,
}: {
  onOpenModal: () => void;
  products?: GiftProduct[];
  height?: number;
}) {
  const list = products ?? GIFT_PRODUCTS;
  return (
    <div style={{ display: "flex", flexDirection: "column", width: 1440, height, background: "#0a0a0a", overflow: "hidden" }}>
      {/* 共通ヘッダー */}
      <PageHeader onOpenModal={onOpenModal} />

      {/* Gift 見出し + ヒーロー画像（Hero 上端 y=297） */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", paddingLeft: 57, paddingRight: 40, paddingTop: 144 }}>
        {/* 左: ラベル + Gift */}
        <div style={{ display: "flex", gap: 49, alignItems: "flex-start", paddingTop: 48 }}>
          {/* 縦書きラベル「ご進物」 */}
          <div style={{ boxSizing: "border-box", width: 44, height: 85, padding: "8px 7px", border: "1px solid rgba(255,255,255,0.3)", overflow: "hidden", display: "flex", justifyContent: "center", alignItems: "center", flexShrink: 0 }}>
            <span style={{ margin: 0, writingMode: "vertical-rl" as const, fontFamily: mincho, fontSize: 12, letterSpacing: "7px", lineHeight: "1", color: "#fff", whiteSpace: "nowrap", transform: "translateY(4px)" }}>
              ご進物
            </span>
          </div>
          {/* Gift タイトル */}
          <p style={{ fontFamily: display, fontSize: 80, letterSpacing: "-1px", color: "#ebe5db", lineHeight: "normal", margin: 0, whiteSpace: "nowrap" }}>Gift</p>
        </div>

        {/* 右: ヒーロー画像（820×320・黒オーバーレイ0.5） */}
        <div style={{ position: "relative", width: 820, height: 320, overflow: "hidden", flexShrink: 0, background: "#472914" }}>
          <Image src="/images/gift_hero.webp" alt="平壌亭のギフト" fill className="object-cover" sizes="820px" preload />
          <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.5)" }} />
        </div>
      </div>

      {/* 商品カード */}
      <div style={{ display: "flex", flexDirection: "column", gap: 60, paddingLeft: 49, paddingTop: 184 }}>
        {list.map((p) => (
          <GiftCard key={p.id} p={p} />
        ))}
      </div>
    </div>
  );
}
