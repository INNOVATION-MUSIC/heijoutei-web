import Image from "next/image";

const mincho = "'Shippori Mincho', serif";
const display = "'Cormorant Garamond', serif";

const COURSES = [
  {
    img: "/images/course1.jpg",
    sub: "前菜からデザートまで",
    name: "フルコース",
    price: "¥8,500〜",
    desc: "華やかで充実した料理内容で、少し改まった席や女性の多い宴会などにおすすめします。",
    top: 281,
    photoH: 320,
  },
  {
    img: "/images/course2.jpg",
    sub: "お肉と野菜をご用意",
    name: "焼き肉と野菜の盛り合わせ",
    price: "¥4,950〜",
    desc: "ご飯ものやデザートは自由に選びたいという方へ。焼肉・焼き野菜・サラダのみのコースです。",
    top: 874,
    photoH: 320,
  },
  {
    img: "/images/course3.jpg",
    sub: "すべてセットになった安心コース",
    name: "飲み放題付 ポッキリ宴会",
    price: "¥8,500〜",
    desc: "華やかで充実した料理内容で、少し改まった席や女性の多い宴会などにおすすめします。",
    top: 1549,
    photoH: 280,
  },
];

export default function CourseSectionSP() {
  return (
    <section className="relative overflow-hidden bg-[#0f0d0a]" style={{ width: 390, height: 2411 }}>
      {/* ラベル */}
      <div className="absolute overflow-hidden" style={{ left: 22, top: 56, width: 44, height: 65, border: "1px solid rgba(255,255,255,0.3)" }}>
        <p className="absolute" style={{ left: 15, top: 21, fontFamily: mincho, fontSize: 12, letterSpacing: "0.083em", color: "#fff", writingMode: "vertical-rl" as const }}>コース</p>
      </div>
      {/* Course タイトル */}
      <p className="absolute" style={{ left: 74, top: 46, fontFamily: display, fontSize: 60, fontStyle: "italic", letterSpacing: "-1px", color: "#ebe5db", lineHeight: "normal" }}>Course</p>

      {/* 説明文 */}
      <p className="absolute" style={{ left: 22, top: 152, width: 346, fontFamily: mincho, fontSize: 13, letterSpacing: "0.1em", color: "rgba(235,229,219,0.85)", lineHeight: "34px" }}>
        シーンに合わせて選べる3タイプの宴会料理。<br />
        幹事様安心の2時間飲み放題もご用意しています。
      </p>

      {/* コースカード */}
      {COURSES.map((c) => (
        <a key={c.name} href="#" className="absolute overflow-hidden bg-[#171717]" style={{ left: 22, top: c.top, width: 346, textDecoration: "none" }}>
          {/* 写真 */}
          <div className="overflow-hidden bg-[#22140c]" style={{ width: 346, height: c.photoH }}>
            <Image src={c.img} alt={c.name} fill className="object-cover" sizes="346px" />
          </div>
          {/* テキスト */}
          <div style={{ padding: "18px 22px 24px" }}>
            <p style={{ fontFamily: mincho, fontSize: 10, letterSpacing: "0.4em", color: "rgba(217,184,107,0.7)", marginBottom: 8 }}>{c.sub}</p>
            <div style={{ width: 32, height: 1, backgroundColor: "rgba(217,184,107,0.5)", marginBottom: 10 }} />
            <p style={{ fontFamily: mincho, fontSize: 20, fontWeight: 600, letterSpacing: "0.077em", color: "#ebe5db", marginBottom: 8 }}>{c.name}</p>
            <p style={{ fontFamily: mincho, fontSize: 20, fontWeight: 700, letterSpacing: "0.042em", color: "#d9b86b", marginBottom: 12 }}>{c.price}</p>
            <p style={{ fontFamily: mincho, fontSize: 12, letterSpacing: "0.083em", lineHeight: "26px", color: "#fff" }}>{c.desc}</p>
          </div>
        </a>
      ))}

      {/* コースメニューボタン */}
      <a href="#" className="absolute flex items-center overflow-hidden" style={{ left: 113, top: 2191, width: 172, height: 50, borderRadius: 25, border: "1px solid rgba(221,168,63,0.6)", textDecoration: "none" }}>
        <span className="absolute" style={{ left: 22, top: 11, fontFamily: "sans-serif", fontSize: 16, color: "#fff" }}>·</span>
        <span className="absolute" style={{ left: 35, top: 15, fontFamily: mincho, fontSize: 12, letterSpacing: "0.083em", color: "#fff" }}>コースメニュー</span>
      </a>
    </section>
  );
}
