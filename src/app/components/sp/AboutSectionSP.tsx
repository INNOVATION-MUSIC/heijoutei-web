"use client";

import Image from "next/image";

const mincho = "'Shippori Mincho', serif";
const display = "'Cormorant Garamond', serif";

/**
 * /about ページ SP 版メインコンテンツ。
 * Figma 設計幅 390 / 全高 3026px（CTA 開始位置まで）。
 * flex column で各ブロックを積み、縦位置は paddingTop（gap）で制御。marginTop 不使用。
 * ヘッダーは SpStickyHeader が固定表示するため先頭に 153px spacer のみ置く。
 * 写真枠内の画像トリミング・動画背景・グラデーションオーバーレイのみ absolute 許容。
 */
export default function AboutSectionSP() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        width: 390,
        height: 3026,
        background: "#0a0a0a",
        overflow: "hidden",
      }}
    >
      {/* ヘッダー高さ分のスペーサー（SpStickyHeader が上に固定表示） */}
      <div style={{ height: 153, flexShrink: 0 }} />

      {/* ヒーロー画像ストリップ（351×130・左右21pxインセット・黒オーバーレイ0.3） */}
      <div style={{ paddingLeft: 19 }}>
        <div style={{ position: "relative", width: 351, height: 130, overflow: "hidden", background: "#472914" }}>
          <Image src="/images/about_hero.webp" alt="黒毛和牛" fill className="object-cover" style={{ objectPosition: "center 35%" }} sizes="351px" preload />
          <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.3)" }} />
        </div>
      </div>

      {/* About 見出し（縦書きラベル + About） */}
      <div style={{ display: "flex", alignItems: "flex-start", paddingLeft: 19, paddingTop: 73, gap: 33 }}>
        {/* 縦書きラベル「平壌亭について」 */}
        <div style={{ boxSizing: "border-box", width: 44, height: 158, padding: "8px 7px", border: "1px solid rgba(255,255,255,0.3)", overflow: "hidden", flexShrink: 0, display: "flex", justifyContent: "center", alignItems: "center" }}>
          <span style={{ margin: 0, writingMode: "vertical-rl" as const, whiteSpace: "nowrap", fontFamily: mincho, fontSize: 12, letterSpacing: "7px", lineHeight: "1", color: "#fff", transform: "translateY(4px)" }}>
            平壌亭について
          </span>
        </div>
        {/* About タイトル */}
        <p style={{ paddingTop: 78, fontFamily: display, fontSize: 48, letterSpacing: "-1px", color: "#ebe5db", lineHeight: "normal", margin: 0 }}>About</p>
      </div>

      {/* こだわり: 炭火動画（330×347・左端ブリード） */}
      <div style={{ paddingTop: 57 }}>
        <div style={{ position: "relative", width: 330, height: 347, overflow: "hidden", background: "#472914" }}>
          <video src="/images/concept.mp4" autoPlay loop muted playsInline style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
        </div>
      </div>

      {/* タイトル「目利きが選ぶ和牛と、／受け継がれる秘伝の味。」（2行ステア配置・文字数増で2行目のインデントを縮小しはみ出し回避） */}
      <div style={{ display: "flex", flexDirection: "column", paddingTop: 36 }}>
        <p style={{ paddingLeft: 37, fontFamily: mincho, fontSize: 22, letterSpacing: "6px", lineHeight: "50px", color: "#ebe5db", margin: 0 }}>目利きが選ぶ和牛と、</p>
        <p style={{ paddingLeft: 60, fontFamily: mincho, fontSize: 22, letterSpacing: "6px", lineHeight: "50px", color: "#ebe5db", margin: 0 }}>受け継がれる秘伝の味。</p>
      </div>

      {/* ストーリー文1 */}
      <p style={{ paddingLeft: 37, paddingTop: 54, fontFamily: mincho, fontSize: 14, fontWeight: 400, letterSpacing: "3px", lineHeight: "38px", color: "#ebe5db", margin: 0 }}>
        創業以来、私たちが大切にしてきたのは<br />
        「本物の焼肉」を追求すること。<br /><br />
        厳選された黒毛和牛、<br />
        職人の手で丁寧にカットされた一枚一枚。<br />
        職人が見極める絶妙な火加減で、<br />
        肉本来の旨みを最大限に引き出します。
      </p>

      {/* 肉カット写真（266×229） */}
      <div style={{ paddingLeft: 95, paddingTop: 71 }}>
        <div style={{ position: "relative", width: 266, height: 229, overflow: "hidden", background: "#472914" }}>
          <Image src="/images/about_cut.webp" alt="職人がカットする黒毛和牛" fill className="object-cover" sizes="266px" />
        </div>
      </div>

      {/* ストーリー文2 */}
      <p style={{ paddingLeft: 37, paddingTop: 60, fontFamily: mincho, fontSize: 14, fontWeight: 400, letterSpacing: "3px", lineHeight: "38px", color: "#ebe5db", margin: 0 }}>
        炎が肉を包み、<br />
        香ばしい煙が立ち上る瞬間。<br />
        そこにあるのは、<br />
        ただの食事ではなく、特別な体験です。
      </p>

      {/* 座敷写真（279×318・左端ブリード） */}
      <div style={{ paddingTop: 73 }}>
        <div style={{ position: "relative", width: 279, height: 318, overflow: "hidden", background: "#472914" }}>
          <Image src="/images/about_zashiki.webp" alt="店内のテーブル席" fill className="object-cover" sizes="279px" />
        </div>
      </div>

      {/* ストーリー文3 */}
      <p style={{ paddingLeft: 37, paddingTop: 59, fontFamily: mincho, fontSize: 14, fontWeight: 400, letterSpacing: "3px", lineHeight: "38px", color: "#ebe5db", margin: 0 }}>
        京都・丹波の地で、<br />
        大切な人と過ごす至福のひととき。<br /><br />
        ここでしか味わえない、<br />
        目利きが選ぶ和牛の真髄を。
      </p>

      {/* 店舗内観写真（279×318・右端配置） */}
      <div style={{ display: "flex", justifyContent: "flex-end", paddingTop: 74 }}>
        <div style={{ position: "relative", width: 279, height: 318, overflow: "hidden", background: "#472914" }}>
          <Image src="/images/about_interior.webp" alt="店舗内観" fill className="object-cover" sizes="279px" />
        </div>
      </div>

      {/* 残余スペーサー（全高3026まで） */}
      <div style={{ flex: 1 }} />
    </div>
  );
}
