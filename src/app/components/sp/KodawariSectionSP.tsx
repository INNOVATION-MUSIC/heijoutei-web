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
          {`創業以来、私たちが大切にしてきたのは\n「本物の焼肉」を追求すること。\n\n厳選された黒毛和牛、\n職人の手で丁寧にカットされた一枚一枚。\n職人が見極める絶妙な火加減で、\n肉本来の旨みを最大限に引き出します。\n\n炎が肉を包み、\n香ばしい煙が立ち上る瞬間。\nそこにあるのは、\nただの食事ではなく、特別な体験です。\n\n京都・丹波の地で、\n大切な人と過ごす至福のひととき。\n\nここでしか味わえない、\n目利きが選ぶ和牛の真髄を。`}
        </p>
      </section>
    </>
  );
}
