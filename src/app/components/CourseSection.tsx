"use client";
import Image from "next/image";
import OutlineButton from "./OutlineButton";
import { SECTION_LINKS } from "@/app/lib/navLinks";
import type { TopCourse } from "@/app/lib/courseDb";

const mincho = "'Shippori Mincho', serif";
const display = "'Cormorant Garamond', serif";

// 画像はトップ専用ローカル据え置き。テキストは DB(courses) があれば上書き、無ければこの静的コピー。
const COURSES = [
  { img: "/images/menu_course_yasai.webp", sub: "前菜からデザートまで", name: "フルコース", price: "¥8,500〜", desc: "華やかで充実した料理内容で、少し改まった席や女性の多い宴会などにおすすめします。" },
  { img: "/images/course2.webp", sub: "お肉と野菜をご用意", name: "焼き肉と野菜の盛り合わせ", price: "¥4,950〜", desc: "ご飯ものやデザートは自由に選びたいという方へ。焼肉・焼き野菜・サラダのみのコースです。" },
  { img: "/images/course3.webp", sub: "すべてセットになった安心コース", name: "飲み放題付 ポッキリ宴会", price: "¥8,500〜", desc: "華やかで充実した料理内容で、少し改まった席や女性の多い宴会などにおすすめします。" },
];

// トップ専用のサブテキスト上書き（DBのtype_labelは/menu/courseと共有のため触らず、
// トップだけ見せたい文言はここでコード側から上書きする）。index: 0=1枚目...
const TOP_SUB_OVERRIDE: Record<number, string> = {
  0: "お肉と野菜をご用意。焼肉と野菜の盛り合わせ",
  2: "前菜からデザートまでのフルコース",
};

export default function CourseSection({ courses }: { courses?: TopCourse[] } = {}) {
  // 画像はローカル固定のまま、テキストのみ DB で上書き（DB 無ければ静的）。
  const cards = COURSES.map((c, i) => ({
    ...c,
    ...(courses?.[i] ?? {}),
    ...(TOP_SUB_OVERRIDE[i] ? { sub: TOP_SUB_OVERRIDE[i] } : {}),
  }));
  return (
    <section
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 60,
        width: 1440,
        height: 1020,
        backgroundColor: "#0f0d0a",
        overflow: "hidden",
      }}
    >
      {/* ヘッダー */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 25,
          paddingLeft: 66,
          paddingRight: 49,
          paddingTop: 41,
        }}
      >
        {/* ラベル | タイトル | スペーサー | ボタン（下揃え） */}
        <div style={{ display: "flex", alignItems: "flex-end", gap: 69 }}>
          <div
            style={{
              boxSizing: "border-box",
              width: 44,
              height: 94,
              padding: "8px 7px",
              flexShrink: 0,
              border: "1px solid rgba(255,255,255,0.3)",
              overflow: "hidden",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <p style={{ margin: 0, fontFamily: mincho, fontSize: 12, letterSpacing: "7px", lineHeight: "1", color: "#fff", writingMode: "vertical-rl" as const, whiteSpace: "nowrap", transform: "translateY(4px)" }}>コース</p>
          </div>
          <p style={{ fontFamily: display, fontSize: 80, letterSpacing: "-1px", color: "#ebe5db", lineHeight: "normal" }}>Course</p>
          <div style={{ flex: 1 }} />
          <OutlineButton jp="コースメニュー" href={SECTION_LINKS.course} width={172} align="center" />
        </div>
        {/* 説明文（paddingLeftでタイトル左端に揃える: 44+69=113） */}
        <p
          style={{
            paddingLeft: 113,
            fontFamily: mincho,
            fontSize: 15,
            letterSpacing: "0.1em",
            color: "rgba(235,229,219,0.85)",
            lineHeight: "40px",
          }}
        >
          シーンに合わせて選べる3タイプの宴会料理。<br />幹事様安心の2時間飲み放題もご用意しています。
        </p>
      </div>

      {/* コースカード */}
      <div style={{ display: "flex", gap: 40, paddingLeft: 50, paddingRight: 50 }}>
        {cards.map((c) => (
          <div
            key={c.name}
            style={{
              display: "flex",
              flexDirection: "column",
              width: 420,
              height: 576,
              backgroundColor: "#171717",
              overflow: "hidden",
              flexShrink: 0,
            }}
          >
            <div style={{ position: "relative", width: 420, height: 320, backgroundColor: "#22140c", flexShrink: 0 }}>
              <Image src={c.img} alt={c.name} fill className="object-cover object-center" sizes="420px" />
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                paddingLeft: 28,
                paddingTop: 30,
                gap: 12,
              }}
            >
              <p style={{ fontFamily: mincho, fontSize: 10, letterSpacing: "0.4em", color: "rgba(217,184,107,0.7)" }}>{c.sub}</p>
              <div style={{ width: 32, height: 1, backgroundColor: "rgba(217,184,107,0.5)", flexShrink: 0 }} />
              <p style={{ fontFamily: mincho, fontSize: 26, fontWeight: 600, letterSpacing: "0.077em", color: "#ebe5db" }}>{c.name}</p>
              <p style={{ fontFamily: mincho, fontSize: 24, fontWeight: 700, letterSpacing: "0.042em", color: "#d9b86b" }}>{c.price}</p>
              <p style={{ width: 364, fontFamily: mincho, fontSize: 12, letterSpacing: "0.083em", lineHeight: "28px", color: "#fff" }}>{c.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
