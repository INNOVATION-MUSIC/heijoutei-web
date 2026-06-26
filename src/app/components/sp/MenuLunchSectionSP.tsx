"use client";

import { useEffect, useRef } from "react";
import { type MenuItem } from "@/app/lib/menuData";
import { type StoreTab } from "../MenuShared";
import { MenuHeadingSP, StoreTabsSP, MenuSelectBoxSP, ItemCardSP, sans } from "./MenuSharedSP";

type Props = {
  items: MenuItem[];
  storeId: string;
  stores?: StoreTab[];
  onSelectStore: (id: string) => void;
  height: number;
  onMeasured?: (h: number) => void;
};

/**
 * /menu/lunch ランチメニュー SP 版。Figma node 2147:1217（設計幅 390）。
 * 縦並び: ヒーロー → Menu 見出し → 店舗タブ → 見出しボックス「ランチメニュー」→ 税込注記 → 項目カード1列。
 * カテゴリ切替は無いため見出しボックスは静的（▼ は意匠）。品目説明の折返しで高さ可変。
 */
export default function MenuLunchSectionSP({ items, storeId, stores, onSelectStore, height, onMeasured }: Props) {
  const contentRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = contentRef.current;
    if (!el || !onMeasured) return;
    const report = () => onMeasured(el.offsetHeight);
    report();
    const ro = new ResizeObserver(report);
    ro.observe(el);
    return () => ro.disconnect();
  }, [onMeasured, items, storeId]);

  return (
    <div style={{ display: "flex", flexDirection: "column", width: 390, height, background: "#0a0a0a", overflow: "hidden" }}>
      <div style={{ height: 153, flexShrink: 0 }} />

      <div ref={contentRef} style={{ display: "flex", flexDirection: "column" }}>
        <MenuHeadingSP />
        <StoreTabsSP stores={stores} activeId={storeId} onSelect={onSelectStore} />

        <MenuSelectBoxSP title="ランチメニュー" />

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
