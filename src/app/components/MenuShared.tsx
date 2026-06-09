"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import PageHeader from "./PageHeader";
import OutlineButton from "./OutlineButton";
import { MENU_STORES, type MenuItem } from "@/app/lib/menuData";

const DEFAULT_STORE = MENU_STORES[0].id;

/**
 * 選択中の受取店舗を URL クエリ（?store=）で保持するフック。
 * メニューは店舗ごとに変わる想定のため、ページ遷移しても選択を維持できるよう URL を真実の値とする。
 * 既定店舗（亀岡）のときはクエリを付けない。
 */
export function useStoreParam(): [string, (id: string) => void] {
  const [storeId, setStoreId] = useState<string>(DEFAULT_STORE);

  useEffect(() => {
    const p = new URLSearchParams(window.location.search).get("store");
    if (p && MENU_STORES.some((s) => s.id === p)) setStoreId(p);
  }, []);

  const update = (id: string) => {
    setStoreId(id);
    const url = new URL(window.location.href);
    if (id === DEFAULT_STORE) url.searchParams.delete("store");
    else url.searchParams.set("store", id);
    window.history.replaceState({}, "", url);
  };

  return [storeId, update];
}

/** リンク先に現在の店舗クエリを引き継ぐ（既定店舗のときは付けない）。 */
export function withStore(href: string, storeId: string): string {
  return storeId === DEFAULT_STORE ? href : `${href}?store=${storeId}`;
}

export const mincho = "'Shippori Mincho', serif";
export const sans = "'Noto Sans JP', sans-serif";
export const display = "'Cormorant Garamond', serif";

export const PANEL = "#171717";
export const GOLD = "#d9b86b";

/* ─────────── ヘッダー + Menu 見出し（カテゴリ/詳細 共通・Hero 上端 y=297） ─────────── */
export function MenuHeading({ onOpenModal }: { onOpenModal: () => void }) {
  return (
    <>
      <PageHeader onOpenModal={onOpenModal} />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", paddingLeft: 57, paddingRight: 40, paddingTop: 144 }}>
        <div style={{ display: "flex", gap: 49, alignItems: "flex-start", paddingTop: 48 }}>
          {/* 縦書きラベル「お品書き」 */}
          <div style={{ width: 44, height: 85, border: "1px solid rgba(255,255,255,0.3)", display: "flex", justifyContent: "center", alignItems: "center", flexShrink: 0 }}>
            <span style={{ writingMode: "vertical-rl" as const, fontFamily: mincho, fontSize: 12, letterSpacing: "7px", color: "#fff", lineHeight: 1 }}>
              お品書き
            </span>
          </div>
          <p style={{ fontFamily: display, fontSize: 80, letterSpacing: "-1px", color: "#ebe5db", lineHeight: "normal", margin: 0 }}>Menu</p>
        </div>
        {/* ヒーロー画像（820×320） */}
        <div style={{ position: "relative", width: 820, height: 320, overflow: "hidden", flexShrink: 0, background: "#472914" }}>
          <Image src="/images/hero_meat.webp" alt="焼肉平壌亭 お品書き" fill className="object-cover" sizes="820px" priority />
        </div>
      </div>
    </>
  );
}

/* ─────────── 「一覧へ戻る」共通ボタン（→ /menu・各ページ最下部） ─────────── */
export function BackToMenuButton() {
  return (
    <div style={{ display: "flex", justifyContent: "center", paddingTop: 48, paddingBottom: 80 }}>
      <OutlineButton jp="一覧へ戻る" href="/menu" align="center" width={200} />
    </div>
  );
}

/* ─────────── メニュー項目カード（420×200・写真 + 名称/説明/価格） ─────────── */
export function ItemCard({ item, priceAlign = "right" }: { item: MenuItem; priceAlign?: "left" | "right" }) {
  return (
    <div style={{ display: "flex", width: 420, height: 200, background: PANEL }}>
      <div style={{ position: "relative", width: 200, height: 200, overflow: "hidden", background: "#22140c", flexShrink: 0 }}>
        <Image src={item.photo} alt={item.name} fill className="object-cover" sizes="200px" />
      </div>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", paddingLeft: 28, paddingRight: 30, paddingTop: 22, paddingBottom: 24 }}>
        <span style={{ fontFamily: mincho, fontSize: 24, fontWeight: 600, letterSpacing: "2px", color: "#fff", lineHeight: 1.3 }}>{item.name}</span>
        {item.desc && (
          <p style={{ fontFamily: mincho, fontSize: 12, letterSpacing: "2px", color: "#ebe5db", lineHeight: "20px", marginTop: 9 }}>{item.desc}</p>
        )}
        <div style={{ flex: 1 }} />
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: priceAlign === "right" ? "flex-end" : "flex-start", gap: 6 }}>
          <span style={{ fontFamily: mincho, fontSize: 20, fontWeight: 600, letterSpacing: "2px", color: "#ebe5db" }}>{item.price.toLocaleString()}</span>
          <span style={{ fontFamily: mincho, fontSize: 12, fontWeight: 600, letterSpacing: "2px", color: "#ebe5db" }}>円</span>
        </div>
      </div>
    </div>
  );
}

/* ─────────── 受取店舗タブ（5店舗・幅268×80・下線1340 / 金ハイライト268） ─────────── */
export function StoreTabs({ activeId, onSelect }: { activeId: string; onSelect: (id: string) => void }) {
  // 選択中の店舗（URL クエリ由来）。メニューは店舗ごとに変わる想定。
  const active = Math.max(0, MENU_STORES.findIndex((s) => s.id === activeId));
  return (
    <div style={{ paddingLeft: 50, paddingRight: 50, paddingTop: 178 }}>
      <div style={{ position: "relative", width: 1340 }}>
        <div style={{ display: "flex" }}>
          {MENU_STORES.map((s, i) => (
            <button
              key={s.id}
              type="button"
              onClick={() => onSelect(s.id)}
              style={{
                width: 268,
                height: 80,
                background: "transparent",
                border: "none",
                cursor: "pointer",
                fontFamily: mincho,
                fontSize: 20,
                letterSpacing: "0.08em",
                color: i === active ? "#ebe5db" : "#99948c",
                transition: "color 0.3s ease",
              }}
            >
              {s.name}
            </button>
          ))}
        </div>
        {/* 下線（全幅）+ 金ハイライト（アクティブタブ下） */}
        <div style={{ position: "relative", width: 1340, height: 2, background: "rgba(234,229,219,0.15)" }}>
          <div style={{ position: "absolute", top: 0, left: active * 268, width: 268, height: 2, background: GOLD, transition: "left 0.3s ease" }} />
        </div>
      </div>
    </div>
  );
}
