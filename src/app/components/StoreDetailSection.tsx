"use client";

import { type ReactNode, useState } from "react";
import Image from "next/image";
import PageHeader from "./PageHeader";
import OutlineButton from "./OutlineButton";
import { type StoreDetail } from "@/app/lib/storeDetailData";
import { SECTION_LINKS } from "@/app/lib/navLinks";

const mincho = "'Shippori Mincho', serif";
const sans = "'Noto Sans JP', sans-serif";
const GREEN = "rgba(57,176,61,0.6)"; // LINE 友だち追加ボタンのボーダー色
const LINE_GREEN = "#06C755"; // LINE 公式ブランドカラー（ホバー塗りつぶし）

/** LINE 友だち追加ボタン（緑枠・185×50・店舗名 + 友だち追加）。
 *  ホバーで枠色（緑）に塗りつぶし・テキストを白/太字に（OutlineButton と同方式）。 */
function LineButton({ name, href }: { name: string; href: string }) {
  const [hover, setHover] = useState(false);
  return (
    <a
      href={href}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        boxSizing: "border-box",
        position: "relative",
        width: 185,
        height: 50,
        borderRadius: 25,
        border: `1px solid ${GREEN}`,
        background: hover ? LINE_GREEN : "transparent",
        display: "flex",
        alignItems: "center",
        gap: 10,
        paddingLeft: 15,
        textDecoration: "none",
        flexShrink: 0,
        transition: "background-color 0.3s ease",
      }}
    >
      <span style={{ position: "relative", width: 23, height: 23, flexShrink: 0 }}>
        <Image src="/images/line_icon.webp" alt="LINE" fill className="object-contain" sizes="23px" />
      </span>
      <span style={{ fontFamily: mincho, fontSize: 12, fontWeight: hover ? 700 : 400, color: "#fff", letterSpacing: "1px", whiteSpace: "nowrap", transition: "font-weight 0.3s ease" }}>{name}</span>
      <span style={{ fontFamily: sans, fontSize: 12, fontWeight: 700, color: hover ? "#fff" : "#ebe5db", letterSpacing: "1.5px", whiteSpace: "nowrap", transition: "color 0.3s ease" }}>友だち追加</span>
    </a>
  );
}

/** 詳細テーブルの 1 行（ラベル + 値）。 */
function InfoRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-start" }}>
      <p style={{ width: 140, flexShrink: 0, fontFamily: sans, fontWeight: 300, fontSize: 16, lineHeight: "22px", letterSpacing: "0.5px", color: "#fff" }}>{label}</p>
      <div style={{ flex: 1 }}>{children}</div>
    </div>
  );
}

const valueStyle = {
  fontFamily: sans,
  fontWeight: 300,
  fontSize: 16,
  lineHeight: "22px",
  letterSpacing: "0.5px",
  color: "#fff",
  margin: 0,
} as const;

type Props = {
  store: StoreDetail;
  onOpenModal: () => void;
  height: number;
};

/**
 * /store/[id] 店舗詳細ページのメインコンテンツ（PageHeader 含む）。
 * Figma 設計幅 1440・「店舗一覧（詳細）」162:879（亀岡店）準拠。
 */
