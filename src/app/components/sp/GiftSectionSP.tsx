"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { GIFT_PRODUCTS, GIFT_SHIPPING, GIFT_CONTACT, type GiftProduct, type GiftShippingArea } from "@/app/lib/giftData";

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
 * SP 版ギフト商品カード（350幅）。写真を上・情報を下に縦積み。
 * スペックは 1 カラム（チップ左 + 値右）でカード高さは内容に応じて可変（自然フロー）。
 */
function GiftCardSP({ p }: { p: GiftProduct }) {
  return (
    <div style={{ width: 350, background: "#171717", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      {/* 写真 350×260 */}
      <div style={{ position: "relative", width: 350, height: 260, background: "#22140c", overflow: "hidden" }}>
        <Image src={p.image} alt={p.imageAlt} fill className="object-cover" sizes="350px" />
      </div>

      {/* 情報 */}
      <div style={{ display: "flex", flexDirection: "column", paddingLeft: 28, paddingRight: 25, paddingTop: 29, paddingBottom: 32 }}>
        <p style={{ margin: 0, fontFamily: mincho, fontSize: 10, letterSpacing: "4px", color: "rgba(217,184,107,0.7)", lineHeight: "normal" }}>{p.subtitle}</p>
        <div style={{ marginTop: 10, width: 32, height: 1, background: "rgba(217,184,107,0.5)" }} />
        <p style={{ margin: 0, marginTop: 11, fontFamily: mincho, fontSize: 24, fontWeight: 600, letterSpacing: "2px", color: "#ebe5db", lineHeight: "normal" }}>{p.title}</p>

        {/* 価格 */}
        <div style={{ marginTop: 21, display: "flex", alignItems: "baseline" }}>
          {p.price.map((part, i) => (
            <span key={i} style={{ fontFamily: mincho, fontWeight: 700, color: "#d9b86b", letterSpacing: "1px", fontSize: part.size === "lg" ? 24 : 15, whiteSpace: "pre" }}>
              {part.text}
            </span>
          ))}
        </div>

        {/* 説明 */}
        <p style={{ margin: 0, marginTop: 19, width: 297, fontFamily: mincho, fontSize: 14, letterSpacing: "1px", color: "#ebe5db", lineHeight: "28px", whiteSpace: "pre-wrap" }}>{p.description}</p>

        {/* スペック（1カラム） */}
        <div style={{ marginTop: 24, display: "flex", flexDirection: "column", gap: 21 }}>
          {/* 内容行（複数行の値） */}
          <div style={{ display: "flex", alignItems: "flex-start", gap: 30 }}>
            <SpecChip label={p.contentLabel} />
            <p style={{ margin: 0, fontFamily: sans, fontWeight: 300, fontSize: 14, letterSpacing: "0.5px", color: "#ebe5db", lineHeight: "26px", whiteSpace: "pre" }}>{p.content}</p>
          </div>
          {p.specs.map((s, i) => (
            <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 30 }}>
              <SpecChip label={s.label} />
              <span style={{ fontFamily: sans, fontWeight: 300, fontSize: 14, letterSpacing: "0.5px", color: "#ebe5db", lineHeight: "22px", whiteSpace: "nowrap" }}>{s.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/** SP 送料金表の 1 地域カラム。都道府県エリアは flex:1 で段内の最大列に高さを揃える。 */
function ShippingColumnSP({ area, last }: { area: GiftShippingArea; last: boolean }) {
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", borderRight: last ? "none" : "1px solid #0a0a0a" }}>
      <div style={{ height: 34, background: "rgba(217,184,107,0.6)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: mincho, fontWeight: 600, fontSize: 13, color: "#1a1205" }}>
        {area.region}
      </div>
      <div style={{ flex: 1, minHeight: 116, background: "#242424", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", paddingTop: 8, paddingBottom: 8 }}>
        {area.prefectures.map((pf) => (
          <span key={pf} style={{ fontFamily: mincho, fontSize: 10, color: "#fff", lineHeight: "19px" }}>{pf}</span>
        ))}
      </div>
      <div style={{ height: 40, background: "#1c1c1c", display: "flex", alignItems: "baseline", justifyContent: "center", gap: 2 }}>
        <span style={{ fontFamily: mincho, fontWeight: 600, fontSize: 15, color: "#d9b86b" }}>{area.fee}</span>
        <span style={{ fontFamily: mincho, fontWeight: 500, fontSize: 9, color: "rgba(217,184,107,0.8)" }}>円</span>
      </div>
    </div>
  );
}

/** SP 送料金表（390幅・6列×2段）。 */
function ShippingTableSP() {
  const row1 = GIFT_SHIPPING.slice(0, 6);
  const row2 = GIFT_SHIPPING.slice(6, 12);
  return (
    <div style={{ width: 390 }}>
      {/* タイトル */}
      <div style={{ position: "relative", height: 52, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontFamily: mincho, fontWeight: 600, fontSize: 18, letterSpacing: "3px", color: "#ebe5db" }}>【送料金表】</span>
        <span style={{ position: "absolute", right: 8, bottom: 6, fontFamily: mincho, fontSize: 9, letterSpacing: "0.5px", color: "#ebe5db" }}>※表示の金額は税込価格です</span>
      </div>
      <div style={{ display: "flex", alignItems: "stretch" }}>
        {row1.map((a, i) => (
          <ShippingColumnSP key={a.region} area={a} last={i === row1.length - 1} />
        ))}
      </div>
      <div style={{ display: "flex", alignItems: "stretch" }}>
        {row2.map((a, i) => (
          <ShippingColumnSP key={a.region} area={a} last={i === row2.length - 1} />
        ))}
      </div>
    </div>
  );
}

/**
 * /gift ギフト（ご進物）ページの SP メイン（設計幅 390）。
 * 153px ヘッダースペーサー（SpStickyHeader は fixed）→ ヒーロー351×130 → Gift 見出し
 * → 商品カード4枚 → 電話CTA → 送料金表 を単一カラムで縦積みする。
 * 高さ可変のため ResizeObserver で全高を実測し、onMeasured で親へ通知する。
 */
export default function GiftSectionSP({ onMeasured }: { onMeasured: (h: number) => void }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const report = () => onMeasured(el.offsetHeight);
    report();
    const ro = new ResizeObserver(report);
    ro.observe(el);
    return () => ro.disconnect();
  }, [onMeasured]);

  return (
    <div ref={ref} style={{ width: 390, background: "#0a0a0a", display: "flex", flexDirection: "column" }}>
      {/* ヘッダースペーサー（SpStickyHeader が fixed で表示） */}
      <div style={{ height: 153, flexShrink: 0 }} />

      {/* ヒーロー画像（351×130・左21pxインセット・黒オーバーレイ0.3） */}
      <div style={{ position: "relative", width: 351, height: 130, marginLeft: 19, overflow: "hidden", background: "#472914", flexShrink: 0 }}>
        <Image src="/images/gift_hero_sp.webp" alt="平壌亭のギフト" fill className="object-cover" sizes="351px" preload />
        <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.3)" }} />
      </div>

      {/* Gift 見出し */}
      <div style={{ display: "flex", gap: 28, alignItems: "flex-start", paddingLeft: 19, marginTop: 73 }}>
        <div style={{ boxSizing: "border-box", width: 44, height: 85, padding: "8px 7px", border: "1px solid rgba(255,255,255,0.3)", overflow: "hidden", display: "flex", justifyContent: "center", alignItems: "center", flexShrink: 0 }}>
          <span style={{ writingMode: "vertical-rl" as const, fontFamily: mincho, fontSize: 12, letterSpacing: "7px", lineHeight: "1", color: "#fff", whiteSpace: "nowrap", transform: "translateY(4px)" }}>ご進物</span>
        </div>
        <p style={{ margin: 0, marginTop: 8, fontFamily: display, fontSize: 48, letterSpacing: "-0.5px", color: "#ebe5db", lineHeight: "normal", whiteSpace: "nowrap" }}>Gift</p>
      </div>

      {/* 商品カード */}
      <div style={{ display: "flex", flexDirection: "column", gap: 40, paddingLeft: 20, marginTop: 80 }}>
        {GIFT_PRODUCTS.map((p) => (
          <GiftCardSP key={p.id} p={p} />
        ))}
      </div>

      {/* CTA（電話注文・全幅） */}
      <div style={{ position: "relative", width: 390, height: 200, overflow: "hidden", background: "#000", marginTop: 50, flexShrink: 0 }}>
        <Image src="/images/gift_cta.webp" alt="" fill className="object-cover" sizes="390px" />
        <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.7)" }} />
        <div style={{ position: "absolute", left: 0, right: 0, top: 48, display: "flex", flexDirection: "column", alignItems: "center" }}>
          <p style={{ margin: 0, fontFamily: mincho, fontSize: 12, color: "#fff" }}>{GIFT_CONTACT.lead}</p>
          <a href={`tel:${GIFT_CONTACT.phone}`} style={{ marginTop: 12, fontFamily: mincho, fontWeight: 600, fontSize: 22, letterSpacing: "1px", color: "#d9b86b", textDecoration: "none" }}>
            {GIFT_CONTACT.phone}
          </a>
          <p style={{ margin: 0, marginTop: 21, fontFamily: sans, fontSize: 10, color: "rgba(255,255,255,0.8)" }}>{GIFT_CONTACT.hours}</p>
        </div>
      </div>

      {/* 送料金表 */}
      <div style={{ marginTop: 46, marginBottom: 145, flexShrink: 0 }}>
        <ShippingTableSP />
      </div>
    </div>
  );
}
