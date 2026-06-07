"use client";

import Image from "next/image";

const NAV = [
  "お問い合せ",
  "採用情報",
  "公式オンラインストア",
  "店舗情報",
  "メニュー",
  "お知らせ",
  "平壌亭について",
];

const LINE_BTNS = [
  { label: "亀岡店", width: 185 },
  { label: "園部店", width: 185 },
  { label: "福知山店", width: 192 },
  { label: "焼肉ゆらの", width: 200 },
];

const mincho = "'Shippori Mincho', serif";
const sans = "'Noto Sans JP', sans-serif";

export default function HeroSection({ onOpenModal }: { onOpenModal: () => void }) {
  return (
    <>
      {/* section全体をflex-rowで左右カラムに分割 */}
      <section style={{ display: "flex", width: 1440, height: 921, overflow: "hidden", background: "#0a0a0a" }}>

        {/*
          左カラム: flexboxレイアウト
          width=587 → 中心x=293.5 = logo(247)/nav(293)/button(171) すべての中心x と一致
          alignItems: center で各要素が x=170/147/208 に自動配置される
        */}
        <div style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          alignItems: "center",
          width: 587,
          height: 921,
          paddingTop: 61,
          paddingBottom: 59,
        }}>

          {/* 上グループ: テキスト + ロゴ */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 93, width: "100%" }}>

            {/* テキストエリア */}
            <div style={{
              width: "100%",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 16,
            }}>
              <p style={{ fontFamily: sans, fontSize: 9, fontWeight: 300, letterSpacing: "0.55em", color: "#59544f", whiteSpace: "nowrap" }}>
                {"YAKINIKU  HEIJOHTEI"}
              </p>
              <p style={{ fontFamily: mincho, fontSize: 22, fontWeight: 400, letterSpacing: "0.27em", lineHeight: "44px", color: "#ebe5db", textAlign: "center" }}>
                本格炭火焼肉で、<br />特別なひとときを。
              </p>
              <p style={{ fontFamily: sans, fontSize: 10, fontWeight: 300, letterSpacing: "0.15em", color: "#99948c", lineHeight: "22px", textAlign: "center" }}>
                Savor unforgettable moments<br />over authentic charcoal-grilled yakiniku.
              </p>
            </div>

            {/* ロゴ: width=247 → (587-247)/2=170 → x=170 に自動配置 */}
            <div style={{ position: "relative", width: 247, height: 129 }}>
              <Image src="/images/logo.webp" alt="焼肉平壌亭" fill className="object-contain" sizes="247px" />
            </div>
          </div>

          {/* 下グループ: ナビ + 予約ボタン */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 152, width: "100%" }}>

            {/* 縦書きナビ: ul width=293 → (587-293)/2=147 → x=147 に自動配置 */}
            <nav>
              <ul style={{ display: "flex", listStyle: "none", width: 293, justifyContent: "space-between" }}>
                {NAV.map((label) => (
                  <li key={label}>
                    <p style={{ fontFamily: "sans-serif", fontSize: 16, fontWeight: 700, color: "#ffffff", textAlign: "center", lineHeight: "20px", margin: 0 }}>·</p>
                    <a href={label === "平壌亭について" ? "/about" : "#"} style={{
                      display: "block",
                      writingMode: "vertical-rl" as const,
                      fontFamily: mincho,
                      fontSize: 12,
                      fontWeight: 400,
                      letterSpacing: "0.083em",
                      color: "#ffffff",
                      textDecoration: "none",
                    }}>
                      {label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>

            {/* 予約ボタン: width=171 → (587-171)/2=208 → x=208 に自動配置 */}
            <button
              onClick={onOpenModal}
              style={{
                width: 171,
                height: 50,
                borderRadius: 25,
                border: "1px solid rgba(221,168,63,0.6)",
                background: "transparent",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 8,
                paddingLeft: 22,
              }}
            >
              <span style={{ fontFamily: "sans-serif", fontSize: 16, color: "#ffffff", lineHeight: "1" }}>·</span>
              <span style={{ fontFamily: mincho, fontSize: 12, fontWeight: 400, letterSpacing: "0.083em", color: "#ffffff" }}>ご予約</span>
              <span style={{ fontFamily: sans, fontSize: 12, fontWeight: 700, letterSpacing: "0.125em", color: "#ebe5db", whiteSpace: "nowrap" }}>Reserve</span>
            </button>
          </div>
        </div>

        {/* 右カラム: ヒーロー画像（paddingTopで40px下げ、グラデーションはimage上のoverlay） */}
        <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column", paddingTop: 40 }}>
          <div style={{ flex: 1, position: "relative" }}>
            <Image src="/images/hero_meat.webp" alt="焼肉平壌亭" fill className="object-cover" sizes="858px" priority />
            <div className="absolute inset-0" style={{ background: "linear-gradient(to right, #0a0a0a 0%, rgba(10,10,10,0.5) 20%, transparent 50%)" }} />
            <div className="absolute inset-0" style={{ background: "linear-gradient(to top, #0a0a0a 0%, transparent 40%)" }} />
          </div>
        </div>
      </section>

      {/* LINE バー */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: 1440, height: 79, background: "#273528", paddingLeft: 78, paddingRight: 38 }}>
        <p style={{ fontFamily: sans, fontSize: 16, fontWeight: 500, letterSpacing: "0.25em", lineHeight: "44px", color: "#ebe5db" }}>
          LINE登録でお得情報GET　ともだち募集中!!
        </p>
        <div style={{ display: "flex", gap: 30 }}>
          {LINE_BTNS.map(({ label, width }) => (
            <a key={label} href="#" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingLeft: 16, paddingRight: 14, width, height: 40, borderRadius: 25, border: "1px solid rgba(57,176,61,0.6)", textDecoration: "none" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <Image src="/images/line_icon.webp" width={23} height={23} alt="LINE" />
                <span style={{ fontFamily: mincho, fontSize: 12, fontWeight: 400, letterSpacing: "0.083em", color: "#ffffff" }}>{label}</span>
              </div>
              <span style={{ fontFamily: sans, fontSize: 12, fontWeight: 700, letterSpacing: "0.125em", color: "#ebe5db", whiteSpace: "nowrap" }}>友だち追加</span>
            </a>
          ))}
        </div>
      </div>

    </>
  );
}
