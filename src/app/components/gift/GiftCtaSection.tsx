"use client";

import Image from "next/image";
import { GIFT_CONTACT } from "@/app/lib/giftData";

const mincho = "'Shippori Mincho', serif";
const sans = "'Noto Sans JP', sans-serif";

/**
 * ギフトご注文の CTA バンド（1440×332）。
 * 背景写真（カルビ）+ 黒オーバーレイ0.7 の上に、案内文・電話番号（tel:）・受付時間を中央寄せで配置。
 */
export default function GiftCtaSection() {
  return (
    <section className="relative overflow-hidden" style={{ width: 1440, height: 332, background: "#0d0a0a" }}>
      {/* 背景写真 */}
      <div className="absolute inset-0 overflow-hidden bg-black">
        <Image src="/images/gift_cta.webp" alt="" fill className="object-cover" sizes="1440px" />
        <div className="absolute inset-0" style={{ background: "rgba(0,0,0,0.7)" }} />
      </div>

      {/* 中央テキスト */}
      <div className="absolute" style={{ left: 0, right: 0, top: 96, display: "flex", flexDirection: "column", alignItems: "center" }}>
        <p style={{ margin: 0, fontFamily: mincho, fontWeight: 800, fontSize: 22, letterSpacing: "2px", color: "#fff" }}>{GIFT_CONTACT.lead}</p>
        <a
          href={`tel:${GIFT_CONTACT.phone}`}
          style={{ marginTop: 33, fontFamily: mincho, fontWeight: 800, fontSize: 28, letterSpacing: "1px", color: "#d9b86b", textDecoration: "none" }}
        >
          {GIFT_CONTACT.phone}
        </a>
        <p style={{ margin: 0, marginTop: 21, fontFamily: sans, fontWeight: 300, fontSize: 12, letterSpacing: "0.5px", color: "#fff" }}>{GIFT_CONTACT.hours}</p>
      </div>
    </section>
  );
}
