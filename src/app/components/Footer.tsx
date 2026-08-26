"use client";
import Image from "next/image";
import Link from "next/link";
import { NAV_LINKS as NAV_DEFS, SECTION_LINKS } from "@/app/lib/navLinks";
import OutlineButton from "./OutlineButton";

const mincho = "'Shippori Mincho', serif";
const sans = "'Noto Sans JP', sans-serif";

const NAV_LINKS = NAV_DEFS.map((item, i) => ({ ...item, top: 135 + i * 38 }));

export default function Footer({ onOpenModal }: { onOpenModal: () => void }) {
  return (
    <footer className="relative overflow-hidden bg-[#0a0a0a]" style={{ width: 1440, height: 600 }}>
      {/* ロゴ（クリックでトップへ） */}
      <Link href="/" aria-label="トップへ" className="absolute block" style={{ left: 175, top: 90, width: 260, height: 148 }}>
        <Image src="/images/footer_logo.webp" alt="焼肉平壌亭" fill className="object-contain" sizes="260px" />
      </Link>

      {/* キャッチコピー（Heroと同じ文言・2026-08-26に統一） */}
      <p className="absolute" style={{ left: 145, top: 305, width: 320, textAlign: "center", fontFamily: mincho, fontSize: 14, letterSpacing: "0.2em", color: "rgba(235,229,219,0.65)", lineHeight: "26px" }}>
        創業50年以上。<br />受け継がれる伝統と、<br />変わらない美味しさ。
      </p>
      <p className="absolute" style={{ left: 148, top: 400, width: 316, textAlign: "center", fontFamily: mincho, fontSize: 13, letterSpacing: "0.3em", color: "rgba(235,229,219,0.65)", lineHeight: "normal" }}>
        京都・亀岡、園部、福知山で愛される味
      </p>

      {/* ナビゲーションリンク */}
      {NAV_LINKS.map(({ label, href, top }) => (
        <a key={label} href={href} className="absolute" style={{
          left: 809, top, width: 220, height: 30,
          fontFamily: mincho, fontSize: 13, letterSpacing: "0.15em",
          color: "rgba(235,229,219,0.75)", textDecoration: "none",
          display: "flex", alignItems: "center",
        }}>
          {label}
        </a>
      ))}

      {/* ご予約ボタン（共通 OutlineButton） */}
      <div className="absolute" style={{ left: 1128, top: 147 }}>
        <OutlineButton jp="ご予約" en="Reserve" onClick={onOpenModal} />
      </div>

      {/* テイクアウトボタン（共通 OutlineButton） */}
      <div className="absolute" style={{ left: 1128, top: 237 }}>
        <OutlineButton jp="ご注文" en="Takeout" href={SECTION_LINKS.takeout} />
      </div>

      {/* 区切り線 */}
      <div className="absolute" style={{ left: 0, top: 543, width: 1440, height: 1, backgroundColor: "rgba(255,255,255,0.08)" }} />

      {/* コピーライト */}
      <p className="absolute" style={{ left: 0, top: 558, width: 1440, textAlign: "center", fontFamily: sans, fontSize: 11, fontWeight: 300, letterSpacing: "0.2em", color: "rgba(235,229,219,0.4)" }}>
        © 焼肉平壌亭　all rights reserved.
      </p>
    </footer>
  );
}
