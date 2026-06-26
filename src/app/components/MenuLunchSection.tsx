"use client";

import { MenuHeading, StoreTabs, ItemCard, BackToMenuButton, mincho, sans, type StoreTab } from "./MenuShared";
import { type MenuItem } from "@/app/lib/menuData";

/**
 * /menu/lunch ランチメニュー（PC のみ・Figma 2109:25）。
 * カテゴリ切替タブは無く、見出し + 店舗タブ + 税込注記 + 項目グリッドのみ。
 * 店舗タブの切替で内容（items）が変わる（店舗別メニュー）。
 */
export default function MenuLunchSection({
  items,
  storeId,
  stores,
  onSelectStore,
  onOpenModal,
  height,
}: {
  items: MenuItem[];
  storeId: string;
  stores?: StoreTab[];
  onSelectStore: (id: string) => void;
  onOpenModal: () => void;
  height: number;
}) {
  return (
    <section style={{ display: "flex", flexDirection: "column", width: 1440, height, background: "#0a0a0a" }}>
      <MenuHeading onOpenModal={onOpenModal} />
      <StoreTabs stores={stores} activeId={storeId} onSelect={onSelectStore} />

      {/* 見出し（中央） */}
      <div style={{ display: "flex", justifyContent: "center", paddingTop: 64 }}>
        <h1 style={{ fontFamily: mincho, fontSize: 28, fontWeight: 600, letterSpacing: "0.1em", color: "#ebe5db", margin: 0 }}>ランチメニュー</h1>
      </div>

      {/* 税込注記 */}
      <p style={{ fontFamily: sans, fontSize: 13, letterSpacing: "0.04em", color: "#99948c", paddingLeft: 50, paddingTop: 27, margin: 0 }}>※ 価格はすべて税込表示です</p>

      {/* 項目グリッド（3列・gap40）。非公開店は items が空 */}
      {items.length === 0 ? (
        <p style={{ fontFamily: mincho, fontSize: 18, letterSpacing: "0.08em", color: "#99948c", textAlign: "center", paddingTop: 80, margin: 0 }}>
          現在この店舗のランチメニューはございません。
        </p>
      ) : (
        <div style={{ display: "flex", flexWrap: "wrap", columnGap: 40, rowGap: 40, paddingLeft: 50, paddingRight: 50, paddingTop: 18 }}>
          {items.map((it, i) => (
            <ItemCard key={`${it.name}-${i}`} item={it} imageWidth={196} height={140} nameSize={22} nameClamp={2} />
          ))}
        </div>
      )}

      <div style={{ flex: 1 }} />
      <BackToMenuButton />
    </section>
  );
}
