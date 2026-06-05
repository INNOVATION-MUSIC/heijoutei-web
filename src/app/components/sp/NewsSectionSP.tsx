import Image from "next/image";

const mincho = "'Shippori Mincho', serif";
const display = "'Cormorant Garamond', serif";
const sans = "'Noto Sans JP', sans-serif";

const NEWS = [
  { img: "/images/news1.jpg", date: "2026.05.1", title: "ゴールデンウィーク期間の営業について", tags: [{ label: "お知らせ", color: "#e18e3b" }] },
  { img: "/images/news2.jpg", date: "2026.05.1", title: "春の特選和牛コース登場！期間限定のご案内", tags: [{ label: "ブログ", color: "#da3425" }, { label: "亀岡店", color: "#16871d" }] },
];

export default function NewsSectionSP() {
  return (
    <section className="relative overflow-hidden bg-[#0a0a0a]" style={{ width: 390, height: 844 }}>
      {/* ぼかし背景 */}
      <div className="absolute overflow-hidden bg-[rgba(77,41,20,0.2)]" style={{ left: 0, top: 68, width: 390, height: 720 }}>
        <div className="absolute" style={{ left: -100, top: -500, width: 1200, height: 1200, filter: "blur(25px)", opacity: 0.5 }}>
          <Image src="/images/news_bg.jpg" alt="" fill className="object-cover" sizes="1200px" />
        </div>
        <div className="absolute inset-0 bg-black/50" />
      </div>

      {/* ラベル */}
      <div className="absolute overflow-hidden" style={{ left: 22, top: 62, width: 44, height: 85, border: "1px solid rgba(255,255,255,0.3)" }}>
        <p className="absolute" style={{ left: 15, top: 14, fontFamily: mincho, fontSize: 12, letterSpacing: "0.083em", color: "#fff", writingMode: "vertical-rl" as const }}>お知らせ</p>
      </div>

      {/* News タイトル */}
      <p className="absolute" style={{ left: 76, top: 52, fontFamily: display, fontSize: 60, fontStyle: "italic", letterSpacing: "-1px", color: "#ebe5db", lineHeight: "normal" }}>News</p>

      {/* ナビ矢印 */}
      <p className="absolute" style={{ left: 22, top: 200, fontFamily: sans, fontSize: 18, color: "rgba(255,255,255,0.5)", cursor: "pointer" }}>←</p>
      <p className="absolute" style={{ right: 22, top: 200, fontFamily: sans, fontSize: 18, color: "rgba(255,255,255,0.5)", cursor: "pointer" }}>→</p>

      {/* ニュースカード (メイン表示) */}
      <a href="#" className="absolute" style={{ left: 22, top: 228, width: 346, textDecoration: "none" }}>
        {/* 写真 */}
        <div className="overflow-hidden bg-[#4d2914]" style={{ width: 346, height: 260 }}>
          <Image src={NEWS[0].img} alt={NEWS[0].title} fill className="object-cover" sizes="346px" />
        </div>
        {/* メタ情報 */}
        <p style={{ fontFamily: sans, fontSize: 11, fontWeight: 300, letterSpacing: "0.083em", color: "#948f85", marginTop: 12 }}>{NEWS[0].date}</p>
        <div style={{ display: "flex", gap: 6, marginTop: 6, flexWrap: "wrap" as const }}>
          {NEWS[0].tags.map((tag, ti) => (
            <span key={ti} style={{ display: "inline-block", padding: "2px 8px", backgroundColor: tag.color, fontFamily: mincho, fontSize: 10, color: "#fff" }}>
              {tag.label}
            </span>
          ))}
        </div>
        {/* タイトル */}
        <p style={{ fontFamily: mincho, fontSize: 14, fontWeight: 400, letterSpacing: "0.1em", color: "#ebe5db", lineHeight: "1.7", marginTop: 8, width: 300 }}>
          {NEWS[0].title}
        </p>
      </a>

      {/* お知らせ一覧ボタン */}
      <a href="#" className="absolute flex items-center overflow-hidden" style={{ left: 108, top: 701, width: 174, height: 50, borderRadius: 25, border: "1px solid rgba(221,168,63,0.6)", textDecoration: "none" }}>
        <span className="absolute" style={{ left: 22, top: 11, fontFamily: "sans-serif", fontSize: 16, color: "#fff" }}>·</span>
        <span className="absolute" style={{ left: 35, top: 15, fontFamily: mincho, fontSize: 12, letterSpacing: "0.083em", color: "#fff" }}>お知らせ一覧</span>
      </a>
    </section>
  );
}
