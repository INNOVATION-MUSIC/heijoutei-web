"use client";

import Image from "next/image";

const mincho = "'Shippori Mincho', serif";

export default function KodawariSectionSP() {
  return (
    <>
      {/* ━━━ こだわり1: 炭火が紡ぐ、至福の味わい。 ━━━ */}
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

        {/* 縦書き: 炭火が紡ぐ、 (Figma: left=210, top=235) */}
        <div
          style={{
            position: "absolute",
            left: 210,
            top: 235,
            display: "flex",
            alignItems: "flex-start",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {["炭", "火", "が", "紡", "ぐ"].map((ch) => (
              <p key={ch} style={{ fontFamily: mincho, fontSize: 30, color: "#fff", lineHeight: "normal", margin: 0 }}>
                {ch}
              </p>
            ))}
            <p style={{ fontFamily: mincho, fontSize: 30, color: "#fff", transform: "rotate(180deg)", margin: 0 }}>、</p>
          </div>
        </div>

        {/* 縦書き: 至福の味わい。 (Figma: left=144, top=314) */}
        <div
          style={{
            position: "absolute",
            left: 144,
            top: 314,
            display: "flex",
            alignItems: "flex-start",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {["至", "福", "の", "味", "わ", "い"].map((ch) => (
              <p key={ch} style={{ fontFamily: mincho, fontSize: 30, color: "#fff", lineHeight: "normal", margin: 0 }}>
                {ch}
              </p>
            ))}
            <p style={{ fontFamily: mincho, fontSize: 30, color: "#fff", transform: "rotate(180deg)", margin: 0 }}>。</p>
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
            src="/images/kodawari_bg.webp"
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
          {`創業以来、私たちが大切にしてきたのは\n「本物の焼肉」を追求すること。\n\n厳選された黒毛和牛、\n職人の手で丁寧にカットされた一枚一枚。\n備長炭が生み出す遠赤外線の力で、\n肉本来の旨みを最大限に引き出します。\n\n炎が肉を包み、\n香ばしい煙が立ち上る瞬間。\nそこにあるのは、\nただの食事ではなく、特別な体験です。\n\n京都・丹波の地で、\n大切な人と過ごす至福のひととき。\n\nここでしか味わえない、\n本格炭火焼肉の真髄を。`}
        </p>
      </section>
    </>
  );
}
