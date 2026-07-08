"use client";

import { GIFT_SHIPPING, type GiftShippingArea } from "@/app/lib/giftData";

const mincho = "'Shippori Mincho', serif";

// 6件時（2段）の既定全高。段数可変時は GiftClient が height を算出して渡す。
const DEFAULT_HEIGHT = 988;

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

/** 送料金表の 1 地域カラム（地域名ヘッダー + 都道府県 + 送料）。列幅は 6 分割固定。 */
function ShippingColumn({ area, last }: { area: GiftShippingArea; last: boolean }) {
  return (
    <div style={{ flexBasis: `${100 / 6}%`, flexGrow: 0, flexShrink: 0, display: "flex", flexDirection: "column", borderRight: last ? "none" : "1px solid #0a0a0a" }}>
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
 * 送料金表セクション（1440幅）。1340幅のテーブルを 6 列 × N 段で表示。
 * areas はサーバー（giftShippingDb）由来。未指定時は静的 GIFT_SHIPPING にフォールバック。
 * height は段数に応じた全高（GiftClient が算出）。
 */
export default function GiftShippingSection({
  areas,
  height = DEFAULT_HEIGHT,
}: {
  areas?: GiftShippingArea[];
  height?: number;
}) {
  const list = areas ?? GIFT_SHIPPING;
  const rows = chunk(list, 6);
  return (
    <div style={{ width: 1440, height, background: "#0a0a0a", overflow: "hidden" }}>
      <div style={{ paddingLeft: 50, paddingTop: 143 }}>
        <div style={{ width: 1340 }}>
          {/* タイトル帯 */}
          <div style={{ position: "relative", height: 99, background: "#1c1c1c", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontFamily: mincho, fontWeight: 600, fontSize: 22, letterSpacing: "4px", color: "#fff" }}>【送料金表】</span>
            <span style={{ position: "absolute", right: 17, top: 68, fontFamily: mincho, fontSize: 11, letterSpacing: "0.5px", color: "#ebe5db" }}>
              ※表示の金額は税込価格です
            </span>
          </div>
          {/* N 段 */}
          {rows.map((row, ri) => (
            <div key={ri} style={{ display: "flex" }}>
              {row.map((a, i) => (
                <ShippingColumn key={`${a.region}-${i}`} area={a} last={i === row.length - 1} />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
