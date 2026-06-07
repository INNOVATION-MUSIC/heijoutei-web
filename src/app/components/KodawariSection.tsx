"use client";
import Image from "next/image";

const mincho = "'Shippori Mincho', serif";

export default function KodawariSection() {
  return (
    <>
      {/* こだわり 1: 炭火が紡ぐ、至福の味わい。 */}
      <section className="relative overflow-hidden bg-[#0d0a0a]" style={{ width: 1440, height: 920 }}>
        <video
          autoPlay
          loop
          muted
          playsInline
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", transform: "scale(1.05)" }}
        >
          <source src="/images/concept.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-black/70" />
        {/* 縦書き: 炭火が紡ぐ、 */}
        <div className="absolute flex items-start" style={{ left: 738, top: 224, width: 35 }}>
          <div className="flex flex-col" style={{ gap: 4 }}>
            {["炭","火","が","紡","ぐ"].map(ch => (
              <p key={ch} style={{ fontFamily: mincho, fontSize: 34, color: "#fff", lineHeight: "normal", margin: 0 }}>{ch}</p>
            ))}
            <p style={{ fontFamily: mincho, fontSize: 34, color: "#fff", transform: "rotate(180deg)", margin: 0 }}>、</p>
          </div>
        </div>
        {/* 縦書き: 至福の味わい。 */}
        <div className="absolute flex items-start" style={{ left: 666, top: 323, width: 34 }}>
          <div className="flex flex-col" style={{ gap: 4 }}>
            {["至","福","の","味","わ","い"].map(ch => (
              <p key={ch} style={{ fontFamily: mincho, fontSize: 34, color: "#fff", lineHeight: "normal", margin: 0 }}>{ch}</p>
            ))}
            <p style={{ fontFamily: mincho, fontSize: 34, color: "#fff", transform: "rotate(180deg)", margin: 0 }}>。</p>
          </div>
        </div>
      </section>

      {/* こだわり 2: 哲学テキスト */}
      <section className="relative overflow-hidden bg-[#0d0a0a]" style={{ width: 1440, height: 920 }}>
        <div className="absolute overflow-hidden bg-[#472914]" style={{ left: 0, top: -42, width: 1440, height: 962 }}>
          <Image src="/images/kodawari_bg.webp" alt="" fill className="object-cover" sizes="1440px" style={{ objectPosition: "right center" }} />
        </div>
        <div className="absolute inset-0 bg-black/70" />
        <p className="absolute text-center" style={{
          left: "50%", transform: "translateX(-50%)", top: 79,
          fontFamily: mincho, fontSize: 15, fontWeight: 400,
          letterSpacing: "0.4em", lineHeight: "44px", color: "#ebe5db", whiteSpace: "pre-line",
        }}>
          {`創業以来、私たちが大切にしてきたのは
「本物の焼肉」を追求すること。

厳選された黒毛和牛、
職人の手で丁寧にカットされた一枚一枚。
備長炭が生み出す遠赤外線の力で、
肉本来の旨みを最大限に引き出します。

炎が肉を包み、香ばしい煙が立ち上る瞬間。
そこにあるのは、
ただの食事ではなく、特別な体験です。

京都・丹波の地で、
大切な人と過ごす至福のひととき。

ここでしか味わえない、
本格炭火焼肉の真髄を。`}
        </p>
      </section>
    </>
  );
}
