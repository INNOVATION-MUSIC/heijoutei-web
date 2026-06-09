"use client";

import { useState } from "react";
import ScaledSection from "./ScaledSection";
import ReserveModal from "./ReserveModal";
import StickyButton from "./StickyButton";
import Footer from "./Footer";
import MenuTakeoutSection from "./MenuTakeoutSection";
import { useStoreParam } from "./MenuShared";
import { getTakeoutTabs, TAKEOUT_MENU_TABS } from "@/app/lib/menuData";

const DESIGN_PC = 1440;

const GRID_TOP = 1216; // セクション上端〜項目グリッド上端
const AFTER = 50 + 206 + 80 + 500 + 194; // 注記gap + 注記 + 余白 + CTA帯 + 戻るボタン

/** カテゴリの項目数（行数）からセクション全高を算出する。 */
function takeoutHeight(itemCount: number) {
  const rows = Math.max(1, Math.ceil(itemCount / 3));
  const gridHeight = rows * 200 + (rows - 1) * 40;
  return GRID_TOP + gridHeight + AFTER;
}

/**
 * /menu/takeout テイクアウトメニューのクライアントラッパー（PC のみ）。
 * 店舗（?store=）に応じてメニュー内容を切り替え、カテゴリタブの切替はリロードせず state で行う。
 * SP はデザイン未確定のため未実装。予約モーダルは ScaledSection 外で一元管理。
 */
export default function MenuTakeoutClient() {
  const [modalOpen, setModalOpen] = useState(false);
  const openModal = () => setModalOpen(true);
  const closeModal = () => setModalOpen(false);

  const [storeId, setStore] = useStoreParam();
  const [activeSlug, setActiveSlug] = useState(TAKEOUT_MENU_TABS[0].slug);

  const tabs = getTakeoutTabs(storeId); // 店舗別メニュー（無ければ既定にフォールバック）
  const tab = tabs.find((t) => t.slug === activeSlug) ?? tabs[0];
  const height = takeoutHeight(tab.items.length);

  return (
    <>
      <ScaledSection designWidth={DESIGN_PC} height={height}>
        <MenuTakeoutSection
          tabs={tabs}
          activeSlug={activeSlug}
          items={tab.items}
          storeId={storeId}
          onSelectTab={setActiveSlug}
          onSelectStore={setStore}
          onOpenModal={openModal}
          height={height}
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
