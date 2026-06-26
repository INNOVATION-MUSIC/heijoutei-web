"use client";

import { useEffect, useRef } from "react";
import { type MenuItem } from "@/app/lib/menuData";
import { type StoreTab } from "../MenuShared";
import { MenuHeadingSP, StoreTabsSP, MenuSelectBoxSP, ItemCardSP, sans, mincho, GOLD } from "./MenuSharedSP";

/* ─────────── ランチカテゴリのサブタブ（SP・横スクロール・金下線） ─────────── */
function LunchCategoryTabsSP({ tabs, active, onSelect }: { tabs: string[]; active: number; onSelect: (i: number) => void }) {
  return (
    <div style={{ display: "flex", gap: 18, paddingLeft: 20, paddingRight: 20, paddingTop: 20, overflowX: "auto" }}>
      {tabs.map((t, i) => (
        <button
          key={t}
          type="button"
          onClick={() => onSelect(i)}
          style={{
            padding: "6px 4px 10px",
            background: "transparent",
            border: "none",
            borderBottom: `2px solid ${i === active ? GOLD : "rgba(234,229,219,0.15)"}`,
            cursor: "pointer",
            fontFamily: mincho,
            fontSize: 15,
            letterSpacing: "0.06em",
            color: i === active ? "#ebe5db" : "#99948c",
            whiteSpace: "nowrap",
            flexShrink: 0,
          }}
        >
          {t}
        </button>
      ))}
    </div>
  );
}

type Props = {
  items: MenuItem[];
  storeId: string;
  stores?: StoreTab[];
  onSelectStore: (id: string) => void;
  categoryTabs?: string[];
  activeCategory?: number;
  onSelectCategory?: (i: number) => void;
  height: number;
  onMeasured?: (h: number) => void;
};

/**
 * /menu/lunch ランチメニュー SP 版。Figma node 2147:1217（設計幅 390）。
 * 縦並び: ヒーロー → Menu 見出し → 店舗タブ → 見出しボックス →（ランチカテゴリのサブタブ）→ 税込注記 → 項目カード1列。
 * カテゴリ数・品目説明の折返しで高さ可変のため、コンテンツ全体を ResizeObserver で実測する。
 */
export default function MenuLunchSectionSP({
  items,
  storeId,
  stores,
  onSelectStore,
  categoryTabs,
  activeCategory = 0,
  onSelectCategory,
  height,
  onMeasured,
}: Props) {
  const contentRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = contentRef.current;
    if (!el || !onMeasured) return;
    const report = () => onMeasured(el.offsetHeight);
    report();
    const ro = new ResizeObserver(report);
    ro.observe(el);
    return () => ro.disconnect();
  }, [onMeasured, items, storeId, activeCategory]);

  return (
    <div style={{ display: "flex", flexDirection: "column", width: 390, height, background: "#0a0a0a", overflow: "hidden" }}>
      <div style={{ height: 153, flexShrink: 0 }} />

      <div ref={contentRef} style={{ display: "flex", flexDirection: "column" }}>
        <MenuHeadingSP />
        <StoreTabsSP stores={stores} activeId={storeId} onSelect={onSelectStore} />

        <MenuSelectBoxSP title="ランチメニュー" />

        {/* ランチカテゴリのサブタブ（2カテゴリ以上のとき） */}
        {categoryTabs && onSelectCategory && (
          <LunchCategoryTabsSP tabs={categoryTabs} active={activeCategory} onSelect={onSelectCategory} />
        )}

        <p style={{ fontFamily: sans, fontSize: 12, letterSpacing: "0.04em", color: "#99948c", paddingLeft: 20, paddingTop: 20, margin: 0 }}>※ 価格はすべて税込表示です</p>

        {items.length === 0 ? (
          <p style={{ fontFamily: sans, fontSize: 14, letterSpacing: "0.06em", color: "#99948c", textAlign: "center", paddingTop: 60, paddingBottom: 80, margin: 0 }}>
            現在この店舗のランチメニューはございません。
          </p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 20, paddingLeft: 20, paddingRight: 20, paddingTop: 20, paddingBottom: 80 }}>
            {items.map((it, i) => (
              <ItemCardSP key={`${it.name}-${i}`} item={it} imageWidth={146} imageHeight={110} nameClamp={2} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
