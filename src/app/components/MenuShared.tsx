"use client";

import { useSyncExternalStore } from "react";
import Image from "next/image";
import PageHeader from "./PageHeader";
import OutlineButton from "./OutlineButton";
import { MENU_STORES, type MenuItem } from "@/app/lib/menuData";

// 受取店舗タブ1件分（id=slug）。DB 連動時は stores テーブル由来、未指定時は静的 MENU_STORES。
export type StoreTab = { id: string; name: string };

function tabsOf(stores?: readonly StoreTab[]): readonly StoreTab[] {
  return stores && stores.length > 0 ? stores : MENU_STORES;
}

// ?store= の変更を購読するための内部イベント（history.replaceState は popstate を発火しないため）
const STORE_PARAM_EVENT = "store-param-change";

function readStoreParam(list: readonly StoreTab[], defaultStore: string): string {
  const p = new URLSearchParams(window.location.search).get("store");
  return p && list.some((s) => s.id === p) ? p : defaultStore;
}

/**
 * 選択中の受取店舗を URL クエリ（?store=）で保持するフック。
 * メニューは店舗ごとに変わる想定のため、ページ遷移しても選択を維持できるよう URL を真実の値とする。
 * 既定店舗（先頭店舗）のときはクエリを付けない。stores は DB 連動の店舗一覧（省略時は静的）。
 * URL を唯一の真実とし useSyncExternalStore で購読する（ハイドレーション安全・effect で setState しない）。
 */
export function useStoreParam(stores?: readonly StoreTab[]): [string, (id: string) => void] {
  const list = tabsOf(stores);
  const defaultStore = list[0]?.id ?? "";

  const storeId = useSyncExternalStore(
    (onChange) => {
      window.addEventListener("popstate", onChange);
      window.addEventListener(STORE_PARAM_EVENT, onChange);
      return () => {
        window.removeEventListener("popstate", onChange);
        window.removeEventListener(STORE_PARAM_EVENT, onChange);
      };
    },
    () => readStoreParam(list, defaultStore), // クライアント: URL から読む
    () => defaultStore // サーバー/初回ハイドレーション: 既定店舗
  );

  const update = (id: string) => {
    const url = new URL(window.location.href);
    if (id === defaultStore) url.searchParams.delete("store");
    else url.searchParams.set("store", id);
    window.history.replaceState({}, "", url);
    window.dispatchEvent(new Event(STORE_PARAM_EVENT));
  };

  return [storeId, update];
}