export default function StoreDetailSection({ store, onOpenModal, height }: Props) {
  const mapSrc = `https://maps.google.com/maps?q=${encodeURIComponent(store.address)}&z=16&output=embed`;

  return (
    <div style={{ display: "flex", flexDirection: "column", width: 1440, height, background: "#0a0a0a", overflow: "hidden" }}>
      {/* 共通ヘッダー */}
      <PageHeader onOpenModal={onOpenModal} />

      {/* ヒーロー帯（左: 店名・説明 / 右: 写真ストリップ）。上端 y=287 */}
      <div style={{ display: "flex", paddingLeft: 165, paddingTop: 134, alignItems: "flex-start" }}>
        {/* 左カラム（幅 535 = 写真開始 x700 - 165）。テキストは y=431 から */}
        <div style={{ width: 535, flexShrink: 0, paddingTop: 144, display: "flex", flexDirection: "column" }}>
          {/* 英字ラベル・金線・店名（gap12 でまとめる） */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <p style={{ fontFamily: sans, fontWeight: 300, fontSize: 10, letterSpacing: "3px", color: "rgba(217,184,107,0.6)", whiteSpace: "pre", margin: 0 }}>{store.enLabel}</p>
            <div style={{ width: 32, height: 1, background: "rgba(217,184,107,0.6)" }} />
            <p style={{ fontFamily: mincho, fontWeight: 800, fontSize: 32, letterSpacing: "2px", color: "#fff", whiteSpace: "pre", margin: 0 }}>{store.name}</p>
          </div>
          {store.desc && (
            <div style={{ paddingTop: 31 }}>
              {store.desc.map((line, i) => (
                <p key={i} style={{ fontFamily: mincho, fontWeight: 400, fontSize: 14, lineHeight: "36px", letterSpacing: "1.5px", color: "#fff", margin: 0 }}>{line}</p>
              ))}
            </div>
          )}
        </div>

        {/* 右: 写真ストリップ（500×500 を gap60・右端ブリード）。overflow:hidden で外側がクリップ */}
        <div style={{ display: "flex", gap: 60, flexShrink: 0 }}>
          {store.photos.map((src, i) => (
            <div key={i} style={{ position: "relative", width: 500, height: 500, flexShrink: 0, overflow: "hidden", background: "#1c110a" }}>
              <Image src={src} alt={`${store.name} 写真${i + 1}`} fill className="object-cover" sizes="500px" />
            </div>
          ))}
        </div>
      </div>

      {/* ボタン行（友だち追加 / メニュー / テイクアウト / ご予約）。上端 y=871 */}
      <div style={{ display: "flex", gap: 50, paddingLeft: 165, paddingTop: 84 }}>
        {store.lineName && store.lineUrl && <LineButton name={store.lineName} href={store.lineUrl} />}
        <OutlineButton jp="メニュー" href={SECTION_LINKS.menu} width={133} align="center" />
        <OutlineButton jp="テイクアウト" href={SECTION_LINKS.takeout} width={156} align="center" />
        <OutlineButton jp="ご予約" onClick={onOpenModal} width={131} align="center" />
      </div>

      {/* 詳細テーブル。先頭行 y=1009 */}
      <div style={{ display: "flex", flexDirection: "column", gap: 36, paddingLeft: 165, paddingRight: 30, paddingTop: 88 }}>
        <InfoRow label="住所">
          <p style={valueStyle}>{store.address}</p>
        </InfoRow>
        <InfoRow label="電話番号">
          <p style={{ ...valueStyle, fontFamily: sans, fontWeight: 500, fontSize: 24, color: "#d9b86b" }}>{store.phone}</p>
        </InfoRow>
        <InfoRow label="アクセス">
          <p style={valueStyle}>{store.access}</p>
        </InfoRow>
        <InfoRow label="営業時間">
          {store.hours.map((line, i) => (
            <p key={i} style={{ ...valueStyle, lineHeight: "32px" }}>{line}</p>
          ))}
        </InfoRow>
        <InfoRow label="定休日">
          <p style={valueStyle}>{store.closed}</p>
        </InfoRow>
        {store.seats && (
          <InfoRow label="お席">
            <p style={valueStyle}>{store.seats}</p>
          </InfoRow>
        )}
      </div>

      {/* 地図（1110×500・Google Maps 埋め込み） */}
      <div style={{ paddingLeft: 165, paddingTop: 62 }}>
        <div style={{ width: 1110, height: 500, overflow: "hidden", background: "#1c110a" }}>
          <iframe
            title={`${store.name} 地図`}
            src={mapSrc}
            width={1110}
            height={500}
            style={{ border: 0, display: "block" }}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </div>
    </div>
  );
}
