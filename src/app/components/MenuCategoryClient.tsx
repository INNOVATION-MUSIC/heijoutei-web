"use client";

import { useState } from "react";
import { useIsMobile } from "@/app/lib/useIsMobile";
import ScaledSection from "./ScaledSection";
import ReserveModal from "./ReserveModal";
import StickyButton from "./StickyButton";
import Footer from "./Footer";
import MenuCategorySection from "./MenuCategorySection";
import { useStoreParam, type StoreTab } from "./MenuShared";
import { MENU_CATEGORIES, type MenuCategory } from "@/app/lib/menuData";

// SP
import MenuCategorySectionSP from "./sp/MenuCategorySectionSP";
import FooterSP from "./sp/FooterSP";
import SpStickyHeader from "./sp/SpStickyHeader";
import HamburgerMenuSP from "./sp/HamburgerMenuSP";

const DESIGN_PC = 1440;
const DESIGN_SP = 390;

// SP: ヘッダースペーサー(153)を除いたコンテンツの初期推定（実測前の初回描画用）。
const SP_HEADER = 153;
const SP_HEAD_BLOCK = 130 + 73 + 94 + 60 + 49; // ヒーロー + 見出し + 店舗タブ
const SP_CARD_ROW = 165 + 13 + 26; // カード写真 + 名称
const SP_BANNER = 320 + 30 + 200;  // バナー写真 + テキスト概算

function spEstimateContent(catCount: number) {
  const rows = Math.ceil(catCount / 2);
  const grid = 47 + rows * SP_CARD_ROW + (rows - 1) * 20;
  const banners = 60 + 3 * SP_BANNER + 2 * 40 + 80;
  return SP_HEAD_BLOCK + grid + banners;
}

/**
 * /menu カテゴリ一覧ページのクライアントラッパー。
 * useIsMobile で PC（1440）/ SP（390）を切り替える。データ層（categories/stores）は共通。
 * SP はバナー説明の折返しで高さ可変のため実測してセクション全高を確定する。
 * 予約モーダル・ハンバーガーは ScaledSection 外で一元管理。
 */
export default function MenuCategoryClient({ categories, stores }: { categories?: MenuCategory[]; stores?: StoreTab[] }) {
  const cats = categories ?? MENU_CATEGORIES;
  const isMobile = useIsMobile();
  const [modalOpen, setModalOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [measured, setMeasured] = useState<number | null>(null);
  const [measuredPc, setMeasuredPc] = useState<number | null>(null);
  const [storeId, setStore] = useStoreParam(stores);

  const openModal = () => setModalOpen(true);
  const closeModal = () => setModalOpen(false);

  if (isMobile === null) {
    return <div style={{ minHeight: "100vh", background: "#0a0a0a" }} />;
  }

  if (isMobile) {
    const height = SP_HEADER + (measured ?? spEstimateContent(cats.length));
    return (
      <>
        <ScaledSection designWidth={DESIGN_SP} height={height}>
          <MenuCategorySectionSP
            categories={categories}
            stores={stores}
            storeId={storeId}
            onSelectStore={setStore}
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

  // PC: カテゴリ数で行数が変わるため実測。実測前は概算（カードグリッド + バナー）で初期描画。
  const pcEstimate = 880 + Math.ceil(cats.length / 3) * 240 + 3 * 388 + 100;
  const pcHeight = measuredPc ?? pcEstimate;
  return (
    <>
      <ScaledSection designWidth={DESIGN_PC} height={pcHeight}>
        <MenuCategorySection
          onOpenModal={openModal}
          categories={categories}
          stores={stores}
          height={pcHeight}
          onMeasured={(h) => setMeasuredPc((p) => (p === h ? p : h))}
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
