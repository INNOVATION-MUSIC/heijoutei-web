"use client";
import Image from "next/image";

const mincho = "'Shippori Mincho', serif";
const sans = "'Noto Sans JP', sans-serif";

const NAV_LINKS = [
  { label: "お知らせ", top: 135 },
  { label: "平壌亭について", top: 173 },
  { label: "メニュー", top: 211 },
  { label: "店舗一覧", top: 249 },
  { label: "ご予約", top: 287 },
  { label: "公式オンラインストア", top: 325 },
  { label: "採用情報", top: 363 },
  { label: "お問い合せ", top: 401 },
];

export default function Footer() {
  return (
    <footer className="relative overflow-hidden bg-[#0a0a0a]" style={{ width: 1440, height: 600 }}>
      {/* ロゴ */}
      <div className="absolute" style={{ left: 175, top: 90, width: 260, height: 148 }}>
        <Image src="/images/footer_logo.png" alt="焼肉平壌亭" fill className="object-contain" sizes="260px" />
      </div>

      {/* キャッチコピー */}
      <p className="absolute" style={{ left: 175, top: 310, width: 260, textAlign: "center", fontFamily: mincho, fontSize: 13, letterSpacing: "0.4em", color: "rgba(235,229,219,0.65)", lineHeight: "normal" }}>
        創業30年の伝統と技術
      </p>
      <p className="absolute" style={{ left: 148, top: 346, width: 316, textAlign: "center", fontFamily: mincho, fontSize: 13, letterSpacing: "0.3em", color: "rgba(235,229,219,0.65)", lineHeight: "normal" }}>
        京都・亀岡、園部、福知山で愛される味
      </p>

      {/* ナビゲーションリンク */}
      {NAV_LINKS.map(({ label, top }) => (
        <a key={label} href="#" className="absolute" style={{
          left: 809, top, width: 220, height: 30,
          fontFamily: mincho, fontSize: 13, letterSpacing: "0.15em",
          color: "rgba(235,229,219,0.75)", textDecoration: "none",
          display: "flex", alignItems: "center",
        }}>
          {label}
        </a>
      ))}

      {/* ご予約ボタン */}
      <a href="#" className="absolute flex items-center overflow-hidden" style={{ left: 1128, top: 147, width: 171, height: 50, borderRadius: 25, border: "1px solid rgba(221,168,63,0.6)", textDecoration: "none" }}>
        <span className="absolute" style={{ left: 22, top: 11, fontFamily: "sans-serif", fontSize: 16, color: "#ffffff" }}>·</span>
        <span className="absolute" style={{ left: 35, top: 15, fontFamily: mincho, fontSize: 12, letterSpacing: "0.083em", color: "#ffffff" }}>ご予約</span>
        <span className="absolute" style={{ left: 82, top: 15, fontFamily: sans, fontSize: 12, fontWeight: 700, letterSpacing: "0.125em", color: "#ebe5db" }}>Reserve</span>
      </a>

      {/* テイクアウトボタン */}
      <a href="#" className="absolute flex items-center overflow-hidden" style={{ left: 1128, top: 237, width: 171, height: 50, borderRadius: 25, border: "1px solid rgba(221,168,63,0.6)", textDecoration: "none" }}>
        <span className="absolute" style={{ left: 22, top: 11, fontFamily: "sans-serif", fontSize: 16, color: "#ffffff" }}>·</span>
        <span className="absolute" style={{ left: 35, top: 15, fontFamily: mincho, fontSize: 12, letterSpacing: "0.083em", color: "#ffffff" }}>ご注文</span>
        <span className="absolute" style={{ left: 88, top: 15, fontFamily: sans, fontSize: 12, fontWeight: 700, letterSpacing: "0.125em", color: "#ebe5db" }}>Takeout</span>
      </a>

      {/* 区切り線 */}
      <div className="absolute" style={{ left: 0, top: 543, width: 1440, height: 1, backgroundColor: "rgba(255,255,255,0.08)" }} />

      {/* コピーライト */}
      <p className="absolute" style={{ left: 0, top: 558, width: 1440, textAlign: "center", fontFamily: sans, fontSize: 11, fontWeight: 300, letterSpacing: "0.2em", color: "rgba(235,229,219,0.4)" }}>
        © 焼肉平壌亭　all rights reserved.
      </p>
    </footer>
  );
}
