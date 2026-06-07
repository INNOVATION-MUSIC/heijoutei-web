"use client";

import Image from "next/image";
import { SECTION_LINKS } from "@/app/lib/navLinks";

const mincho = "'Shippori Mincho', serif";
const sans = "'Noto Sans JP', sans-serif";

interface Props {
  onOpenModal: () => void;
  onOpenLineModal: () => void;
}

export default function HeroSectionSP({ onOpenModal, onOpenLineModal }: Props) {
  return (
    <section
      style={{
        width: 390,
        height: 915,
        background: "#0a0a0a",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* ヘッダー高さ分のスペーサー（SpStickyHeader が上に固定表示） */}
      <div style={{ height: 153, flexShrink: 0 }} />

      {/* ヒーロー写真: 350×350、左右21pxインセット */}
      <div style={{ position: "relative", height: 350, flexShrink: 0 }}>
        <div
          style={{
            position: "absolute",
            left: 21,
            top: 0,
            width: 350,
            height: 350,
            overflow: "hidden",
          }}
        >
          <Image
            src="/images/hero_meat.webp"
            alt="焼肉平壌亭"
            fill
            className="object-cover"
            sizes="350px"
            priority
          />
        </div>
        {/* グラデーションオーバーレイ: 画像に重なる要素なので absolute 許容 */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(to bottom, transparent 60%, #0a0a0a 100%)",
          }}
        />
      </div>

      {/* コンテンツエリア: テキストブロック + 予約ボタン */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          paddingTop: 44,
          paddingBottom: 55,
        }}
      >
        {/* テキストブロック */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 8,
          }}
        >
          <p
            style={{
              fontFamily: sans,
              fontSize: 9,
              fontWeight: 300,
              letterSpacing: "5px",
              color: "#59544f",
              margin: 0,
              whiteSpace: "pre" as const,
            }}
          >
            {"YAKINIKU  HEIJOHTEI"}
          </p>
          <div
            style={{
              width: 50,
              height: 1,
              backgroundColor: "rgba(255,255,255,0.15)",
            }}
          />
          <p
            style={{
              fontFamily: mincho,
              fontSize: 18,
              fontWeight: 400,
              letterSpacing: "6px",
              color: "#ebe5db",
              lineHeight: "35px",
              margin: 0,
              textAlign: "center",
              paddingLeft: "6px", // letterSpacing末尾スペース補正でセンター合わせ
            }}
          >
            本格炭火焼肉で、
            <br />
            特別なひとときを。
          </p>
          <div
            style={{
              width: 50,
              height: 1,
              backgroundColor: "rgba(255,255,255,0.1)",
            }}
          />
          <p
            style={{
              fontFamily: sans,
              fontSize: 10,
              fontWeight: 300,
              letterSpacing: "1.5px",
              color: "#99948c",
              lineHeight: "22px",
              margin: 0,
              textAlign: "center",
            }}
          >
            Savor unforgettable moments
            <br />
            over authentic charcoal-grilled yakiniku.
          </p>
        </div>

        {/* スペーサー */}
        <div style={{ flex: 1 }} />

        {/* 予約ボタン: Figma 184×50、中央配置 */}
        <button
          onClick={onOpenModal}
          style={{
            width: 184,
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
          <span style={{ fontFamily: "sans-serif", fontSize: 16, color: "#fff", lineHeight: 1 }}>
            ·
          </span>
          <span
            style={{
              fontFamily: mincho,
              fontSize: 12,
              letterSpacing: "0.083em",
              color: "#fff",
            }}
          >
            ご予約
          </span>
          <span
            style={{
              fontFamily: sans,
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: "0.125em",
              color: "#ebe5db",
            }}
          >
            Reserve
          </span>
        </button>
      </div>

      {/* LINE バー */}
      <button
        onClick={onOpenLineModal}
        style={{
          height: 70,
          background: "#273528",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          border: "none",
          cursor: "pointer",
          width: "100%",
          flexShrink: 0,
        }}
      >
        {/* Figma: 240×40 の緑ボーダーボタン枠 */}
        <div
          style={{
            width: 240,
            height: 40,
            borderRadius: 25,
            border: "1px solid rgba(57,176,61,0.6)",
            display: "flex",
            alignItems: "center",
            paddingLeft: 17,
            gap: 9,
          }}
        >
          <div style={{ position: "relative", width: 23, height: 23, flexShrink: 0 }}>
            <Image
              src="/images/line_icon.webp"
              alt="LINE"
              fill
              className="object-contain"
              sizes="23px"
            />
          </div>
          <p
            style={{
              fontFamily: sans,
              fontSize: 13,
              fontWeight: 700,
              letterSpacing: "2px",
              color: "#ebe5db",
              margin: 0,
            }}
          >
            LINE登録でお得情報GET
          </p>
        </div>
      </button>
    </section>
  );
}
