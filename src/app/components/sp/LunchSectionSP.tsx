import Image from "next/image";
import { SECTION_LINKS } from "@/app/lib/navLinks";
import SpButton from "./SpButton";

const mincho = "'Shippori Mincho', serif";
const display = "'Cormorant Garamond', serif";

export default function LunchSectionSP() {
  return (
    <section
      style={{
        position: "relative",
        overflow: "hidden",
        width: 390,
        height: 1204,
        background: "#0a0a0a",
        display: "flex",
        flexDirection: "column",
        paddingTop: 33,
        paddingBottom: 50,
      }}
    >
      {/* サブ写真1・2: 特定位置に配置する構図のため absolute 許容 */}
      <div style={{ position: "absolute", left: 0, top: 675, width: 238, height: 160, overflow: "hidden", background: "#241a14" }}>
        <Image src="/images/lunch_sub1.webp" alt="" fill className="object-cover" sizes="238px" />
      </div>
      <div style={{ position: "absolute", left: 161, top: 865, width: 229, height: 186, overflow: "hidden", background: "#241a14" }}>
        <Image src="/images/lunch_sub2.webp" alt="" fill className="object-cover" sizes="229px" />
      </div>

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
            ランチ
          </p>
        </div>
        <p style={{ fontFamily: display, fontSize: 48, letterSpacing: "-1px", color: "#ebe5db", lineHeight: "normal", paddingTop: 20 }}>
          Lunch
        </p>
      </div>

      {/* gap: 167 - (33+85) = 49px */}
      <div style={{ height: 49, flexShrink: 0 }} />

      {/* メイン写真: w=358, h=194 */}
      <div style={{ width: 358, height: 194, overflow: "hidden", background: "#2e1c12", flexShrink: 0, position: "relative" }}>
        <Image src="/images/lunch_main.webp" alt="ランチ" fill className="object-cover" sizes="358px" />
      </div>

      {/* gap: 384 - (167+194) = 23px */}
      <div style={{ height: 23, flexShrink: 0 }} />

      {/* 説明文 */}
      <p
        style={{
          paddingLeft: 34, paddingRight: 33,
          fontFamily: mincho, fontSize: 12,
          letterSpacing: "0.125em", color: "rgba(235,229,219,0.85)",
          lineHeight: "32px", flexShrink: 0,
        }}
      >
        ランチタイムから、気軽に本格焼肉をお楽しみいただけます。
        <br />
        ご友人同士でのランチはもちろん、お仕事の合間のお食事やご家族でのお集まり、学生グループでのご利用まで、幅広いシーンでご好評いただいております。
      </p>

      {/* gap to button */}
      <div style={{ height: 50, flexShrink: 0 }} />

      <SpButton href={SECTION_LINKS.lunch} label="ランチメニュー" />
    </section>
  );
}
