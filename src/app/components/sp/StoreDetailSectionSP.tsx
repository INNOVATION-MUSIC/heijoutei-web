"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { type StoreDetail } from "@/app/lib/storeDetailData";
import { SECTION_LINKS } from "@/app/lib/navLinks";

const mincho = "'Shippori Mincho', serif";
const sans = "'Noto Sans JP', sans-serif";
const GREEN = "rgba(57,176,61,0.6)"; // LINE 友だち追加ボタンのボーダー色

/** ゴールドの電話アイコン（22×22）。 */
function PhoneIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#d9b86b" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }} aria-hidden>
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  );
}

/** LINE 友だち追加ボタン（緑枠・185×50・ライン色アイコン + 店舗名 + 友だち追加）。 */
function LineButtonSP({ name, href }: { name: string; href: string }) {
  return (
    <a
      href={href}
      style={{
        boxSizing: "border-box",
        width: 185,
        height: 50,
        borderRadius: 25,
        border: `1px solid ${GREEN}`,
        background: "transparent",
        display: "flex",
        alignItems: "center",
        gap: 8,
        paddingLeft: 14,
        textDecoration: "none",
        flexShrink: 0,
      }}
    >
      <span style={{ position: "relative", width: 23, height: 23, flexShrink: 0 }}>
        <Image src="/images/line_icon.webp" alt="LINE" fill className="object-contain" sizes="23px" />
      </span>
      <span style={{ fontFamily: mincho, fontSize: 12, fontWeight: 400, color: "#fff", letterSpacing: "1px", whiteSpace: "nowrap" }}>{name}</span>
      <span style={{ fontFamily: sans, fontSize: 12, fontWeight: 700, color: "#ebe5db", letterSpacing: "1.5px", whiteSpace: "nowrap" }}>友だち追加</span>
    </a>
  );
}

/** ゴールド枠の金線ボタン（· プレフィックス付き）。href か onClick のどちらか。 */
function GoldButtonSP({ label, href, onClick, width }: { label: string; href?: string; onClick?: () => void; width: number }) {
  const inner = (
    <>
      <span style={{ fontFamily: "sans-serif", fontSize: 16, color: "#fff", lineHeight: 1 }}>·</span>
      <span style={{ fontFamily: mincho, fontSize: 13, letterSpacing: "1px", color: "#fff", whiteSpace: "nowrap" }}>{label}</span>
    </>
  );
  const style = {
    boxSizing: "border-box" as const,
    width,
    height: 50,
    borderRadius: 25,
    border: "1px solid rgba(221,168,63,0.6)",
    background: "transparent",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    textDecoration: "none",
    flexShrink: 0,
    cursor: "pointer",
  };
  if (href) {
    return <a href={href} style={style}>{inner}</a>;
  }
  return <button type="button" onClick={onClick} style={style}>{inner}</button>;
}

/** スライダーのアロー（前へ/次へ）。PC（StoreDetailSection）と同じ細身シェブロン。 */
function SlideArrow({ dir, onClick }: { dir: "prev" | "next"; onClick: () => void }) {
  const isPrev = dir === "prev";
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={isPrev ? "前の写真" : "次の写真"}
      style={{ border: "none", background: "transparent", padding: 0, cursor: "pointer", display: "block", lineHeight: 0 }}
    >
      <svg width="11" height="20" viewBox="0 0 11 20" fill="none" aria-hidden style={{ display: "block" }}>
        <path d={isPrev ? "M10 1 L1 10 L10 19" : "M1 1 L10 10 L1 19"} stroke="rgba(235,229,219,0.7)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  );
}

/** 上部写真スライダー（260×260 を横並び・viewport 350px で右端ブリード）。 */
function PhotoSliderSP({ photos, name }: { photos: string[]; name: string }) {
  const [index, setIndex] = useState(0);
  const len = photos.length;
  const STEP = 280; // 写真 260 + gap 20
  const prev = () => setIndex((i) => (i - 1 + len) % len);
  const next = () => setIndex((i) => (i + 1) % len);

  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      {/* viewport（幅 350・右端はブリードでクリップ） */}
      <div style={{ width: 350, overflow: "hidden" }}>
        <div
          style={{
            display: "flex",
            gap: 20,
            transform: `translateX(-${index * STEP}px)`,
            transition: "transform 0.5s cubic-bezier(0.22,1,0.36,1)",
          }}
        >
          {photos.map((src, i) => (
            <div key={i} style={{ position: "relative", width: 260, height: 260, flexShrink: 0, overflow: "hidden", background: "#1c110a" }}>
              <Image src={src} alt={`${name} 写真${i + 1}`} fill className="object-cover" sizes="260px" />
            </div>
          ))}
        </div>
      </div>

      {/* アロー行（左: 前へ / 右: 次へ・viewport 全幅で振り分け） */}
      {len > 1 && (
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: 350, paddingTop: 22 }}>
          <SlideArrow dir="prev" onClick={prev} />
          <SlideArrow dir="next" onClick={next} />
        </div>
      )}
    </div>
  );
}

const labelStyle = {
  width: 89,
  flexShrink: 0,
  fontFamily: sans,
  fontWeight: 300,
  fontSize: 14,
  lineHeight: "22px",
  letterSpacing: "0.5px",
  color: "#fff",
  margin: 0,
} as const;

