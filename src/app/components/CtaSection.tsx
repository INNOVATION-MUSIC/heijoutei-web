"use client";
import Image from "next/image";
import { SECTION_LINKS } from "@/app/lib/navLinks";
import OutlineButton from "./OutlineButton";

const mincho = "'Shippori Mincho', serif";
const sans = "'Noto Sans JP', sans-serif";

export default function CtaSection() {
  return (
    <section className="relative overflow-hidden" style={{ width: 1440, height: 620 }}>
      {/* 背景写真 */}
      <div className="absolute inset-0 overflow-hidden bg-black">
        <Image src="/images/cta.webp" alt="" fill className="object-cover" sizes="1440px" />
        <div className="absolute inset-0" style={{ background: "rgba(0,0,0,0.75)" }} />
      </div>

      {/* 左：お電話でのご予約（center x=500, width=440） */}
      <div className="absolute" style={{ left: 280, top: 200, width: 440, display: "flex", flexDirection: "column", alignItems: "center" }}>
        <p style={{ fontFamily: sans, fontWeight: 300, fontSize: 9, letterSpacing: "2.5px", color: "rgba(217,184,107,0.5)", textTransform: "uppercase" as const }}>Reservation by phone</p>
        <p style={{ fontFamily: mincho, fontWeight: 800, fontSize: 22, letterSpacing: "2px", color: "#fff", paddingTop: 10 }}>お電話でのご予約</p>
        <div style={{ paddingTop: 33 }}>
          <a href="tel:0771-23-8410" style={{ fontFamily: mincho, fontWeight: 800, fontSize: 28, letterSpacing: "1px", color: "#d9b86b", textDecoration: "none" }}>
            0771-23-8410
          </a>
        </div>
        <p style={{ fontFamily: sans, fontWeight: 300, fontSize: 12, letterSpacing: "0.5px", color: "#fff", paddingTop: 21 }}>受付時間：11:00〜21:00　※火曜定休</p>
      </div>

      {/* 右：テイクアウトのご注文（center x=940, width=440） */}
      <div className="absolute" style={{ left: 720, top: 200, width: 440, display: "flex", flexDirection: "column", alignItems: "center" }}>
        <p style={{ fontFamily: sans, fontWeight: 300, fontSize: 9, letterSpacing: "2.5px", color: "rgba(217,184,107,0.5)", textTransform: "uppercase" as const }}>Takeout order</p>
        <p style={{ fontFamily: mincho, fontWeight: 800, fontSize: 22, letterSpacing: "2px", color: "#ebe5db", paddingTop: 10 }}>テイクアウトのご注文</p>
        <div style={{ paddingTop: 28 }}>
          <OutlineButton jp="ご注文" en="Takeout" href={SECTION_LINKS.takeout} align="center" />
        </div>
        <p style={{ fontFamily: sans, fontWeight: 300, fontSize: 12, letterSpacing: "0.5px", color: "#fff", paddingTop: 16 }}>24時間予約受付中</p>
      </div>
    </section>
  );
}
