"use client";

import { useEffect, useRef } from "react";
import { MENU_CATEGORIES, type MenuCategory, type MenuItem } from "@/app/lib/menuData";
import { type StoreTab } from "../MenuShared";
import { MenuHeadingSP, StoreTabsSP, MenuSelectBoxSP, ItemCardSP, mincho, sans, PANEL } from "./MenuSharedSP";

type Props = {
  category: MenuCategory;
  categories?: MenuCategory[];
  items: MenuItem[];
  storeId: string;
  stores?: StoreTab[];
  onSelectCategory: (slug: string) => void;
  onSelectStore: (id: string) => void;
  height: number;
  onMeasured?: (h: number) => void;
};

/**
 * /menu/[category] 詳細ページ SP 版メインコンテンツ。Figma node 2147:950（設計幅 390）。
 * 縦並び: ヒーロー → Menu 見出し → 店舗タブ → カテゴリ切替（▼ ネイティブ select）→ 税込注記 → 項目カード1列。
 * PC のカテゴリ切替タブ（2行）の代わりに SP ではドロップダウンでカテゴリを切り替える。
 * 品目説明の折返しで高さ可変のため、コンテンツ全体を ResizeObserver で実測する。
 */
export default function MenuDetailSectionSP({ category, categories, items, storeId, stores, onSelectCategory, onSelectStore, height, onMeasured }: Props) {
  const navCategories = categories && categories.length > 0 ? categories : MENU_CATEGORIES;

  const contentRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = contentRef.current;
    if (!el || !onMeasured) return;
    const report = () => onMeasured(el.offsetHeight);
    report();
    const ro = new ResizeObserver(report);
    ro.observe(el);
    return () => ro.disconnect();
  }, [onMeasured, items, category.slug, storeId]);

  return (
    <div style={{ display: "flex", flexDirection: "column", width: 390, height, background: "#0a0a0a", overflow: "hidden" }}>
      <div style={{ height: 153, flexShrink: 0 }} />

      <div ref={contentRef} style={{ display: "flex", flexDirection: "column" }}>
        <MenuHeadingSP />
        <StoreTabsSP stores={stores} activeId={storeId} onSelect={onSelectStore} />

        {/* カテゴリ切替（ドロップダウン） */}
        <MenuSelectBoxSP
          title={category.title}
          value={category.slug}
          options={navCategories.map((c) => ({ value: c.slug, label: c.title }))}
          onChange={onSelectCategory}
        />

        {/* 税込注記 */}
        <p style={{ fontFamily: sans, fontSize: 12, letterSpacing: "0.04em", color: "#99948c", paddingLeft: 20, paddingTop: 20, margin: 0 }}>※ 価格はすべて税込表示です</p>

        {/* 項目カード（1列・gap20）／選択店舗に登録が無ければ空状態 */}
        {items.length > 0 ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 20, paddingLeft: 20, paddingRight: 20, paddingTop: 20, paddingBottom: 80 }}>
            {items.map((it, i) => (
              <ItemCardSP key={`${it.name}-${i}`} item={it} />
            ))}
          </div>
        ) : (
          <div style={{ paddingLeft: 20, paddingRight: 20, paddingTop: 20, paddingBottom: 80 }}>
            <div style={{ width: 350, padding: "40px 24px", background: PANEL, display: "flex", flexDirection: "column", alignItems: "center", gap: 14, border: "1px solid rgba(234,229,219,0.08)" }}>
              <div style={{ width: 48, height: 1, background: "rgba(217,184,107,0.6)" }} />
              <p style={{ fontFamily: mincho, fontSize: 16, letterSpacing: "0.06em", color: "#ebe5db", margin: 0, textAlign: "center" }}>選択中の店舗ではお取り扱いがございません</p>
              <p style={{ fontFamily: sans, fontSize: 12, letterSpacing: "0.04em", color: "#99948c", margin: 0 }}>店舗を切り替えてご確認ください</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
