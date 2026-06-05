import Image from "next/image";

const mincho = "'Shippori Mincho', serif";
const display = "'Cormorant Garamond', serif";
const sans = "'Noto Sans JP', sans-serif";

export default function MenuSectionSP() {
  return (
    <section className="relative overflow-hidden bg-[#0a0a0a]" style={{ width: 390, height: 1105 }}>
      {/* ラベル */}
      <div className="absolute overflow-hidden" style={{ left: 22, top: 56, width: 44, height: 85, border: "1px solid rgba(255,255,255,0.3)" }}>
        <p className="absolute" style={{ left: 15, top: 6, fontFamily: mincho, fontSize: 12, letterSpacing: "0.083em", color: "#fff", writingMode: "vertical-rl" as const }}>おすすめ</p>
      </div>

      {/* Cuisine タイトル */}
      <p className="absolute" style={{ left: 74, top: 46, fontFamily: display, fontSize: 60, fontStyle: "italic", letterSpacing: "-1px", color: "#ebe5db", lineHeight: "normal" }}>Cuisine</p>

      {/* 説明文 */}
      <p className="absolute" style={{ left: 22, top: 162, width: 346, fontFamily: mincho, fontSize: 13, fontWeight: 400, letterSpacing: "0.1em", color: "rgba(235,229,219,0.85)", lineHeight: "36px" }}>
        地元・京都産和牛をはじめ、全国各地から厳選した<br />
        上質な和牛をご提供しております。<br />
        素材の良さを最大限に引き出した、こだわりの焼肉をぜひご堪能ください。
      </p>

      {/* サブキャッチ */}
      <p className="absolute" style={{ left: 0, top: 312, width: 390, textAlign: "center", fontFamily: mincho, fontSize: 24, color: "#fff", letterSpacing: "0.15em", lineHeight: "48px" }}>
        心を込めた<br />自信の一皿
      </p>

      {/* 料理写真 2枚 */}
      <div className="absolute overflow-hidden bg-[#472914]" style={{ left: 0, top: 422, width: 194, height: 280 }}>
        <Image src="/images/cuisine1.jpg" alt="料理" fill className="object-cover" sizes="194px" />
      </div>
      <div className="absolute overflow-hidden bg-[#472914]" style={{ left: 196, top: 422, width: 194, height: 280 }}>
        <Image src="/images/cuisine2.jpg" alt="料理" fill className="object-cover" sizes="194px" />
      </div>

      {/* 料理写真 2枚 (下段) */}
      <div className="absolute overflow-hidden bg-[#472914]" style={{ left: 0, top: 706, width: 194, height: 218 }}>
        <Image src="/images/cuisine3.jpg" alt="料理" fill className="object-cover" sizes="194px" />
      </div>
      <div className="absolute overflow-hidden bg-[#472914]" style={{ left: 196, top: 706, width: 194, height: 218 }}>
        <Image src="/images/cuisine4.jpg" alt="料理" fill className="object-cover" sizes="194px" />
      </div>

      {/* メニューボタン */}
      <a href="#" className="absolute flex items-center overflow-hidden" style={{ left: 103, top: 942, width: 184, height: 50, borderRadius: 25, border: "1px solid rgba(221,168,63,0.6)", textDecoration: "none" }}>
        <span className="absolute" style={{ left: 22, top: 11, fontFamily: "sans-serif", fontSize: 16, color: "#fff" }}>·</span>
        <span className="absolute" style={{ left: 35, top: 15, fontFamily: mincho, fontSize: 12, letterSpacing: "0.083em", color: "#fff" }}>メニュー</span>
        <span className="absolute" style={{ left: 100, top: 15, fontFamily: sans, fontSize: 12, fontWeight: 700, letterSpacing: "0.125em", color: "#ebe5db" }}>Menu</span>
      </a>
    </section>
  );
}
