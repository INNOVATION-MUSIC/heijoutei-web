"use client";

import Image from "next/image";
import Link from "next/link";
import { NAV_LINKS as NAV_DEFS, SECTION_LINKS } from "@/app/lib/navLinks";

const mincho = "'Shippori Mincho', serif";
const sans = "'Noto Sans JP', sans-serif";

export default function FooterSP({ onOpenModal }: { onOpenModal: () => void }) {
  return (
    <footer
      style={{
        width: 390,
        height: 973,
        background: "#0a0a0a",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        paddingTop: 82,
      }}
    >
      {/* ロゴ: Figma w=212 h=111（クリックでトップへ） */}
      <Link href="/" aria-label="トップへ" style={{ display: "block", position: "relative", width: 212, height: 111, flexShrink: 0 }}>
        <Image
          src="/images/footer_logo.webp"
          alt="焼肉平壌亭"
          fill
          className="object-contain"
          sizes="212px"
        />
      </Link>

      {/* キャッチコピー */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 16,
          paddingTop: 25,
        }}
      >
        <p
          style={{
            fontFamily: mincho,
            fontSize: 15,
            letterSpacing: "2px",
            lineHeight: "24px",
            color: "#fff",
            margin: 0,
            textAlign: "center",
          }}
        >
          創業50年以上。<br />受け継がれる伝統と、<br />変わらない美味しさ。
        </p>
        <p
          style={{
            fontFamily: mincho,
            fontSize: 15,
            letterSpacing: "2px",
            color: "#fff",
            margin: 0,
          }}
        >
          京都・亀岡、園部、福知山で愛される味
        </p>
      </div>

      {/* ナビゲーション */}
      <nav
        style={{
          paddingTop: 51,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          width: "100%",
        }}
      >
        {NAV_DEFS.map(({ label, href }) => (
          <a
            key={label}
            href={href}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "100%",
              height: 44,
              fontFamily: mincho,
              fontSize: 14,
              letterSpacing: "1.5px",
              color: "rgba(235,229,219,0.85)",
              textDecoration: "none",
            }}
          >
            {label}
          </a>
        ))}
      </nav>

      {/* スペーサー */}
      <div style={{ flex: 1 }} />

      {/* ボタンエリア */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 40,
          paddingBottom: 76,
        }}
      >
        {/* 予約ボタン: Figma w=171 */}
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
          <span style={{ fontFamily: "sans-serif", fontSize: 16, color: "#fff", lineHeight: 1 }}>
            ·
          </span>
          <span
            style={{
              fontFamily: mincho,
              fontSize: 12,
              letterSpacing: "0.083em",
              color: "#fff",
            }}
          >
            ご予約
          </span>
          <span
            style={{
              fontFamily: sans,
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: "0.125em",
              color: "#ebe5db",
            }}
          >
            Reserve
          </span>
        </button>

        {/* テイクアウトボタン */}
        <a
          href={SECTION_LINKS.takeout}
          style={{
            width: 171,
            height: 50,
            borderRadius: 25,
            border: "1px solid rgba(221,168,63,0.6)",
            background: "transparent",
            display: "flex",
            alignItems: "center",
            gap: 8,
            paddingLeft: 22,
            textDecoration: "none",
          }}
        >
          <span style={{ fontFamily: "sans-serif", fontSize: 16, color: "#fff", lineHeight: 1 }}>
            ·
          </span>
          <span
            style={{
              fontFamily: mincho,
              fontSize: 12,
              letterSpacing: "0.083em",
              color: "#fff",
            }}
          >
            ご注文
          </span>
          <span
            style={{
              fontFamily: sans,
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: "0.125em",
              color: "#ebe5db",
            }}
          >
            Takeout
          </span>
        </a>
      </div>

      {/* 区切り線 + コピーライト */}
      <div
        style={{
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 14,
          paddingBottom: 11,
        }}
      >
        <div
          style={{
            width: "100%",
            height: 1,
            backgroundColor: "rgba(255,255,255,0.08)",
          }}
        />
        <p
          style={{
            fontFamily: sans,
            fontSize: 10,
            fontWeight: 300,
            letterSpacing: "0.15em",
            color: "rgba(235,229,219,0.4)",
            margin: 0,
          }}
        >
          © 焼肉平壌亭　all rights reserved.
        </p>
      </div>
    </footer>
  );
}
