"use client";

import { useEffect, useRef } from "react";
import { MenuHeading, StoreTabs, ItemCard, BackToMenuButton, mincho, sans, GOLD, type StoreTab } from "./MenuShared";
import { type MenuItem } from "@/app/lib/menuData";

/* ─────────── ランチカテゴリのサブタブ（中央寄せ・金下線ハイライト） ─────────── */
function LunchCategoryTabs({ tabs, active, onSelect }: { tabs: string[]; active: number; onSelect: (i: number) => void }) {
  return (
    <div style={{ display: "flex", justifyContent: "center", gap: 8, paddingTop: 28, paddingLeft: 50, paddingRight: 50, flexWrap: "wrap" }}>
      {tabs.map((t, i) => (
        <button
          key={t}
          type="button"
          onClick={() => onSelect(i)}
          style={{
            padding: "8px 22px 12px",
            background: "transparent",
            border: "none",
            borderBottom: `2px solid ${i === active ? GOLD : "rgba(234,229,219,0.15)"}`,
            cursor: "pointer",
            fontFamily: mincho,
            fontSize: 18,
            letterSpacing: "0.08em",
            color: i === active ? "#ebe5db" : "#99948c",
            transition: "color 0.3s ease, border-color 0.3s ease",
            whiteSpace: "nowrap",
          }}
        >
          {t}
        </button>
      ))}
    </div>
  );
}

/**
 * /menu/lunch ランチメニュー（PC のみ・Figma 2109:25）。
 * 見出し + 店舗タブ +（ランチカテゴリのサブタブ）+ 税込注記 + 項目グリッド。
 * 店舗タブの切替で内容（items）が変わる（店舗別メニュー）。
 * カテゴリ数・品目数で高さが変わるため、コンテンツを ResizeObserver で実測する。
 */
export default function MenuLunchSection({
  items,
  storeId,
  stores,
  onSelectStore,
  categoryTabs,
  activeCategory = 0,
  onSelectCategory,
  onOpenModal,
  height,
  onMeasured,
}: {
  items: MenuItem[];
  storeId: string;
  stores?: StoreTab[];
  onSelectStore: (id: string) => void;
  categoryTabs?: string[];
  activeCategory?: number;
  onSelectCategory?: (i: number) => void;
  onOpenModal: () => void;
  height: number;
  onMeasured?: (h: number) => void;
}) {
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
    <section style={{ display: "flex", flexDirection: "column", width: 1440, minHeight: height, background: "#0a0a0a" }}>
      <div ref={contentRef} style={{ display: "flex", flexDirection: "column" }}>
        <MenuHeading onOpenModal={onOpenModal} />
        <StoreTabs stores={stores} activeId={storeId} onSelect={onSelectStore} />

        {/* 見出し（中央） */}
        <div style={{ display: "flex", justifyContent: "center", paddingTop: 64 }}>
          <h1 style={{ fontFamily: mincho, fontSize: 28, fontWeight: 600, letterSpacing: "0.1em", color: "#ebe5db", margin: 0 }}>ランチメニュー</h1>
        </div>

        {/* ランチカテゴリのサブタブ（2カテゴリ以上のとき） */}
        {categoryTabs && onSelectCategory && (
          <LunchCategoryTabs tabs={categoryTabs} active={activeCategory} onSelect={onSelectCategory} />
        )}

        {/* 税込注記 */}
        <p style={{ fontFamily: sans, fontSize: 13, letterSpacing: "0.04em", color: "#99948c", paddingLeft: 50, paddingTop: 27, margin: 0 }}>※ 価格はすべて税込表示です</p>

        {/* 項目グリッド（3列・gap40）。非公開店は items が空 */}
        {items.length === 0 ? (
          <p style={{ fontFamily: mincho, fontSize: 18, letterSpacing: "0.08em", color: "#99948c", textAlign: "center", paddingTop: 80, paddingBottom: 80, margin: 0 }}>
            現在この店舗のランチメニューはございません。
          </p>
        ) : (
          <div style={{ display: "flex", flexWrap: "wrap", columnGap: 40, rowGap: 40, paddingLeft: 50, paddingRight: 50, paddingTop: 18 }}>
            {items.map((it, i) => (
              <ItemCard key={`${it.name}-${i}`} item={it} imageWidth={196} height={140} nameSize={22} nameClamp={2} />
            ))}
          </div>
        )}

        <div style={{ paddingTop: 120 }} />
        <BackToMenuButton />
      </div>
    </section>
  );
}
