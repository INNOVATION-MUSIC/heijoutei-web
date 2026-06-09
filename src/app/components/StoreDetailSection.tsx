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

/** スライダーのアロー（前へ/次へ）。お知らせ詳細（NewsDetailSection）と同じ細身シェブロン。
 *  通常 rgba(235,229,219,0.55)・ホバーで #ebe5db＋外側へ ±5px スライド。 */
function SlideArrow({ dir, onClick }: { dir: "prev" | "next"; onClick: () => void }) {
  const [hover, setHover] = useState(false);
  const isPrev = dir === "prev";
  const stroke = hover ? "#ebe5db" : "rgba(235,229,219,0.55)";
  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      aria-label={isPrev ? "前の写真" : "次の写真"}
      style={{ border: "none", background: "transparent", padding: 0, cursor: "pointer", display: "block", lineHeight: 0 }}
    >
      <svg
        width="11"
        height="20"
        viewBox="0 0 11 20"
        fill="none"
        aria-hidden
        style={{
          display: "block",
          transform: hover ? `translateX(${isPrev ? -5 : 5}px)` : "none",
          transition: "transform 0.3s ease",
        }}
      >
        <path
          d={isPrev ? "M10 1 L1 10 L10 19" : "M1 1 L10 10 L1 19"}
          stroke={stroke}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}

/** 上部写真スライダー（500×500 を横並び・viewport 740px で右端ブリード）。
 *  アロークリックで track を 1 枚分（560px = 写真500 + gap60）translateX。
 *  端は循環（modulo）で前後どちらのアローも常に有効。 */
function PhotoSlider({ photos, name }: { photos: string[]; name: string }) {
  const [index, setIndex] = useState(0);
  const len = photos.length;
  const STEP = 560; // 写真 500 + gap 60
  const prev = () => setIndex((i) => (i - 1 + len) % len);
  const next = () => setIndex((i) => (i + 1) % len);

  return (
    <div style={{ display: "flex", flexDirection: "column", flexShrink: 0 }}>
      {/* viewport（x=700 起点・幅 740 = 1440 - 700）。track を translateX でスライド・右端はブリードでクリップ */}
      <div style={{ width: 740, overflow: "hidden" }}>
        <div
          style={{
            display: "flex",
            gap: 60,
            transform: `translateX(-${index * STEP}px)`,
            transition: "transform 0.5s cubic-bezier(0.22,1,0.36,1)",
          }}
        >
          {photos.map((src, i) => (
            <div key={i} style={{ position: "relative", width: 500, height: 500, flexShrink: 0, overflow: "hidden", background: "#1c110a" }}>
              <Image src={src} alt={`${name} 写真${i + 1}`} fill className="object-cover" sizes="500px" />
            </div>
          ))}
        </div>
      </div>

      {/* アロー行（左: 前へ / 右: 次へ）。写真下端から 24px・幅500=1枚目の写真と同幅（右アローを1枚目右端に揃える） */}
      {len > 1 && (
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: 500, paddingTop: 24 }}>
          <SlideArrow dir="prev" onClick={prev} />
          <SlideArrow dir="next" onClick={next} />
        </div>
      )}
    </div>
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

        {/* 右: 写真スライダー（500×500・アローで切替・右端ブリード） */}
        <PhotoSlider photos={store.photos} name={store.name} />
      </div>

      {/* ボタン行（友だち追加 / メニュー / テイクアウト / ご予約）。アロー行（+44）分 paddingTop を 84→40 に */}
      <div style={{ display: "flex", gap: 50, paddingLeft: 165, paddingTop: 40 }}>
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
