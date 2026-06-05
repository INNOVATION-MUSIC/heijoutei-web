import Image from "next/image";

const mincho = "'Shippori Mincho', serif";

export default function KodawariSectionSP() {
  return (
    <>
      {/* こだわり1: 炭火が紡ぐ、至福の味わい。 390×844 */}
      <section className="relative overflow-hidden bg-[#0d0a0a]" style={{ width: 390, height: 844 }}>
        <div className="absolute inset-0 overflow-hidden bg-[#472914]">
          <Image src="/images/kodawari_bg.jpg" alt="" fill className="object-cover" sizes="390px" />
        </div>
        <div className="absolute inset-0 bg-black/72" />

        {/* 縦書き: 炭火が紡ぐ、 */}
        <div className="absolute flex items-start" style={{ left: 290, top: 155, width: 30 }}>
          <div className="flex flex-col" style={{ gap: 3 }}>
            {["炭","火","が","紡","ぐ"].map(ch => (
              <p key={ch} style={{ fontFamily: mincho, fontSize: 30, color: "#fff", lineHeight: "normal", margin: 0 }}>{ch}</p>
            ))}
            <p style={{ fontFamily: mincho, fontSize: 30, color: "#fff", transform: "rotate(180deg)", margin: 0 }}>、</p>
          </div>
        </div>
        {/* 縦書き: 至福の味わい。 */}
        <div className="absolute flex items-start" style={{ left: 248, top: 222, width: 30 }}>
          <div className="flex flex-col" style={{ gap: 3 }}>
            {["至","福","の","味","わ","い"].map(ch => (
              <p key={ch} style={{ fontFamily: mincho, fontSize: 30, color: "#fff", lineHeight: "normal", margin: 0 }}>{ch}</p>
            ))}
            <p style={{ fontFamily: mincho, fontSize: 30, color: "#fff", transform: "rotate(180deg)", margin: 0 }}>。</p>
          </div>
        </div>
      </section>

      {/* こだわり2: 哲学テキスト 390×844 */}
      <section className="relative overflow-hidden bg-[#0d0a0a]" style={{ width: 390, height: 844 }}>
        <div className="absolute inset-0 overflow-hidden bg-[#472914]">
          <Image src="/images/kodawari_char.jpg" alt="" fill className="object-cover" style={{ objectPosition: "right center" }} sizes="390px" />
        </div>
        <div className="absolute inset-0 bg-black/75" />
        <p className="absolute" style={{
          left: 22, top: 55, width: 346,
          fontFamily: mincho, fontSize: 13, fontWeight: 400,
          letterSpacing: "0.3em", lineHeight: "38px", color: "#ebe5db",
          whiteSpace: "pre-line",
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
