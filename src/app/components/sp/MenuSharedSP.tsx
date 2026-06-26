"use client";

import Image from "next/image";
import type { CSSProperties } from "react";
import type { MenuItem } from "@/app/lib/menuData";
import { MENU_STORES } from "@/app/lib/menuData";
import type { StoreTab } from "../MenuShared";

// メニュー各ページ SP 共通のトークン・部品（Figma「メニュー_sp」node 2147:2 / 設計幅 390）。
// PC 版 MenuShared と同じデータ層を使い、見た目（レイアウト）のみ SP 向けに作り直したもの。

export const mincho = "'Shippori Mincho', serif";
export const sans = "'Noto Sans JP', sans-serif";
export const display = "'Cormorant Garamond', serif";
export const PANEL = "#171717";
export const GOLD = "#d9b86b";

function tabsOf(stores?: readonly StoreTab[]): readonly StoreTab[] {
  return stores && stores.length > 0 ? stores : MENU_STORES;
}

/* ─────────── ヘッダースペーサー(153) + ヒーロー + 「お品書き / Menu」見出し ─────────── */
// ※ ヘッダースペーサーは ResizeObserver の実測対象外にするため、各セクション側で別途置く。
// このコンポーネントはヒーロー以降（実測対象）の先頭ブロックを描画する。
export function MenuHeadingSP() {
  return (
    <>
      {/* ヒーロー画像ストリップ（351×130・左21pxインセット） */}
      <div style={{ paddingLeft: 19 }}>
        <div style={{ position: "relative", width: 351, height: 130, overflow: "hidden", background: "#472914" }}>
          <Image src="/images/hero_meat.webp" alt="焼肉平壌亭 お品書き" fill className="object-cover" sizes="351px" preload />
        </div>
      </div>

      {/* Menu 見出し（縦書きラベル「お品書き」+ Menu・/news・/store SP と統一） */}
      <div style={{ display: "flex", alignItems: "flex-start", paddingLeft: 19, paddingTop: 73, gap: 28 }}>
        <div style={{ boxSizing: "border-box", width: 44, height: 94, padding: "8px 7px", border: "1px solid rgba(255,255,255,0.3)", overflow: "hidden", flexShrink: 0, display: "flex", justifyContent: "center", alignItems: "center" }}>
          <span style={{ margin: 0, writingMode: "vertical-rl" as const, whiteSpace: "nowrap", fontFamily: mincho, fontSize: 12, letterSpacing: "7px", lineHeight: "1", color: "#fff", transform: "translateY(4px)" }}>
            お品書き
          </span>
        </div>
        <p style={{ paddingTop: 36, fontFamily: display, fontSize: 56, letterSpacing: "-1px", color: "#ebe5db", lineHeight: "normal", margin: 0 }}>Menu</p>
      </div>
    </>
  );
}

/* ─────────── 受取店舗タブ（SP・横スクロール・アクティブは金下線） ─────────── */
export function StoreTabsSP({ stores, activeId, onSelect }: { stores?: readonly StoreTab[]; activeId: string; onSelect: (id: string) => void }) {
  const list = tabsOf(stores);
  return (
    <div style={{ paddingLeft: 20, paddingRight: 20, paddingTop: 60, overflowX: "auto" }}>
      <div style={{ display: "inline-flex", gap: 30, borderBottom: "1px solid rgba(234,229,219,0.15)", minWidth: 350 }}>
        {list.map((s) => {
          const active = s.id === activeId;
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => onSelect(s.id)}
              style={{
                background: "transparent",
                border: "none",
                borderBottom: active ? `2px solid ${GOLD}` : "2px solid transparent",
                marginBottom: -1,
                padding: 0,
                paddingBottom: 14,
                cursor: "pointer",
                fontFamily: mincho,
                fontSize: 16,
                letterSpacing: "0.06em",
                color: active ? "#ebe5db" : "#99948c",
                whiteSpace: "nowrap",
                transition: "color 0.3s ease",
              }}
            >
              {s.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ─────────── 見出しボックス（350×52・#171717・▼）。
   options を渡すと店舗ネイティブ select（カテゴリ切替）、無ければ静的見出し。 ─────────── */
export function MenuSelectBoxSP({
  title,
  options,
  value,
  onChange,
}: {
  title: string;
  options?: { value: string; label: string }[];
  value?: string;
  onChange?: (value: string) => void;
}) {
  const box: CSSProperties = {
    position: "relative",
    width: 350,
    height: 52,
    background: PANEL,
    display: "flex",
    alignItems: "center",
    paddingLeft: 22,
    paddingRight: 20,
  };
  const label = options ? (options.find((o) => o.value === value)?.label ?? title) : title;
  return (
    <div style={{ paddingLeft: 20, paddingRight: 20, paddingTop: 89 }}>
      <div style={box}>
        <span style={{ flex: 1, fontFamily: mincho, fontSize: 16, letterSpacing: "0.08em", color: "#ebe5db" }}>{label}</span>
        <span style={{ fontSize: 12, color: "#ebe5db", lineHeight: 1 }}>▼</span>
        {options && onChange && (
          // 視覚ボックスの上に透明なネイティブ select を重ね、モバイル標準のピッカーで選ばせる。
          <select
            aria-label={title}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0, cursor: "pointer", border: "none", appearance: "none" }}
          >
            {options.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        )}
      </div>
    </div>
  );
}

/* ─────────── メニュー項目カード（SP・350×150・写真150 + 名称/説明/価格） ─────────── */
export function ItemCardSP({ item, imageWidth = 150, imageHeight = 150, nameClamp = 0 }: { item: MenuItem; imageWidth?: number; imageHeight?: number; nameClamp?: number }) {
  // nameClamp 指定時は最大 n 行で折返し（超過は…）。長い商品名でも価格と重ならない。
  const clampStyle = nameClamp ? ({ display: "-webkit-box", WebkitBoxOrient: "vertical" as const, WebkitLineClamp: nameClamp, overflow: "hidden" } as const) : {};
  return (
    <div style={{ display: "flex", width: 350, minHeight: imageHeight, background: PANEL }}>
      <div style={{ position: "relative", width: imageWidth, height: imageHeight, overflow: "hidden", background: "#22140c", flexShrink: 0 }}>
        <Image src={item.photo} alt={item.name} fill className="object-cover" sizes={`${imageWidth}px`} />
      </div>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", paddingLeft: 19, paddingRight: 12, paddingTop: 14, paddingBottom: 14 }}>
        <span style={{ fontFamily: mincho, fontSize: 18, fontWeight: 600, letterSpacing: "1px", color: "#fff", lineHeight: 1.3, ...clampStyle }}>{item.name}</span>
        <div style={{ flex: 1 }} />
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "flex-end", gap: 4 }}>
          <span style={{ fontFamily: mincho, fontSize: 20, fontWeight: 600, letterSpacing: "1px", color: "#ebe5db" }}>{item.price.toLocaleString()}</span>
          <span style={{ fontFamily: mincho, fontSize: 12, fontWeight: 600, letterSpacing: "1px", color: "#ebe5db" }}>円</span>
        </div>
      </div>
    </div>
  );
}
