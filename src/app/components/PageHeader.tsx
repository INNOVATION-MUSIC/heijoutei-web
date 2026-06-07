"use client";

import Image from "next/image";
import { HEADER_NAV_LINKS } from "@/app/lib/navLinks";

const mincho = "'Shippori Mincho', serif";
const sans = "'Noto Sans JP', sans-serif";

/**
 * 下層ページ共通ヘッダー。
 * nav（左端57px）・ロゴ（中央）・ご予約ボタン（右端40px）を flex で配置。
 * 左右を flex:1 スペーサーで挟むことでロゴをほぼデザイン中央に揃える。
 */
export default function PageHeader({ onOpenModal }: { onOpenModal: () => void }) {
  return (
    <header
      style={{
        display: "flex",
        alignItems: "flex-start",
        width: 1440,
        height: 153,
        paddingTop: 43,
        paddingLeft: 57,
        paddingRight: 40,
        background: "#0a0a0a",
      }}
    >
      {/* 左: 縦書きナビ（width 293） */}
      <div style={{ flex: 1, display: "flex", justifyContent: "flex-start", paddingTop: 9 }}>
        <nav>
          <ul style={{ display: "flex", listStyle: "none", width: 293, justifyContent: "space-between", margin: 0, padding: 0 }}>
            {HEADER_NAV_LINKS.map(({ label, href }) => (
              <li key={label} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                <span style={{ fontFamily: "sans-serif", fontSize: 16, fontWeight: 700, color: "#fff", lineHeight: "20px" }}>·</span>
                <a
                  href={href}
                  style={{
                    display: "block",
                    writingMode: "vertical-rl" as const,
                    fontFamily: mincho,
                    fontSize: 12,
                    fontWeight: 400,
                    letterSpacing: "0.083em",
                    color: "#fff",
                    textDecoration: "none",
                  }}
                >
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      {/* 中央: ロゴ（139×73） */}
      <div style={{ position: "relative", width: 139, height: 73, flexShrink: 0 }}>
        <Image src="/images/logo.webp" alt="焼肉平壌亭" fill className="object-contain" sizes="139px" priority />
      </div>

      {/* 右: ご予約ボタン（171×50） */}
      <div style={{ flex: 1, display: "flex", justifyContent: "flex-end", paddingTop: 12 }}>
        <button
          onClick={onOpenModal}
          style={{
            width: 171,
            height: 50,
            borderRadius: 25,
            border: "1px solid rgba(221,168,63,0.6)",
            background: "transparent",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 8,
            paddingLeft: 22,
          }}
        >
          <span style={{ fontFamily: "sans-serif", fontSize: 16, color: "#fff", lineHeight: "1" }}>·</span>
          <span style={{ fontFamily: mincho, fontSize: 12, fontWeight: 400, letterSpacing: "0.083em", color: "#fff" }}>ご予約</span>
          <span style={{ fontFamily: sans, fontSize: 12, fontWeight: 700, letterSpacing: "0.125em", color: "#ebe5db", whiteSpace: "nowrap" }}>Reserve</span>
        </button>
      </div>
    </header>
  );
}
