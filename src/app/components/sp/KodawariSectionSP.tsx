"use client";

import Image from "next/image";

const mincho = "'Shippori Mincho', serif";

export default function KodawariSectionSP() {
  return (
    <>
      {/* ━━━ こだわり1: 目利きが選ぶ和牛と、受け継がれる秘伝の味。 ━━━ */}
      <section
        style={{
          position: "relative",
          overflow: "hidden",
          width: 390,
          height: 844,
          background: "#0a0a0a",
        }}
      >
        {/* 動画背景: PCと同様 concept.mp4 */}
        <video
          autoPlay
          loop
          muted
          playsInline
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        >
          <source src="/images/concept.mp4" type="video/mp4" />
        </video>
        {/* オーバーレイ */}
        <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.7)" }} />

        {/* 縦書き2列を上下センター配置（右:目利きが選ぶ和牛と、 左:受け継がれる秘伝の味。・右列を79px上にずらした階段組み。文字数に依らず自動センター） */}
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 36 }}>
            {/* 左列: 受け継がれる秘伝の味。（79px下げて階段配置） */}
            <div style={{ display: "flex", flexDirection: "column", gap: 4, marginTop: 79 }}>
              {["受", "け", "継", "が", "れ", "る", "秘", "伝", "の", "味"].map((ch) => (
                <p key={ch} style={{ fontFamily: mincho, fontSize: 30, color: "#fff", lineHeight: "normal", margin: 0 }}>
                  {ch}
                </p>
              ))}
              <p style={{ fontFamily: mincho, fontSize: 30, color: "#fff", transform: "rotate(180deg)", margin: 0 }}>。</p>
            </div>
            {/* 右列: 目利きが選ぶ和牛と、 */}
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {["目", "利", "き", "が", "選", "ぶ", "和", "牛", "と"].map((ch) => (
                <p key={ch} style={{ fontFamily: mincho, fontSize: 30, color: "#fff", lineHeight: "normal", margin: 0 }}>
                  {ch}
                </p>
              ))}
              <p style={{ fontFamily: mincho, fontSize: 30, color: "#fff", transform: "rotate(180deg)", margin: 0 }}>、</p>
            </div>
          </div>
        </div>
      </section>

      {/* ━━━ こだわり2: 哲学テキスト ━━━ */}
      <section
        style={{
          position: "relative",
          overflow: "hidden",
          width: 390,
          height: 844,
          background: "#0a0a0a",
        }}
      >
        {/* 背景画像 */}
        <div style={{ position: "absolute", inset: 0, overflow: "hidden", background: "#472914" }}>
          <Image
            src="/images/kodawari_cut.webp"
            alt=""
            fill
            className="object-cover"
            style={{ objectPosition: "right center" }}
            sizes="390px"
          />
        </div>
        {/* オーバーレイ */}
        <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.7)" }} />

        {/* テキスト (Figma: top=99, fontSize=14, letterSpacing=3px, lineHeight=38px) */}
        <p
          style={{
            position: "absolute",
            left: "50%",
            transform: "translateX(-50%)",
            top: 99,
            fontFamily: mincho,
            fontSize: 14,
            fontWeight: 400,
            letterSpacing: "3px",
            lineHeight: "38px",
            color: "#ebe5db",
            textAlign: "center",
            whiteSpace: "pre-line",
            width: 337,
          }}
        >
          {`平壌亭は創業50年以来、「美味い」を追求し続けています。\n\n厳選された和牛\n\n長年培った経験を持つ熟練の目利きが、自社の厳しい基準を満たした牛肉のみを厳選。使用する牛肉はA4・A5ランクに限定し、品質・肉質・脂の甘みにこだわっています。\n\nまた、地元京都・亀岡の牛をはじめ、その時々で最も良い状態の牛を複数の産地から選び抜き、産地名だけではなく本当に美味しいと認めた牛肉だけをご提供しています。`}
        </p>
      </section>
    </>
  );
}
