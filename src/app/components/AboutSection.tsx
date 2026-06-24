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
          <div style={{ boxSizing: "border-box", width: 44, height: 158, padding: "8px 7px", border: "1px solid rgba(255,255,255,0.3)", overflow: "hidden", flexShrink: 0, display: "flex", justifyContent: "center", alignItems: "center" }}>
            <span style={{ margin: 0, writingMode: "vertical-rl" as const, whiteSpace: "nowrap", fontFamily: mincho, fontSize: 12, letterSpacing: "7px", lineHeight: "1", color: "#fff", transform: "translateY(4px)" }}>
              平壌亭について
            </span>
          </div>
          {/* About タイトル */}
          <p style={{ paddingTop: 46, fontFamily: display, fontSize: 80, letterSpacing: "-1px", color: "#ebe5db", lineHeight: "normal", margin: 0 }}>About</p>
        </div>

        {/* 右: ヒーロー画像（820×320, 黒オーバーレイ0.4） */}
        <div style={{ position: "relative", width: 820, height: 320, overflow: "hidden", flexShrink: 0, background: "#472914" }}>
          <Image src="/images/about_hero.webp" alt="黒毛和牛" fill className="object-cover" style={{ objectPosition: "center 35%" }} sizes="820px" preload />
          <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.4)" }} />
        </div>
      </div>

      {/* こだわり1: 炭火動画（左）+ 縦書き「目利きが選ぶ和牛と、受け継がれる秘伝の味。」（右） */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", paddingTop: 273, paddingRight: 142 }}>
        {/* 左: 動画背景 */}
        <div style={{ position: "relative", width: 938, height: 715, overflow: "hidden", background: "#472914", flexShrink: 0 }}>
          <video src="/images/concept.mp4" autoPlay loop muted playsInline style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
        </div>
        {/* 右: 縦書き2列 */}
        <div style={{ display: "flex", gap: 62, alignItems: "flex-start" }}>
          {/* 左列: 受け継がれる秘伝の味。（下に129pxオフセット） */}
          <p style={{ paddingTop: 129, writingMode: "vertical-rl" as const, fontFamily: mincho, fontSize: 40, lineHeight: "58px", color: "#fff", margin: 0 }}>受け継がれる秘伝の味。</p>
          {/* 右列: 目利きが選ぶ和牛と、 */}
          <p style={{ writingMode: "vertical-rl" as const, fontFamily: mincho, fontSize: 40, lineHeight: "58px", color: "#fff", margin: 0 }}>目利きが選ぶ和牛と、</p>
        </div>
      </div>

      {/* テキスト1（左）+ 肉カット写真（右） */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingLeft: 117, paddingTop: 176 }}>
        <p style={{ fontFamily: mincho, fontSize: 18, fontWeight: 400, letterSpacing: "6px", lineHeight: "50px", color: "#ebe5db", margin: 0 }}>
          平壌亭は創業50年以来、<br />
          「美味い」を追求し続けています。<br /><br />
          厳選された和牛<br /><br />
          長年培った経験を持つ熟練の目利きが、<br />
          自社の厳しい基準を満たした牛肉のみを厳選。<br />
          使用する牛肉はA4・A5ランクに限定し、<br />
          品質・肉質・脂の甘みにこだわっています。
        </p>
        <div style={{ position: "relative", width: 746, height: 504, overflow: "hidden", background: "#472914", flexShrink: 0 }}>
          <Image src="/images/about_cut.webp" alt="職人がカットする黒毛和牛" fill className="object-cover" sizes="746px" />
        </div>
      </div>

      {/* 座敷写真（左）+ テキスト2（右） */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 243, paddingRight: 162 }}>
        <div style={{ position: "relative", width: 600, height: 715, overflow: "hidden", background: "#472914", flexShrink: 0 }}>
          <Image src="/images/about_zashiki.webp" alt="店内のテーブル席" fill className="object-cover" sizes="600px" />
        </div>
        <p style={{ fontFamily: mincho, fontSize: 18, fontWeight: 400, letterSpacing: "6px", lineHeight: "50px", color: "#ebe5db", margin: 0, textAlign: "left" }}>
          創業50年受け継がれる秘伝のタレ<br /><br />
          焼肉店の命とも言われるタレは、<br />
          創業以来50年にわたり受け継がれてきた<br />
          秘伝の味。<br />
          厳選した和牛の旨みを<br />
          最大限に引き出します。
        </p>
      </div>

      {/* テキスト3（左）+ 店舗内観写真（右） */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingLeft: 117 }}>
        <p style={{ fontFamily: mincho, fontSize: 18, fontWeight: 400, letterSpacing: "6px", lineHeight: "50px", color: "#ebe5db", margin: 0 }}>
          一品一品へのこだわり<br /><br />
          平壌亭のこだわりは肉だけではありません。<br /><br />
          キムチ、ナムル、冷麺、スープ、<br />
          韓国料理など、豊富なアラカルトメニューも<br />
          一品一品丁寧に仕込み、<br />
          素材選びから味付けまで<br />
          妥協することなく追求しています。
        </p>
        <div style={{ position: "relative", width: 531, height: 715, overflow: "hidden", background: "#472914", flexShrink: 0 }}>
          <Image src="/images/about_interior.webp" alt="店舗内観" fill className="object-cover" sizes="531px" />
        </div>
      </div>

      {/* 残余スペーサー（全高4211まで） */}
      <div style={{ flex: 1 }} />
    </div>
  );
}
