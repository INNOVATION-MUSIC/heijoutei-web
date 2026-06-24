"use client";
import Image from "next/image";

const mincho = "'Shippori Mincho', serif";

export default function KodawariSection() {
  return (
    <>
      {/* こだわり 1: 目利きが選ぶ和牛と、受け継がれる秘伝の味。 */}
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
        {/* 縦書き2列を上下センター配置（右:目利きが選ぶ和牛と、 左:受け継がれる秘伝の味。・右列を99px上にずらした階段組み。文字数に依らず自動センター） */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex items-start" style={{ gap: 38 }}>
            {/* 左列: 受け継がれる秘伝の味。（99px下げて階段配置） */}
            <div className="flex flex-col" style={{ gap: 4, marginTop: 99 }}>
              {["受","け","継","が","れ","る","秘","伝","の","味"].map(ch => (
                <p key={ch} style={{ fontFamily: mincho, fontSize: 34, color: "#fff", lineHeight: "normal", margin: 0 }}>{ch}</p>
              ))}
              <p style={{ fontFamily: mincho, fontSize: 34, color: "#fff", transform: "rotate(180deg)", margin: 0 }}>。</p>
            </div>
            {/* 右列: 目利きが選ぶ和牛と、 */}
            <div className="flex flex-col" style={{ gap: 4 }}>
              {["目","利","き","が","選","ぶ","和","牛","と"].map(ch => (
                <p key={ch} style={{ fontFamily: mincho, fontSize: 34, color: "#fff", lineHeight: "normal", margin: 0 }}>{ch}</p>
              ))}
              <p style={{ fontFamily: mincho, fontSize: 34, color: "#fff", transform: "rotate(180deg)", margin: 0 }}>、</p>
            </div>
          </div>
        </div>
      </section>

      {/* こだわり 2: 哲学テキスト */}
      <section className="relative overflow-hidden bg-[#0d0a0a]" style={{ width: 1440, height: 920 }}>
        <div className="absolute overflow-hidden bg-[#472914]" style={{ left: 0, top: -42, width: 1440, height: 962 }}>
          <Image src="/images/kodawari_cut.webp" alt="" fill className="object-cover" sizes="1440px" style={{ objectPosition: "right center" }} />
        </div>
        <div className="absolute inset-0 bg-black/70" />
        <p className="absolute text-center" style={{
          left: "50%", transform: "translateX(-50%)", top: 79,
          fontFamily: mincho, fontSize: 15, fontWeight: 400,
          letterSpacing: "0.4em", lineHeight: "44px", color: "#ebe5db", whiteSpace: "pre-line",
        }}>
          {`平壌亭は創業50年以来、
「美味い」を追求し続けています。

厳選された和牛

長年培った経験を持つ熟練の目利きが、
自社の厳しい基準を満たした牛肉のみを厳選。
使用する牛肉はA4・A5ランクに限定し、
品質・肉質・脂の甘みにこだわっています。

また、地元京都・亀岡の牛をはじめ、
その時々で最も良い状態の牛を複数の産地から
選び抜き、産地名だけではなく
本当に美味しいと認めた牛肉だけを
ご提供しています。`}
        </p>
      </section>
    </>
  );
}
