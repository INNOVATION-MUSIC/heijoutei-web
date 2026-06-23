"use client";

import Image from "next/image";
import Link from "next/link";
import { HEADER_NAV_LINKS } from "@/app/lib/navLinks";
import OutlineButton from "./OutlineButton";

const mincho = "'Shippori Mincho', serif";

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

      {/* 中央: ロゴ（139×73・クリックでトップへ） */}
      <Link href="/" aria-label="トップへ" style={{ position: "relative", width: 139, height: 73, flexShrink: 0, display: "block" }}>
        <Image src="/images/logo.webp" alt="焼肉平壌亭" fill className="object-contain" sizes="139px" />
      </Link>

      {/* 右: ご予約ボタン（171×50・共通 OutlineButton） */}
      <div style={{ flex: 1, display: "flex", justifyContent: "flex-end", paddingTop: 12 }}>
        <OutlineButton jp="ご予約" en="Reserve" onClick={onOpenModal} />
      </div>
    </header>
  );
}
