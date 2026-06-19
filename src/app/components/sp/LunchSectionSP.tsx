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
      {/* ラベル + タイトル */}
      <div style={{ display: "flex", alignItems: "flex-start", paddingLeft: 40, gap: 28, flexShrink: 0 }}>
        <div
          style={{
            boxSizing: "border-box",
            width: 44, height: 94,
            padding: "8px 7px",
            border: "1px solid rgba(255,255,255,0.3)",
            overflow: "hidden", flexShrink: 0,
            display: "flex", justifyContent: "center", alignItems: "center",
          }}
        >
          <p style={{ margin: 0, fontFamily: mincho, fontSize: 12, letterSpacing: "7px", lineHeight: "1", color: "#fff", writingMode: "vertical-rl" as const, whiteSpace: "nowrap", transform: "translateY(4px)" }}>
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
      <div style={{ height: 36, flexShrink: 0 }} />

      <SpButton href={SECTION_LINKS.lunch} label="ランチメニュー" />

      {/* ボタンとコラージュの間（説明文の折返し量を吸収して重なりを防ぐ） */}
      <div style={{ flex: 1, minHeight: 36 }} />

      {/* サブ写真コラージュ（左上→右下のずらし配置をflexboxで再現） */}
      <div style={{ display: "flex", flexDirection: "column", flexShrink: 0 }}>
        <div style={{ width: 238, height: 160, overflow: "hidden", background: "#241a14", position: "relative", alignSelf: "flex-start" }}>
          <Image src="/images/lunch_sub1.webp" alt="" fill className="object-cover" sizes="238px" />
        </div>
        <div style={{ height: 30, flexShrink: 0 }} />
        <div style={{ width: 229, height: 186, overflow: "hidden", background: "#241a14", position: "relative", alignSelf: "flex-end" }}>
          <Image src="/images/lunch_sub2.webp" alt="" fill className="object-cover" sizes="229px" />
        </div>
      </div>
    </section>
  );
}
