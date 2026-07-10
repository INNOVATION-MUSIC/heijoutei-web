"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { MENU_CATEGORIES, MENU_STORES, type MenuCategory, type MenuPromo } from "@/app/lib/menuData";
import { withStore, type StoreTab } from "../MenuShared";
import { PROMOS } from "../MenuCategorySection";
import { MenuHeadingSP, StoreTabsSP, mincho, sans, display, GOLD } from "./MenuSharedSP";

/* ─────────── カテゴリカード（SP・165幅・写真165×165 + 名称中央） ─────────── */
function CategoryCardSP({ category, storeId, defaultStore }: { category: MenuCategory; storeId: string; defaultStore: string }) {
  return (
    <a
      href={withStore(`/menu/${category.slug}`, storeId, defaultStore)}
      style={{ width: 165, display: "flex", flexDirection: "column", textDecoration: "none" }}
    >
      <div style={{ position: "relative", width: 165, height: 165, overflow: "hidden", background: "#22140c" }}>
        <Image src={category.cardPhoto} alt={category.name} fill className="object-cover" sizes="165px" />
      </div>
      <span style={{ fontFamily: mincho, fontSize: 16, fontWeight: 600, letterSpacing: "1px", color: "#fff", textAlign: "center", lineHeight: 1.4, paddingTop: 13 }}>
        {category.name}
      </span>
    </a>
  );
}

/* ─────────── プロモバナー（SP・350幅・写真350×320上 + テキスト） ─────────── */
function PromoBannerSP({ promo }: { promo: MenuPromo }) {
  return (
    <a href={promo.href} style={{ display: "flex", flexDirection: "column", width: 350, textDecoration: "none" }}>
      <div style={{ position: "relative", width: 350, height: 320, overflow: "hidden", background: "#22140c" }}>
        <Image src={promo.photo} alt={promo.title} fill className="object-cover" sizes="350px" />
      </div>
      <div style={{ display: "flex", flexDirection: "column", paddingTop: 30 }}>
        <span style={{ fontFamily: display, fontSize: 16, letterSpacing: "0.1em", color: GOLD }}>{promo.en}</span>
        <div style={{ width: 32, height: 1, background: GOLD, marginTop: 12 }} />
        <span style={{ fontFamily: mincho, fontSize: 22, letterSpacing: "0.06em", color: "#ebe5db", marginTop: 14 }}>{promo.title}</span>
        <p style={{ fontFamily: sans, fontSize: 13, lineHeight: "26px", letterSpacing: "0.04em", color: "#99948c", marginTop: 16, margin: 0 }}>{promo.desc}</p>
      </div>
    </a>
  );
}

type Props = {
  categories?: MenuCategory[];
  stores?: StoreTab[];
  storeId: string;
  onSelectStore: (id: string) => void;
  height: number;
  onMeasured?: (h: number) => void;
};

/**
 * /menu カテゴリ一覧ページ SP 版メインコンテンツ。Figma node 2147:738（設計幅 390）。
 * 縦並び: ヒーロー → Menu 見出し → 店舗タブ → 12カテゴリ2列カード → ランチ/テイクアウト/コース3バナー。
 * バナー説明の折返しで高さ可変のため、コンテンツ全体を ResizeObserver で実測し全高に反映する。
 */
export default function MenuCategorySectionSP({ categories, stores, storeId, onSelectStore, height, onMeasured }: Props) {
  const cats = categories ?? MENU_CATEGORIES;
  const defaultStore = stores && stores.length > 0 ? stores[0].id : MENU_STORES[0].id;
  // 対象店舗が指定されたカテゴリは、その店舗タブでのみ表示（未指定=全店）
  const visibleCats = cats.filter((c) => !c.storeSlugs || c.storeSlugs.includes(storeId));

  const contentRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = contentRef.current;
    if (!el || !onMeasured) return;
    const report = () => onMeasured(el.offsetHeight);
    report();
    const ro = new ResizeObserver(report);
    ro.observe(el);
    return () => ro.disconnect();
  }, [onMeasured, cats, storeId]);

  return (
    <div style={{ display: "flex", flexDirection: "column", width: 390, height, background: "#0a0a0a", overflow: "hidden" }}>
      <div style={{ height: 153, flexShrink: 0 }} />

      <div ref={contentRef} style={{ display: "flex", flexDirection: "column" }}>
        <MenuHeadingSP />
        <StoreTabsSP stores={stores} activeId={storeId} onSelect={onSelectStore} />

        {/* カテゴリカードグリッド（2列・gap20） */}
        <div style={{ display: "flex", flexWrap: "wrap", columnGap: 20, rowGap: 20, paddingLeft: 20, paddingRight: 20, paddingTop: 47 }}>
          {visibleCats.map((c) => (
            <CategoryCardSP key={c.slug} category={c} storeId={storeId} defaultStore={defaultStore} />
          ))}
        </div>

        {/* プロモバナー（ランチ/テイクアウト/コース） */}
        <div style={{ display: "flex", flexDirection: "column", gap: 40, paddingLeft: 20, paddingRight: 20, paddingTop: 60, paddingBottom: 80 }}>
          {PROMOS.map((p) => (
            <PromoBannerSP key={p.en} promo={p} />
          ))}
        </div>
      </div>
    </div>
  );
}