/** リンク先に現在の店舗クエリを引き継ぐ（既定店舗のときは付けない）。 */
export function withStore(href: string, storeId: string, defaultStore: string = MENU_STORES[0].id): string {
  return storeId === defaultStore ? href : `${href}?store=${storeId}`;
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
          <div style={{ boxSizing: "border-box", width: 44, height: 94, padding: "8px 7px", border: "1px solid rgba(255,255,255,0.3)", overflow: "hidden", display: "flex", justifyContent: "center", alignItems: "center", flexShrink: 0 }}>
            <span style={{ margin: 0, writingMode: "vertical-rl" as const, fontFamily: mincho, fontSize: 12, letterSpacing: "7px", lineHeight: "1", color: "#fff", whiteSpace: "nowrap", transform: "translateY(4px)" }}>
              お品書き
            </span>
          </div>
          <p style={{ fontFamily: display, fontSize: 80, letterSpacing: "-1px", color: "#ebe5db", lineHeight: "normal", margin: 0 }}>Menu</p>
        </div>
        {/* ヒーロー画像（820×320） */}
        <div style={{ position: "relative", width: 820, height: 320, overflow: "hidden", flexShrink: 0, background: "#472914" }}>
          <Image src="/images/hero_meat.webp" alt="焼肉平壌亭 お品書き" fill className="object-cover" sizes="820px" preload />
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
export function ItemCard({ item, priceAlign = "right", imageWidth = 200, height = 200, nameSize = 24, nameClamp = 0 }: { item: MenuItem; priceAlign?: "left" | "right"; imageWidth?: number; height?: number; nameSize?: number; nameClamp?: number }) {
  // nameClamp 指定時は最大 n 行で折返し（超過は…）。長い商品名でも価格と重ならない。
  const clampStyle = nameClamp ? ({ display: "-webkit-box", WebkitBoxOrient: "vertical" as const, WebkitLineClamp: nameClamp, overflow: "hidden" } as const) : {};
  // 写真が無い品目（例: 追加メニュー）は画像枠を出さず、品名＋価格のみのスリム表示にする。
  const hasPhoto = !!item.photo;
  return (
    <div style={{ display: "flex", width: 420, height, background: PANEL }}>
      {hasPhoto && (
        <div style={{ position: "relative", width: imageWidth, height, overflow: "hidden", background: "#22140c", flexShrink: 0 }}>
          <Image src={item.photo} alt={item.name} fill className="object-cover" sizes={`${imageWidth}px`} />
        </div>
      )}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", paddingLeft: 28, paddingRight: 30, paddingTop: 22, paddingBottom: 24 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <span style={{ fontFamily: mincho, fontSize: nameSize, fontWeight: 600, letterSpacing: "2px", color: "#fff", lineHeight: 1.3, ...clampStyle }}>{item.name}</span>
          {item.desc && (
            <span style={{ fontFamily: sans, fontSize: 12, letterSpacing: "0.02em", color: "#99948c", lineHeight: 1.6, display: "-webkit-box", WebkitBoxOrient: "vertical", WebkitLineClamp: 3, overflow: "hidden" }}>{item.desc}</span>
          )}
        </div>
        <div style={{ flex: 1 }} />
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: priceAlign === "right" ? "flex-end" : "flex-start", gap: 6 }}>
          <span style={{ fontFamily: mincho, fontSize: 20, fontWeight: 600, letterSpacing: "2px", color: "#ebe5db" }}>{item.price.toLocaleString()}</span>
          <span style={{ fontFamily: mincho, fontSize: 12, fontWeight: 600, letterSpacing: "2px", color: "#ebe5db" }}>円</span>
        </div>
      </div>
    </div>
  );
}

/* ─────────── 受取店舗タブ（下線1340を店舗数で等分 / 金ハイライト） ─────────── */
export function StoreTabs({ stores, activeId, onSelect }: { stores?: readonly StoreTab[]; activeId: string; onSelect: (id: string) => void }) {
  // 選択中の店舗（URL クエリ由来）。メニューは店舗ごとに変わる想定。
  const list = tabsOf(stores);
  const active = Math.max(0, list.findIndex((s) => s.id === activeId));
  const tabW = 1340 / list.length; // 店舗数で等分（5店舗なら従来どおり268）
  return (
    <div style={{ paddingLeft: 50, paddingRight: 50, paddingTop: 178 }}>
      <div style={{ position: "relative", width: 1340 }}>
        <div style={{ display: "flex" }}>
          {list.map((s, i) => (
            <button
              key={s.id}
              type="button"
              onClick={() => onSelect(s.id)}
              style={{
                width: tabW,
                height: 80,
                background: "transparent",
                border: "none",
                cursor: "pointer",
                fontFamily: mincho,
                fontSize: 20,
                letterSpacing: "0.08em",
                color: i === active ? "#ebe5db" : "#99948c",
                transition: "color 0.3s ease",
                whiteSpace: "nowrap",
              }}
            >
              {s.name}
            </button>
          ))}
        </div>
        {/* 下線（全幅）+ 金ハイライト（アクティブタブ下） */}
        <div style={{ position: "relative", width: 1340, height: 2, background: "rgba(234,229,219,0.15)" }}>
          <div style={{ position: "absolute", top: 0, left: active * tabW, width: tabW, height: 2, background: GOLD, transition: "left 0.3s ease" }} />
        </div>
      </div>
    </div>
  );
}
