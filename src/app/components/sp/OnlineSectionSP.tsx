import Image from "next/image";
import { SECTION_LINKS } from "@/app/lib/navLinks";
import SpButton from "./SpButton";

const mincho = "'Shippori Mincho', serif";
const display = "'Cormorant Garamond', serif";

export default function OnlineSectionSP() {
  return (
    <section
      style={{
        position: "relative",
        overflow: "hidden",
        width: 390,
        height: 973,
        background: "#0a0a0a",
        display: "flex",
        flexDirection: "column",
        paddingTop: 109,
        paddingBottom: 50,
      }}
    >
      {/* ラベル + タイトル */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          paddingLeft: 40,
          gap: 28,
          flexShrink: 0,
        }}
      >
        <div
          style={{
            width: 44,
            height: 85,
            border: "1px solid rgba(255,255,255,0.3)",
            overflow: "hidden",
            flexShrink: 0,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <p style={{ fontFamily: mincho, fontSize: 12, letterSpacing: "5px", color: "#fff", writingMode: "vertical-rl" as const, margin: 0 }}>
            通販
          </p>
        </div>
        <p style={{ fontFamily: display, fontSize: 48, letterSpacing: "-1px", color: "#ebe5db", lineHeight: "normal", paddingTop: 30, flexShrink: 0 }}>
          OnlineShop
        </p>
      </div>

      {/* gap: 258 - (109+85) = 64px */}
      <div style={{ height: 64, flexShrink: 0 }} />

      {/* 説明文 */}
      <p
        style={{
          paddingLeft: 38,
          paddingRight: 22,
          fontFamily: mincho,
          fontSize: 12,
          letterSpacing: "0.125em",
          color: "rgba(235,229,219,0.85)",
          lineHeight: "32px",
          flexShrink: 0,
        }}
      >
        焼肉専門店の本格的な味わいを、そのままご家庭へ。
        <br />
        お中元やお歳暮はもちろん、誕生日や記念日などの贈り物、
        感謝を伝えるお返しやご自宅での特別な食卓にもおすすめです。
      </p>

      {/* 写真: h=350 */}
      <div
        style={{
          width: 390,
          height: 350,
          overflow: "hidden",
          background: "#2e1c12",
          flexShrink: 0,
          position: "relative",
        }}
      >
        <Image src="/images/online_main.webp" alt="オンラインショップ" fill className="object-cover" sizes="390px" />
      </div>

      {/* gap: 804 - 765 = 39px */}
      <div style={{ height: 50, flexShrink: 0 }} />

      <SpButton href={SECTION_LINKS.online} label="オンラインショップ" />
    </section>
  );
}
