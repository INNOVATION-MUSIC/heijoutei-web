"use client";

import Image from "next/image";
import { useState } from "react";
import ReserveModal from "../ReserveModal";

const mincho = "'Shippori Mincho', serif";
const sans = "'Noto Sans JP', sans-serif";

export default function HeroSectionSP() {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <section className="relative overflow-hidden bg-[#0a0a0a]" style={{ width: 390, height: 915 }}>
        {/* トップナビ */}
        <div className="absolute" style={{ left: 22, top: 34, width: 140, height: 78 }}>
          <Image src="/images/footer_logo.png" alt="焼肉平壌亭" fill className="object-contain" sizes="140px" />
        </div>
        {/* ハンバーガーアイコン */}
        <div className="absolute" style={{ right: 22, top: 44 }}>
          <div style={{ width: 22, height: 2, backgroundColor: "#fff", marginBottom: 5 }} />
          <div style={{ width: 22, height: 2, backgroundColor: "#fff", marginBottom: 5 }} />
          <div style={{ width: 22, height: 2, backgroundColor: "#fff" }} />
        </div>
        <p className="absolute" style={{ right: 22, top: 56, fontFamily: sans, fontSize: 7, letterSpacing: "0.2em", color: "rgba(255,255,255,0.5)", textTransform: "uppercase" as const }}>MENU</p>

        {/* ヒーロー写真 */}
        <div className="absolute overflow-hidden bg-[#1a0c05]" style={{ left: 0, top: 120, width: 390, height: 340 }}>
          <Image src="/images/hero_meat.jpg" alt="焼肉平壌亭" fill className="object-cover" sizes="390px" priority />
          <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, transparent 60%, #0a0a0a 100%)" }} />
        </div>

        {/* キャッチコピーエリア */}
        <p className="absolute" style={{ left: 22, top: 480, fontFamily: sans, fontSize: 8, fontWeight: 300, letterSpacing: "0.5em", color: "rgba(235,229,219,0.4)" }}>
          yakiniku  heijohtei
        </p>
        <div className="absolute" style={{ left: 22, top: 498, width: 50, height: 1, backgroundColor: "rgba(255,255,255,0.2)" }} />

        {/* メインコピー */}
        <p className="absolute" style={{ left: 22, top: 514, fontFamily: mincho, fontSize: 28, fontWeight: 400, letterSpacing: "0.22em", color: "#ebe5db", lineHeight: "44px" }}>
          本格炭火焼肉で、
        </p>
        <p className="absolute" style={{ left: 22, top: 554, fontFamily: mincho, fontSize: 28, fontWeight: 400, letterSpacing: "0.22em", color: "#ebe5db" }}>
          特別なひとときを。
        </p>

        {/* 英語サブコピー */}
        <div className="absolute" style={{ left: 22, top: 596, width: 50, height: 1, backgroundColor: "rgba(255,255,255,0.15)" }} />
        <p className="absolute" style={{ left: 22, top: 612, fontFamily: sans, fontSize: 9, fontWeight: 300, letterSpacing: "0.1em", color: "#99948c", lineHeight: "20px" }}>
          Savor unforgettable moments<br />
          over authentic charcoal-grilled yakiniku.
        </p>

        {/* 予約ボタン */}
        <button onClick={() => setModalOpen(true)} className="absolute flex items-center overflow-hidden"
          style={{ left: 93, top: 722, width: 204, height: 50, borderRadius: 25, border: "1px solid rgba(221,168,63,0.6)", background: "transparent", cursor: "pointer" }}>
          <span className="absolute" style={{ left: 22, top: 11, fontFamily: "sans-serif", fontSize: 16, color: "#ffffff" }}>·</span>
          <span className="absolute" style={{ left: 35, top: 15, fontFamily: mincho, fontSize: 12, letterSpacing: "0.083em", color: "#ffffff" }}>ご予約</span>
          <span className="absolute" style={{ left: 82, top: 15, fontFamily: sans, fontSize: 12, fontWeight: 700, letterSpacing: "0.125em", color: "#ebe5db" }}>Reserve</span>
        </button>

        {/* LINE バー */}
        <a href="#" className="absolute flex items-center" style={{ left: 0, top: 845, width: 390, height: 70, backgroundColor: "#273528", textDecoration: "none" }}>
          <div className="absolute" style={{ left: 22, top: 19, width: 32, height: 32 }}>
            <Image src="/images/line_icon.png" alt="LINE" fill className="object-contain" sizes="32px" />
          </div>
          <p className="absolute" style={{ left: 68, top: 26, fontFamily: sans, fontSize: 13, fontWeight: 500, letterSpacing: "0.2em", color: "#ebe5db" }}>
            LINE登録でお得情報GET
          </p>
        </a>
      </section>

      <ReserveModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
}
