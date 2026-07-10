"use client";

import { useEffect, useRef } from "react";
import { MENU_CATEGORIES, type MenuCategory, type MenuItem } from "@/app/lib/menuData";
import { MenuHeading, StoreTabs, ItemCard, BackToMenuButton, mincho, sans, GOLD, PANEL, type StoreTab } from "./MenuShared";

/* ─────────── カテゴリ切替タブ（2行・現在カテゴリは金で点灯・リロードせず切替） ─────────── */
function CategoryNav({ categories, current, onSelect }: { categories: MenuCategory[]; current: string; onSelect: (slug: string) => void }) {
  // DBのカテゴリ一覧（lunch除外済み）。先頭8件 + 残りの2行に分ける。
  const rows = [categories.slice(0, 8), categories.slice(8)];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 32, paddingLeft: 72, paddingRight: 72, paddingTop: 88 }}>
      {rows.map((row, ri) => (
        <div key={ri} style={{ display: "flex", columnGap: 40, borderBottom: "1px solid rgba(234,229,219,0.15)" }}>
          {row.map((c) => {
            const active = c.slug === current;
            const common: React.CSSProperties = {
              fontFamily: mincho,
              fontSize: 16,
              letterSpacing: "0.04em",
              color: active ? GOLD : "#99948c",
              whiteSpace: "nowrap",
              paddingBottom: 16,
              marginBottom: -1,
              borderBottom: active ? `2px solid ${GOLD}` : "2px solid transparent",
              transition: "color 0.3s ease",
            };
            return active ? (
              <span key={c.slug} style={common}>{c.name}</span>
            ) : (
              <button
                key={c.slug}
                type="button"
                onClick={() => onSelect(c.slug)}
                style={{ ...common, background: "transparent", borderTop: "none", borderRight: "none", borderLeft: "none", padding: 0, paddingBottom: 16, cursor: "pointer" }}
              >
                {c.name}
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}

/**
 * /menu/[category] 詳細ページのメインコンテンツ（PC のみ・全高は client から受け取る）。
 * 共有コンポーネント（PageHeader/Footer）は変更せず再利用。
 */
export default function MenuDetailSection({
  category,
  categories,
  items,
  storeId,
  stores,
  onOpenModal,
  height,
  onSelectCategory,
  onSelectStore,
  onMeasured,
}: {
  category: MenuCategory;
  categories?: MenuCategory[];
  items: MenuItem[];
  storeId: string;
  stores?: StoreTab[];
  onOpenModal: () => void;
  height: number;
  onSelectCategory: (slug: string) => void;
  onSelectStore: (id: string) => void;
  // 追加メニュー等で品目カードの高さが可変になるため、実測して全高を client に返す。
  onMeasured?: (h: number) => void;
}) {
  // カテゴリ切替タブ用の一覧（DB由来 → 無ければ静的）。
  // 対象店舗が指定されたカテゴリは選択店舗のみ表示（未指定=全店）。現在表示中は常に残す。
  const navCategories = (categories && categories.length > 0 ? categories : MENU_CATEGORIES)
    .filter((c) => c.slug === category.slug || !c.storeSlugs || c.storeSlugs.includes(storeId));
  const sectionRef = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = sectionRef.current;
    if (!el || !onMeasured) return;
    const report = () => onMeasured(el.offsetHeight);
    report();
    const ro = new ResizeObserver(report);
    ro.observe(el);
    return () => ro.disconnect();
  }, [onMeasured, items]);
  return (
    <section ref={sectionRef} style={{ display: "flex", flexDirection: "column", width: 1440, minHeight: height, background: "#0a0a0a" }}>
      <MenuHeading onOpenModal={onOpenModal} />
      <StoreTabs stores={stores} activeId={storeId} onSelect={onSelectStore} />

      {/* カテゴリ見出し（中央） */}
      <div style={{ display: "flex", justifyContent: "center", paddingTop: 64 }}>
        <h1 style={{ fontFamily: mincho, fontSize: 28, fontWeight: 600, letterSpacing: "0.1em", color: "#ebe5db", margin: 0 }}>{category.title}</h1>
      </div>

      {/* カテゴリ切替タブ（リロードせず state 切替） */}
      <CategoryNav categories={navCategories} current={category.slug} onSelect={onSelectCategory} />

      {/* 税込注記 */}
      <p style={{ fontFamily: sans, fontSize: 13, letterSpacing: "0.04em", color: "#99948c", paddingLeft: 50, paddingTop: 33, margin: 0 }}>※ 価格はすべて税込表示です</p>

      {/* メニュー項目グリッド（3列・gap40）／選択店舗に登録が無ければ空状態 */}
      {items.length > 0 ? (
        <div style={{ display: "flex", flexWrap: "wrap", columnGap: 40, rowGap: 40, paddingLeft: 50, paddingRight: 50, paddingTop: 18 }}>
          {items.map((it, i) => (
            <ItemCard key={`${it.name}-${i}`} item={it} />
          ))}
        </div>
      ) : (
        <div style={{ paddingLeft: 50, paddingRight: 50, paddingTop: 18 }}>
          <div style={{ width: 1340, height: 200, background: PANEL, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16, border: "1px solid rgba(234,229,219,0.08)" }}>
            <div style={{ width: 48, height: 1, background: "rgba(217,184,107,0.6)" }} />
            <p style={{ fontFamily: mincho, fontSize: 20, letterSpacing: "0.08em", color: "#ebe5db", margin: 0 }}>選択中の店舗ではお取り扱いがございません</p>
            <p style={{ fontFamily: sans, fontSize: 13, letterSpacing: "0.04em", color: "#99948c", margin: 0 }}>店舗を切り替えてご確認ください</p>
          </div>
        </div>
      )}

      <div style={{ flex: 1 }} />
      <BackToMenuButton />
    </section>
  );
}
