"use client";

import { MENU_CATEGORIES, type MenuCategory, type MenuItem } from "@/app/lib/menuData";
import { MenuHeading, StoreTabs, ItemCard, BackToMenuButton, mincho, sans, GOLD } from "./MenuShared";

/* ─────────── カテゴリ切替タブ（2行・現在カテゴリは金で点灯・リロードせず切替） ─────────── */
function CategoryNav({ current, onSelect }: { current: string; onSelect: (slug: string) => void }) {
  const rows = [MENU_CATEGORIES.slice(0, 8), MENU_CATEGORIES.slice(8)];
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
  items,
  storeId,
  onOpenModal,
  height,
  onSelectCategory,
  onSelectStore,
}: {
  category: MenuCategory;
  items: MenuItem[];
  storeId: string;
  onOpenModal: () => void;
  height: number;
  onSelectCategory: (slug: string) => void;
  onSelectStore: (id: string) => void;
}) {
  return (
    <section style={{ display: "flex", flexDirection: "column", width: 1440, height, background: "#0a0a0a" }}>
      <MenuHeading onOpenModal={onOpenModal} />
      <StoreTabs activeId={storeId} onSelect={onSelectStore} />

      {/* カテゴリ見出し（中央） */}
      <div style={{ display: "flex", justifyContent: "center", paddingTop: 64 }}>
        <h1 style={{ fontFamily: mincho, fontSize: 28, fontWeight: 600, letterSpacing: "0.1em", color: "#ebe5db", margin: 0 }}>{category.title}</h1>
      </div>

      {/* カテゴリ切替タブ（リロードせず state 切替） */}
      <CategoryNav current={category.slug} onSelect={onSelectCategory} />

      {/* 税込注記 */}
      <p style={{ fontFamily: sans, fontSize: 13, letterSpacing: "0.04em", color: "#99948c", paddingLeft: 50, paddingTop: 33, margin: 0 }}>※ 価格はすべて税込表示です</p>

      {/* メニュー項目グリッド（3列・gap40） */}
      <div style={{ display: "flex", flexWrap: "wrap", columnGap: 40, rowGap: 40, paddingLeft: 50, paddingRight: 50, paddingTop: 18 }}>
        {items.map((it, i) => (
          <ItemCard key={`${it.name}-${i}`} item={it} />
        ))}
      </div>

      <div style={{ flex: 1 }} />
      <BackToMenuButton />
    </section>
  );
}
