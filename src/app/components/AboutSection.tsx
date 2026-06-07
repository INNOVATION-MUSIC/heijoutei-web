"use client";

import Image from "next/image";
import PageHeader from "./PageHeader";

const mincho = "'Shippori Mincho', serif";
const display = "'Cormorant Garamond', serif";

/**
 * /about ページのメインコンテンツ（PageHeader 含む）。
 * Figma 設計幅 1440 / 全高 4211px。flex column で各ブロックを積み、
 * 縦位置は各ブロックの paddingTop で制御（marginTop は使わない）。
 * 写真枠内の画像トリミング・動画背景のみ absolute を許容。
 */
export default function AboutSection({ onOpenModal }: { onOpenModal: () => void }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", width: 1440, height: 4211, background: "#0a0a0a", overflow: "hidden" }}>

      {/* 共通ヘッダー */}
      <PageHeader onOpenModal={onOpenModal} />

      {/* About 見出し + ヒーロー画像（Hero 上端 y=297） */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", paddingLeft: 57, paddingRight: 40, paddingTop: 144 }}>
        {/* 左: ラベル + About */}
        <div style={{ display: "flex", gap: 49, alignItems: "flex-start", paddingTop: 17 }}>
          {/* 縦書きラベル「平壌亭について」 */}
          <div style={{ width: 44, height: 144, border: "1px solid rgba(255,255,255,0.3)", display: "flex", justifyContent: "center", alignItems: "center" }}>
            <span style={{ writingMode: "vertical-rl" as const, whiteSpace: "nowrap", fontFamily: mincho, fontSize: 12, letterSpacing: "8px", color: "#fff", lineHeight: 1 }}>
              平壌亭について
            </span>
          </div>
          {/* About タイトル */}
          <p style={{ paddingTop: 46, fontFamily: display, fontSize: 80, letterSpacing: "-1px", color: "#ebe5db", lineHeight: "normal", margin: 0 }}>About</p>
        </div>

        {/* 右: ヒーロー画像（820×320, 黒オーバーレイ0.4） */}
        <div style={{ position: "relative", width: 820, height: 320, overflow: "hidden", flexShrink: 0, background: "#472914" }}>
          <Image src="/images/about_hero.webp" alt="黒毛和牛" fill className="object-cover" style={{ objectPosition: "center 35%" }} sizes="820px" />
          <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.4)" }} />
        </div>
      </div>

      {/* こだわり1: 炭火動画（左）+ 縦書き「炭火が紡ぐ、至福の味わい。」（右） */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", paddingTop: 273, paddingRight: 142 }}>
        {/* 左: 動画背景 */}
        <div style={{ position: "relative", width: 938, height: 715, overflow: "hidden", background: "#472914", flexShrink: 0 }}>
          <video src="/images/concept.mp4" autoPlay loop muted playsInline style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
        </div>
        {/* 右: 縦書き2列 */}
        <div style={{ display: "flex", gap: 62, alignItems: "flex-start" }}>
          {/* 左列: 至福の味わい。（下に129pxオフセット） */}
          <p style={{ paddingTop: 129, writingMode: "vertical-rl" as const, fontFamily: mincho, fontSize: 40, lineHeight: "58px", color: "#fff", margin: 0 }}>至福の味わい。</p>
          {/* 右列: 炭火が紡ぐ、 */}
          <p style={{ writingMode: "vertical-rl" as const, fontFamily: mincho, fontSize: 40, lineHeight: "58px", color: "#fff", margin: 0 }}>炭火が紡ぐ、</p>
        </div>
      </div>

      {/* テキスト1（左）+ 肉カット写真（右） */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", paddingLeft: 117, paddingTop: 176 }}>
        <p style={{ fontFamily: mincho, fontSize: 18, fontWeight: 400, letterSpacing: "6px", lineHeight: "50px", color: "#ebe5db", margin: 0 }}>
          創業以来、私たちが大切にしてきたのは<br />
          「本物の焼肉」を追求すること。<br /><br />
          厳選された黒毛和牛、<br />
          職人の手で丁寧にカットされた一枚一枚。<br />
          備長炭が生み出す遠赤外線の力で、<br />
          肉本来の旨みを最大限に引き出します。
        </p>
        <div style={{ position: "relative", width: 746, height: 504, overflow: "hidden", background: "#472914", flexShrink: 0 }}>
          <Image src="/images/about_cut.webp" alt="職人がカットする黒毛和牛" fill className="object-cover" sizes="746px" />
        </div>
      </div>

      {/* 座敷写真（左）+ テキスト2（右） */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", paddingTop: 243, paddingRight: 162 }}>
        <div style={{ position: "relative", width: 600, height: 715, overflow: "hidden", background: "#472914", flexShrink: 0 }}>
          <Image src="/images/about_zashiki.webp" alt="店内のテーブル席" fill className="object-cover" sizes="600px" />
        </div>
        <p style={{ fontFamily: mincho, fontSize: 18, fontWeight: 400, letterSpacing: "6px", lineHeight: "50px", color: "#ebe5db", margin: 0, textAlign: "left" }}>
          炎が肉を包み、香ばしい煙が立ち上る瞬間。<br />
          そこにあるのは、<br />
          ただの食事ではなく、特別な体験です。<br /><br />
          京都・丹波の地で、<br />
          大切な人と過ごす至福のひととき。<br /><br />
          ここでしか味わえない、<br />
          本格炭火焼肉の真髄を。
        </p>
      </div>

      {/* 店舗内観写真（右下） */}
      <div style={{ display: "flex", justifyContent: "flex-end", paddingTop: 0 }}>
        <div style={{ position: "relative", width: 531, height: 715, overflow: "hidden", background: "#472914", flexShrink: 0 }}>
          <Image src="/images/about_interior.webp" alt="店舗内観" fill className="object-cover" sizes="531px" />
        </div>
      </div>

      {/* 残余スペーサー（全高4211まで） */}
      <div style={{ flex: 1 }} />
    </div>
  );
}
