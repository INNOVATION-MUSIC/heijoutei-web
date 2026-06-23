"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import OutlineButton from "../OutlineButton";
import type { StoreCardData as Store } from "@/app/lib/storeListDb";

const mincho = "'Shippori Mincho', serif";
const display = "'Cormorant Garamond', serif";
const sans = "'Noto Sans JP', sans-serif";

const CARD_WIDTH = 350;

const detailText = {
  fontFamily: sans,
  fontWeight: 300,
  fontSize: 12,
  lineHeight: "22px",
  letterSpacing: "0.5px",
  color: "#fff",
  margin: 0,
} as const;

/** Google マップ検索へのリンクバッジ（50×20）。 */
function MapBadge({ address }: { address: string }) {
  const href = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: 50,
        height: 20,
        border: "1px solid rgba(221,168,63,0.6)",
        borderRadius: 25,
        fontFamily: sans,
        fontSize: 10,
        color: "#fff",
        textDecoration: "none",
        letterSpacing: "1px",
        flexShrink: 0,
      }}
    >
      MAP
    </a>
  );
}

/** ゴールドの電話アイコン（22×22）。 */
function PhoneIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#d9b86b" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }} aria-hidden>
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  );
}

/** 店舗カード（SP・350幅）。写真350×320 → 情報を縦並びで直接表示（店舗詳細ボタンは Figma に無し）。 */
function StoreCardSP({ store }: { store: Store }) {
  return (
    <div style={{ width: CARD_WIDTH, display: "flex", flexDirection: "column" }}>
      {/* 写真 / ロゴ（白背景）/ Coming Soon（350×320） */}
      {store.logo ? (
        <div style={{ width: CARD_WIDTH, height: 320, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <div style={{ width: 231, height: 231, position: "relative", flexShrink: 0 }}>
            <Image src={store.logo} alt={store.name} fill className="object-contain" sizes="231px" />
          </div>
        </div>
      ) : store.img ? (
        <div style={{ width: CARD_WIDTH, height: 320, position: "relative", overflow: "hidden", background: "#1c110a", flexShrink: 0 }}>
          <Image src={store.img} alt={store.name} fill className="object-cover" sizes="350px" />
        </div>
      ) : (
        <div style={{ width: CARD_WIDTH, height: 320, background: "#2b2b2b", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <p style={{ fontFamily: display, fontSize: 24, color: "rgba(255,255,255,0.5)", letterSpacing: "1px", margin: 0 }}>Coming Soon</p>
        </div>
      )}

      {/* 英字ラベル・金線・店名 */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12, paddingTop: 28 }}>
        <p style={{ fontFamily: sans, fontWeight: 300, fontSize: 10, letterSpacing: "3px", color: "rgba(217,184,107,0.6)", lineHeight: "normal", margin: 0 }}>{store.enLabel}</p>
        <div style={{ width: 32, height: 1, background: "rgba(217,184,107,0.45)" }} />
        <p style={{ fontFamily: mincho, fontWeight: 800, fontSize: 26, letterSpacing: "2px", color: "#fff", lineHeight: "normal", margin: 0 }}>{store.name}</p>
      </div>

      {/* 住所 + MAP */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: 8, paddingTop: 12 }}>
        <p style={{ ...detailText, flex: 1 }}>{store.address}</p>
        <MapBadge address={store.address} />
      </div>

      {/* 電話（アイコン + 番号・強調） */}
      <a href={`tel:${store.phone.replace(/[^0-9+]/g, "")}`} style={{ display: "flex", alignItems: "center", gap: 8, paddingTop: 14, textDecoration: "none" }}>
        <PhoneIcon />
        <span style={{ fontFamily: sans, fontWeight: 400, fontSize: 18, letterSpacing: "0.5px", color: "#fff", lineHeight: "normal" }}>{store.phone}</span>
      </a>

      {/* アクセス・営業時間・定休日 */}
      <div style={{ display: "flex", flexDirection: "column", gap: 6, paddingTop: 14 }}>
        <p style={detailText}>{store.access}</p>
        <div>
          {store.hours.map((line, i) => (
            <p key={i} style={{ ...detailText }}>{line}</p>
          ))}
        </div>
        <p style={detailText}>{store.closed}</p>
      </div>

      {/* 店舗詳細ボタン（全幅・/store/[slug] へ遷移） */}
      <div style={{ paddingTop: 22 }}>
        <OutlineButton jp="店舗詳細" href={`/store/${store.slug}`} width={CARD_WIDTH} height={48} align="center" />
      </div>
    </div>
  );
}

type Props = {
  /** DB 由来の店舗一覧（未指定時は呼び出し側で静的フォールバック済みの配列が渡る） */
  stores: Store[];
  height: number;
  /** ヘッダースペーサーを除いたコンテンツ実測高さ（design 390 幅でのpx）を親へ通知 */
  onMeasured?: (h: number) => void;
};

/**
 * /store 店舗一覧ページ SP 版メインコンテンツ。Figma 設計幅 390（node 2135:866）。
 * ヘッダーは SpStickyHeader が固定表示するため先頭に 153px spacer のみ置く。
 * 縦並び: ヒーロー(351×130) → StoreInfo 見出し → 店舗カード（写真350×320 + 情報）。
 * カードは住所/営業時間の折返しで高さ可変のため、コンテンツ全体を ResizeObserver で実測し
 * 全高（height）算出に使う。縦位置は paddingTop（gap）で制御し marginTop / 配置 absolute は不使用。
 */
export default function StoreListSectionSP({ stores, height, onMeasured }: Props) {
  // ヘッダースペーサーを除いたコンテンツ（ヒーロー〜カード〜末尾余白）を一括実測。
  // transform: scale() は offsetHeight に影響しない。
  const contentRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = contentRef.current;
    if (!el || !onMeasured) return;
    const report = () => onMeasured(el.offsetHeight);
    report();
    const ro = new ResizeObserver(report);
    ro.observe(el);
    return () => ro.disconnect();
  }, [onMeasured, stores]);

  return (
    <div style={{ display: "flex", flexDirection: "column", width: 390, height, background: "#0a0a0a", overflow: "hidden" }}>

      {/* ヘッダー高さ分のスペーサー（SpStickyHeader が上に固定表示） */}
      <div style={{ height: 153, flexShrink: 0 }} />

      <div ref={contentRef} style={{ display: "flex", flexDirection: "column" }}>
        {/* ヒーロー画像ストリップ（351×130・左右21pxインセット・黒オーバーレイ0.3） */}
        <div style={{ paddingLeft: 19 }}>
          <div style={{ position: "relative", width: 351, height: 130, overflow: "hidden", background: "#472914" }}>
            <Image src="/images/storelist_hero.webp" alt="焼肉平壌亭 店舗一覧" fill className="object-cover" sizes="351px" preload />
            <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.3)" }} />
          </div>
        </div>

        {/* StoreInfo 見出し（縦書きラベル「店舗」+ StoreInfo・トップ/News と統一） */}
        <div style={{ display: "flex", alignItems: "flex-start", paddingLeft: 19, paddingTop: 73, gap: 28 }}>
          <div style={{ boxSizing: "border-box", width: 44, height: 94, padding: "8px 7px", border: "1px solid rgba(255,255,255,0.3)", overflow: "hidden", flexShrink: 0, display: "flex", justifyContent: "center", alignItems: "center" }}>
            <span style={{ margin: 0, writingMode: "vertical-rl" as const, whiteSpace: "nowrap", fontFamily: mincho, fontSize: 12, letterSpacing: "7px", lineHeight: "1", color: "#fff", transform: "translateY(4px)" }}>
              店舗
            </span>
          </div>
          <p style={{ paddingTop: 40, fontFamily: display, fontSize: 48, letterSpacing: "-1px", color: "#ebe5db", lineHeight: "normal", margin: 0 }}>StoreInfo</p>
        </div>

        {/* 店舗カード群（1列・gap40・末尾に余白） */}
        <div style={{ display: "flex", flexDirection: "column", gap: 40, paddingLeft: 19, paddingRight: 19, paddingTop: 63, paddingBottom: 149 }}>
          {stores.map((store) => (
            <StoreCardSP key={store.slug} store={store} />
          ))}
        </div>
      </div>
    </div>
  );
}
