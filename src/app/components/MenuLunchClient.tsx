"use client";

import { useState } from "react";
import { useIsMobile } from "@/app/lib/useIsMobile";
import ScaledSection from "./ScaledSection";
import ReserveModal from "./ReserveModal";
import StickyButton from "./StickyButton";
import Footer from "./Footer";
import MenuLunchSection from "./MenuLunchSection";
import { useStoreParam, type StoreTab } from "./MenuShared";
import { getLunchItems, type MenuItem } from "@/app/lib/menuData";

// SP
import MenuLunchSectionSP from "./sp/MenuLunchSectionSP";
import FooterSP from "./sp/FooterSP";
import SpStickyHeader from "./sp/SpStickyHeader";
import HamburgerMenuSP from "./sp/HamburgerMenuSP";

const DESIGN_PC = 1440;
const DESIGN_SP = 390;
const GRID_TOP = 1047; // 見出し+店舗タブ〜項目グリッド上端
const TRAILING = 265;

function lunchHeight(itemCount: number) {
  const rows = Math.max(1, Math.ceil(itemCount / 3));
  return GRID_TOP + rows * 120 + (rows - 1) * 40 + TRAILING;
}

// SP: ヘッダースペーサー(153)を除いたコンテンツの初期推定。
const SP_HEADER = 153;
const SP_HEAD_BLOCK = 130 + 73 + 94 + 60 + 49 + 89 + 52 + 20 + 13;
const SP_ITEM_H = 110;
const SP_ITEM_GAP = 20;

function spEstimateContent(itemCount: number) {
  const n = Math.max(1, itemCount);
  return SP_HEAD_BLOCK + 20 + n * SP_ITEM_H + (n - 1) * SP_ITEM_GAP + 80;
}

/**
 * /menu/lunch ランチメニューのクライアントラッパー。
 * useIsMobile で PC（1440）/ SP（390）を切り替える。店舗（?store=）でメニュー内容を切替。
 * SP は品目説明の折返しで高さ可変のため実測してセクション全高を確定する。
 */
export default function MenuLunchClient({ lunchByStore, stores }: { lunchByStore?: Record<string, MenuItem[]>; stores?: StoreTab[] }) {
  const isMobile = useIsMobile();
  const [modalOpen, setModalOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [measured, setMeasured] = useState<number | null>(null);

  const openModal = () => setModalOpen(true);
  const closeModal = () => setModalOpen(false);

  const [storeId, setStore] = useStoreParam(stores);
  const items = lunchByStore?.[storeId] ?? getLunchItems(storeId);

  if (isMobile === null) {
    return <div style={{ minHeight: "100vh", background: "#0a0a0a" }} />;
  }

  if (isMobile) {
    const height = SP_HEADER + (measured ?? spEstimateContent(items.length));
    return (
      <>
        <ScaledSection designWidth={DESIGN_SP} height={height}>
          <MenuLunchSectionSP
            items={items}
            storeId={storeId}
            stores={stores}
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

  const height = lunchHeight(items.length);
  return (
    <>
      <ScaledSection designWidth={DESIGN_PC} height={height}>
        <MenuLunchSection items={items} storeId={storeId} stores={stores} onSelectStore={setStore} onOpenModal={openModal} height={height} />
      </ScaledSection>
      <ScaledSection designWidth={DESIGN_PC} height={600}>
        <Footer onOpenModal={openModal} />
      </ScaledSection>

      <ReserveModal open={modalOpen} onClose={closeModal} />
      <StickyButton />
    </>
  );
}