const valueStyle = {
  fontFamily: sans,
  fontWeight: 300,
  fontSize: 14,
  lineHeight: "22px",
  letterSpacing: "0.5px",
  color: "#fff",
  margin: 0,
} as const;

/** 詳細テーブルの 1 行（ラベル + 値）。 */
function InfoRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-start" }}>
      <p style={labelStyle}>{label}</p>
      <div style={{ flex: 1 }}>{children}</div>
    </div>
  );
}

type Props = {
  store: StoreDetail;
  height: number;
  onOpenModal: () => void;
  /** ヘッダースペーサーを除いたコンテンツ実測高さ（design 390 幅でのpx）を親へ通知 */
  onMeasured?: (h: number) => void;
};

/**
 * /store/[id] 店舗詳細ページ SP 版メインコンテンツ。Figma 設計幅 390（node 2135:1142）。
 * ヘッダーは SpStickyHeader が固定表示するため先頭に 153px spacer のみ置く。
 * 縦並び: 店名ブロック → 説明 → 写真スライダー(260×260) → ボタン4種(2行) → 詳細テーブル → 地図(350×300)。
 * 説明/アクセス/営業時間/お席 が折返しで高さ可変のため、コンテンツ全体を ResizeObserver で実測し
 * 全高（height）算出に使う。縦位置は paddingTop（gap）で制御し marginTop / 配置 absolute は不使用。
 */
export default function StoreDetailSectionSP({ store, height, onOpenModal, onMeasured }: Props) {
  const mapSrc = `https://maps.google.com/maps?q=${encodeURIComponent(store.address)}&z=16&output=embed`;

  const contentRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = contentRef.current;
    if (!el || !onMeasured) return;
    const report = () => onMeasured(el.offsetHeight);
    report();
    const ro = new ResizeObserver(report);
    ro.observe(el);
    return () => ro.disconnect();
  }, [onMeasured, store]);

  return (
    <div style={{ display: "flex", flexDirection: "column", width: 390, height, background: "#0a0a0a", overflow: "hidden" }}>

      {/* ヘッダー高さ分のスペーサー（SpStickyHeader が上に固定表示） */}
      <div style={{ height: 153, flexShrink: 0 }} />

      <div ref={contentRef} style={{ display: "flex", flexDirection: "column", paddingLeft: 20, paddingRight: 20, paddingBottom: 149 }}>
        {/* 英字ラベル・金線・店名 */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <p style={{ fontFamily: sans, fontWeight: 300, fontSize: 10, letterSpacing: "3px", color: "rgba(217,184,107,0.6)", whiteSpace: "pre", margin: 0 }}>{store.enLabel}</p>
          <div style={{ width: 32, height: 1, background: "rgba(217,184,107,0.6)" }} />
          <p style={{ fontFamily: mincho, fontWeight: 800, fontSize: 28, letterSpacing: "2px", color: "#fff", whiteSpace: "pre", margin: 0 }}>{store.name}</p>
        </div>

        {/* 説明文 */}
        {store.desc && (
          <div style={{ paddingTop: 34 }}>
            {store.desc.map((line, i) => (
              <p key={i} style={{ fontFamily: mincho, fontWeight: 400, fontSize: 14, lineHeight: "30px", letterSpacing: "1.5px", color: "#fff", margin: 0 }}>{line}</p>
            ))}
          </div>
        )}

        {/* 写真スライダー（260×260・アローで切替・右端ブリード） */}
        <div style={{ paddingTop: 44 }}>
          <PhotoSliderSP photos={store.photos} name={store.name} />
        </div>

        {/* ボタン（友だち追加 / メニュー / テイクアウト / ご予約・2行に折返し） */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "19px 24px", paddingTop: 44 }}>
          {store.lineName && store.lineUrl && <LineButtonSP name={store.lineName} href={store.lineUrl} />}
          <GoldButtonSP label="メニュー" href={SECTION_LINKS.menu} width={126} />
          <GoldButtonSP label="テイクアウト" href={SECTION_LINKS.takeout} width={162} />
          <GoldButtonSP label="ご予約" onClick={onOpenModal} width={118} />
        </div>

        {/* 詳細テーブル */}
        <div style={{ display: "flex", flexDirection: "column", gap: 28, paddingTop: 56 }}>
          <InfoRow label="住所">
            <p style={valueStyle}>{store.address}</p>
          </InfoRow>
          <InfoRow label="電話番号">
            <a href={`tel:${store.phone.replace(/[^0-9+]/g, "")}`} style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
              <PhoneIcon />
              <span style={{ fontFamily: sans, fontWeight: 500, fontSize: 18, letterSpacing: "0.5px", color: "#d9b86b", lineHeight: "22px" }}>{store.phone}</span>
            </a>
          </InfoRow>
          <InfoRow label="アクセス">
            <p style={valueStyle}>{store.access}</p>
          </InfoRow>
          <InfoRow label="営業時間">
            {store.hours.map((line, i) => (
              <p key={i} style={valueStyle}>{line}</p>
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

        {/* 地図（350×300・Google Maps 埋め込み） */}
        <div style={{ paddingTop: 36 }}>
          <div style={{ width: 350, height: 300, overflow: "hidden", background: "#1c110a" }}>
            <iframe
              title={`${store.name} 地図`}
              src={mapSrc}
              width={350}
              height={300}
              style={{ border: 0, display: "block" }}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
