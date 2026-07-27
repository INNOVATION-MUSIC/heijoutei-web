import Image from "next/image";
import { SECTION_LINKS } from "@/app/lib/navLinks";
import SpButton from "./SpButton";

const mincho = "'Shippori Mincho', serif";
const sans = "'Noto Sans JP', sans-serif";

export default function CtaSectionSP() {
  return (
    <section
      style={{
        position: "relative",
        width: 390,
        height: 671,
        background: "#0a0a0a",
        overflow: "hidden",
      }}
    >
      {/* 背景写真: Figma に合わせ top:8 からスタート */}
      <div style={{ position: "absolute", left: 0, top: 8, width: 390, height: 663, overflow: "hidden", background: "#1a0c05" }}>
        <Image src="/images/cta.webp" alt="" fill className="object-cover" sizes="390px" />
        <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.75)" }} />
      </div>

      {/* コンテンツ */}
      <div
        style={{
          position: "relative",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          width: "100%",
          paddingTop: 103,
        }}
      >
        <p style={{ fontFamily: sans, fontWeight: 300, fontSize: 9, letterSpacing: "2.5px", color: "rgba(217,184,107,0.6)", textTransform: "uppercase" as const }}>
          Reservation by Phone
        </p>

        <div style={{ height: 8, flexShrink: 0 }} />

        <p style={{ fontFamily: mincho, fontSize: 18, fontWeight: 800, letterSpacing: "2px", color: "#fff" }}>
          お電話でのご予約
        </p>

        <div style={{ height: 25, flexShrink: 0 }} />

        <a href="tel:0771-23-8410" style={{ fontFamily: mincho, fontSize: 30, fontWeight: 800, letterSpacing: "1px", color: "#d9b86b", textDecoration: "none" }}>
          0771-23-8410
        </a>

        <div style={{ height: 21, flexShrink: 0 }} />

        <p style={{ fontFamily: sans, fontWeight: 300, fontSize: 12, letterSpacing: "0.5px", color: "#fff" }}>
          受付時間：11:00〜21:00　※火曜定休
        </p>

        <div style={{ height: 111, flexShrink: 0 }} />

        <p style={{ fontFamily: sans, fontWeight: 300, fontSize: 9, letterSpacing: "2.5px", color: "rgba(217,184,107,0.6)", textTransform: "uppercase" as const }}>
          Takeout Order
        </p>

        <div style={{ height: 8, flexShrink: 0 }} />

        <p style={{ fontFamily: mincho, fontSize: 18, fontWeight: 800, letterSpacing: "2px", color: "#ebe5db" }}>
          テイクアウトのご注文
        </p>

        <div style={{ height: 20, flexShrink: 0 }} />

        <SpButton href={SECTION_LINKS.takeout} label="ご注文" en="Takeout" />

        <div style={{ height: 18, flexShrink: 0 }} />

        <p style={{ fontFamily: sans, fontWeight: 300, fontSize: 12, letterSpacing: "0.5px", color: "#fff" }}>
          24時間予約受付中
        </p>
      </div>
    </section>
  );
}
