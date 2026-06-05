import Image from "next/image";

const mincho = "'Shippori Mincho', serif";
const sans = "'Noto Sans JP', sans-serif";

const NAV_LINKS = [
  "お知らせ",
  "平壌亭について",
  "メニュー",
  "店舗一覧",
  "ご予約",
  "公式オンラインストア",
  "採用情報",
  "お問い合せ",
];

export default function FooterSP() {
  return (
    <footer className="relative overflow-hidden bg-[#0a0a0a]" style={{ width: 390, height: 973 }}>
      {/* ロゴ */}
      <div className="absolute" style={{ left: 65, top: 80, width: 260, height: 148 }}>
        <Image src="/images/footer_logo.png" alt="焼肉平壌亭" fill className="object-contain" sizes="260px" />
      </div>

      {/* キャッチコピー */}
      <p className="absolute" style={{ left: 0, top: 286, width: 390, textAlign: "center", fontFamily: mincho, fontSize: 13, letterSpacing: "0.35em", color: "rgba(235,229,219,0.65)" }}>
        創業30年の伝統と技術
      </p>
      <p className="absolute" style={{ left: 0, top: 320, width: 390, textAlign: "center", fontFamily: mincho, fontSize: 13, letterSpacing: "0.2em", color: "rgba(235,229,219,0.65)" }}>
        京都・亀岡、園部、福知山で愛される味
      </p>

      {/* ナビゲーション */}
      <div className="absolute" style={{ left: 0, top: 369, width: 390 }}>
        {NAV_LINKS.map((label) => (
          <a key={label} href="#" style={{
            display: "block",
            textAlign: "center",
            height: 38,
            lineHeight: "38px",
            fontFamily: mincho,
            fontSize: 13,
            letterSpacing: "0.15em",
            color: "rgba(235,229,219,0.75)",
            textDecoration: "none",
          }}>
            {label}
          </a>
        ))}
      </div>

      {/* ご予約ボタン */}
      <a href="#" className="absolute flex items-center overflow-hidden" style={{ left: 109, top: 757, width: 171, height: 50, borderRadius: 25, border: "1px solid rgba(221,168,63,0.6)", textDecoration: "none" }}>
        <span className="absolute" style={{ left: 22, top: 11, fontFamily: "sans-serif", fontSize: 16, color: "#ffffff" }}>·</span>
        <span className="absolute" style={{ left: 35, top: 15, fontFamily: mincho, fontSize: 12, letterSpacing: "0.083em", color: "#ffffff" }}>ご予約</span>
        <span className="absolute" style={{ left: 82, top: 15, fontFamily: sans, fontSize: 12, fontWeight: 700, letterSpacing: "0.125em", color: "#ebe5db" }}>Reserve</span>
      </a>

      {/* テイクアウトボタン */}
      <a href="#" className="absolute flex items-center overflow-hidden" style={{ left: 109, top: 847, width: 171, height: 50, borderRadius: 25, border: "1px solid rgba(221,168,63,0.6)", textDecoration: "none" }}>
        <span className="absolute" style={{ left: 22, top: 11, fontFamily: "sans-serif", fontSize: 16, color: "#ffffff" }}>·</span>
        <span className="absolute" style={{ left: 35, top: 15, fontFamily: mincho, fontSize: 12, letterSpacing: "0.083em", color: "#ffffff" }}>ご注文</span>
        <span className="absolute" style={{ left: 88, top: 15, fontFamily: sans, fontSize: 12, fontWeight: 700, letterSpacing: "0.125em", color: "#ebe5db" }}>Takeout</span>
      </a>

      {/* 区切り線 */}
      <div className="absolute" style={{ left: 0, top: 915, width: 390, height: 1, backgroundColor: "rgba(255,255,255,0.08)" }} />

      {/* コピーライト */}
      <p className="absolute" style={{ left: 0, top: 930, width: 390, textAlign: "center", fontFamily: sans, fontSize: 10, fontWeight: 300, letterSpacing: "0.15em", color: "rgba(235,229,219,0.4)" }}>
        © 焼肉平壌亭　all rights reserved.
      </p>
    </footer>
  );
}
