"use client";

import { GIFT_SHIPPING, type GiftShippingArea } from "@/app/lib/giftData";

const mincho = "'Shippori Mincho', serif";

/** 送料金表の 1 地域カラム（地域名ヘッダー + 都道府県 + 送料）。 */
function ShippingColumn({ area, last }: { area: GiftShippingArea; last: boolean }) {
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", borderRight: last ? "none" : "1px solid #0a0a0a" }}>
      {/* 地域名（金背景） */}
      <div style={{ height: 48, background: "rgba(217,184,107,0.6)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: mincho, fontWeight: 600, fontSize: 15, color: "#1a1205" }}>
        {area.region}
      </div>
      {/* 都道府県 */}
      <div style={{ height: 188, background: "#242424", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        {area.prefectures.map((pf) => (
          <span key={pf} style={{ fontFamily: mincho, fontSize: 12, letterSpacing: "0.5px", color: "#fff", lineHeight: "20px" }}>
            {pf}
          </span>
        ))}
      </div>
      {/* 送料 */}
      <div style={{ height: 56, background: "#1c1c1c", display: "flex", alignItems: "baseline", justifyContent: "center", gap: 3 }}>
        <span style={{ fontFamily: mincho, fontWeight: 600, fontSize: 20, color: "#d9b86b" }}>{area.fee}</span>
        <span style={{ fontFamily: mincho, fontWeight: 500, fontSize: 12, color: "rgba(217,184,107,0.8)" }}>円</span>
      </div>
    </div>
  );
}

/**
 * 送料金表セクション（1440×988）。1340幅のテーブルを 6 列 × 2 段で表示。
 * タイトル帯 + 地域ごとの「地域名 / 都道府県 / 送料」を縦に積んだカラムを横並び。
 */
export default function GiftShippingSection() {
  const row1 = GIFT_SHIPPING.slice(0, 6);
  const row2 = GIFT_SHIPPING.slice(6, 12);
  return (
    <div style={{ width: 1440, height: 988, background: "#0a0a0a", overflow: "hidden" }}>
      <div style={{ paddingLeft: 50, paddingTop: 143 }}>
        <div style={{ width: 1340 }}>
          {/* タイトル帯 */}
          <div style={{ position: "relative", height: 99, background: "#1c1c1c", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontFamily: mincho, fontWeight: 600, fontSize: 22, letterSpacing: "4px", color: "#fff" }}>【送料金表】</span>
            <span style={{ position: "absolute", right: 17, top: 68, fontFamily: mincho, fontSize: 11, letterSpacing: "0.5px", color: "#ebe5db" }}>
              ※表示の金額は税込価格です
            </span>
          </div>
          {/* 2 段 */}
          <div style={{ display: "flex" }}>
            {row1.map((a, i) => (
              <ShippingColumn key={a.region} area={a} last={i === row1.length - 1} />
            ))}
          </div>
          <div style={{ display: "flex" }}>
            {row2.map((a, i) => (
              <ShippingColumn key={a.region} area={a} last={i === row2.length - 1} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
