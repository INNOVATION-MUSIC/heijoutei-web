import Image from "next/image";
import { SECTION_LINKS } from "@/app/lib/navLinks";
import SpButton from "./SpButton";

const mincho = "'Shippori Mincho', serif";
const display = "'Cormorant Garamond', serif";

const COURSES = [
  {
    img: "/images/course1.jpg",
    sub: "前菜からデザートまで",
    name: "フルコース",
    price: "¥8,500〜",
    desc: "華やかで充実した料理内容で、少し改まった席や女性の多い宴会などにおすすめします。",
  },
  {
    img: "/images/course2.jpg",
    sub: "お肉と野菜をご用意",
    name: "焼き肉と野菜の盛り合わせ",
    price: "¥4,950〜",
    desc: "ご飯ものやデザートは自由に選びたいという方へ。焼肉・焼き野菜・サラダのみのコースです。ご飯ものやデザートはお好きなものをお選びください。",
  },
  {
    img: "/images/course3.jpg",
    sub: "すべてセットになった安心コース",
    name: "飲み放題付 ポッキリ宴会",
    price: "¥8,500〜",
    desc: "華やかで充実した料理内容で、少し改まった席や女性の多い宴会などにおすすめします。",
  },
];

export default function CourseSectionSP() {
  return (
    <section
      style={{
        width: 390,
        height: 2411,
        background: "#0a0a0a",
        display: "flex",
        flexDirection: "column",
        paddingTop: 33,
        paddingBottom: 50,
      }}
    >
      {/* ラベル + タイトル */}
      <div style={{ display: "flex", alignItems: "flex-start", paddingLeft: 40, gap: 28, flexShrink: 0 }}>
        <div
          style={{
            width: 44, height: 85,
            border: "1px solid rgba(255,255,255,0.3)",
            overflow: "hidden", flexShrink: 0,
            display: "flex", justifyContent: "center", alignItems: "center",
          }}
        >
          <p style={{ fontFamily: mincho, fontSize: 12, letterSpacing: "5px", color: "#fff", writingMode: "vertical-rl" as const, margin: 0 }}>
            コース
          </p>
        </div>
        <p style={{ fontFamily: display, fontSize: 48, letterSpacing: "-1px", color: "#ebe5db", lineHeight: "normal", paddingTop: 20 }}>
          Course
        </p>
      </div>

      {/* gap: 159 - (33+85) = 41px */}
      <div style={{ height: 41, flexShrink: 0 }} />

      {/* 説明文 */}
      <p
        style={{
          paddingLeft: 40, paddingRight: 40,
          fontFamily: mincho, fontSize: 12,
          letterSpacing: "0.125em", color: "rgba(235,229,219,0.85)",
          lineHeight: "37px", flexShrink: 0,
        }}
      >
        シーンに合わせて選べる3タイプの宴会料理。
        <br />
        幹事様安心の2時間飲み放題もご用意しています。
      </p>

      {/* gap: 281 - (33+85+41+74) = 48px  ※74=description ~2line height */}
      <div style={{ height: 48, flexShrink: 0 }} />

      {/* コースカード */}
      <div style={{ display: "flex", flexDirection: "column", gap: 30, paddingLeft: 20, paddingRight: 20, flexShrink: 0 }}>
        {COURSES.map((c) => (
          <div key={c.name} style={{ background: "#171717", overflow: "hidden" }}>
            {/* 写真: h=320 */}
            <div style={{ width: 350, height: 320, overflow: "hidden", background: "#22140c", position: "relative" }}>
              <Image src={c.img} alt={c.name} fill className="object-cover" sizes="350px" />
            </div>
            {/* テキスト */}
            <div style={{ padding: "30px 28px 24px" }}>
              <p style={{ fontFamily: mincho, fontSize: 10, letterSpacing: "4px", color: "rgba(217,184,107,0.7)", marginBottom: 14 }}>
                {c.sub}
              </p>
              <div style={{ width: 32, height: 1, backgroundColor: "rgba(217,184,107,0.5)", marginBottom: 12 }} />
              <p style={{ fontFamily: mincho, fontSize: 26, fontWeight: 600, letterSpacing: "2px", color: "#ebe5db", marginBottom: 12 }}>
                {c.name}
              </p>
              <p style={{ fontFamily: mincho, fontSize: 24, fontWeight: 700, letterSpacing: "1px", color: "#d9b86b", marginBottom: 16 }}>
                {c.price}
              </p>
              <p style={{ fontFamily: mincho, fontSize: 14, letterSpacing: "1px", lineHeight: "28px", color: "#fff" }}>
                {c.desc}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div style={{ height: 50, flexShrink: 0 }} />

      <SpButton href={SECTION_LINKS.course} label="コースメニュー" />
    </section>
  );
}
