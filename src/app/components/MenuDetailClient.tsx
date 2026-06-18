"use client";

import { useState } from "react";
import { useIsMobile } from "@/app/lib/useIsMobile";
import ScaledSection from "./ScaledSection";
import ReserveModal from "./ReserveModal";
import StickyButton from "./StickyButton";
import Footer from "./Footer";
import MenuDetailSection from "./MenuDetailSection";
import { useStoreParam, type StoreTab } from "./MenuShared";
import { getMenuCategory, type MenuCategory } from "@/app/lib/menuData";

// SP
import MenuDetailSectionSP from "./sp/MenuDetailSectionSP";
import FooterSP from "./sp/FooterSP";
import SpStickyHeader from "./sp/SpStickyHeader";
import HamburgerMenuSP from "./sp/HamburgerMenuSP";

const DESIGN_PC = 1440;
const DESIGN_SP = 390;

const GRID_TOP = 1307; // セクション上端〜項目グリッド上端
const TRAILING = 265; // グリッド下端〜フッター開始

/** PC: 詳細セクションの全高を項目数（行数）から算出する。 */
function detailHeight(itemCount: number) {
  const rows = Math.max(1, Math.ceil(itemCount / 3));
  const gridHeight = rows * 200 + (rows - 1) * 40;
  return GRID_TOP + gridHeight + TRAILING;
}

// SP: ヘッダースペーサー(153)を除いたコンテンツの初期推定（実測前の初回描画用）。
const SP_HEADER = 153;
const SP_HEAD_BLOCK = 130 + 73 + 94 + 60 + 49 + 89 + 52 + 20 + 13; // ヒーロー〜店舗タブ〜ドロップダウン〜税込注記
const SP_ITEM_H = 150;
const SP_ITEM_GAP = 20;

function spEstimateContent(itemCount: number) {
  const n = Math.max(1, itemCount);
  return SP_HEAD_BLOCK + 20 + n * SP_ITEM_H + (n - 1) * SP_ITEM_GAP + 80;
}

/**
 * /menu/[category] 詳細ページのクライアントラッパー。
 * useIsMobile で PC（1440）/ SP（390）を切り替える。データ層（category/items）は共通。
 * カテゴリ・店舗の選択をここで一元管理し、どちらの切替でも品目を再計算する。
 * SP は品目説明の折返しで高さ可変のため実測してセクション全高を確定する。
 */
export default function MenuDetailClient({ category, allCategories, stores }: { category: MenuCategory; allCategories?: MenuCategory[]; stores?: StoreTab[] }) {
  const isMobile = useIsMobile();
  const [modalOpen, setModalOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [measured, setMeasured] = useState<number | null>(null);

  const openModal = () => setModalOpen(true);
  const closeModal = () => setModalOpen(false);

  // カテゴリ切替はリロードせず state で行い、URL は history.replaceState で同期する。
  const [activeSlug, setActiveSlug] = useState(category.slug);
  // 店舗選択は ?store= を真実の値として URL 駆動で保持。
  const [storeId, selectStore] = useStoreParam(stores);

  const cat = allCategories?.find((c) => c.slug === activeSlug) ?? getMenuCategory(activeSlug) ?? category;
  // 店舗別メニュー。登録のあるカテゴリは選択店舗に登録が無ければ空（フォールバックしない）。
  const hasPerStore = !!cat.itemsByStore && Object.keys(cat.itemsByStore).length > 0;
  const items = cat.itemsByStore?.[storeId] ?? (hasPerStore ? [] : cat.items);

  // カテゴリ切替：パスのみ更新（?store= は維持）／実測をリセット
  const selectCategory = (slug: string) => {
    setActiveSlug(slug);
    setMeasured(null);
    const url = new URL(window.location.href);
    url.pathname = `/menu/${slug}`;
    window.history.replaceState({}, "", url);
  };

  if (isMobile === null) {
    return <div style={{ minHeight: "100vh", background: "#0a0a0a" }} />;
  }

  if (isMobile) {
    const height = SP_HEADER + (measured ?? spEstimateContent(items.length));
    return (
      <>
        <ScaledSection designWidth={DESIGN_SP} height={height}>
          <MenuDetailSectionSP
            category={cat}
            categories={allCategories}
            items={items}
            storeId={storeId}
            stores={stores}
            onSelectCategory={selectCategory}
            onSelectStore={selectStore}
            height={height}
            onMeasured={(h) => setMeasured((p) => (p === h ? p : h))}
          />
        </ScaledSection>
        <ScaledSection designWidth={DESIGN_SP} height={973}>
          <FooterSP onOpenModal={openModal} />
        </ScaledSection>

        <SpStickyHeader onOpenMenu={() => setMenuOpen(true)} />
        <HamburgerMenuSP open={menuOpen} onClose={() => setMenuOpen(false)} onOpenModal={openModal} />
        <ReserveModal open={modalOpen} onClose={closeModal} isMobile />
      </>
    );
  }

  const height = detailHeight(items.length);
  return (
    <>
      <ScaledSection designWidth={DESIGN_PC} height={height}>
        <MenuDetailSection
          category={cat}
          categories={allCategories}
          items={items}
          storeId={storeId}
          stores={stores}
          height={height}
          onOpenModal={openModal}
          onSelectCategory={selectCategory}
          onSelectStore={selectStore}
        />
      </ScaledSection>
      <ScaledSection designWidth={DESIGN_PC} height={600}>
        <Footer onOpenModal={openModal} />
      </ScaledSection>

      <ReserveModal open={modalOpen} onClose={closeModal} />
      <StickyButton />
    </>
  );
}
