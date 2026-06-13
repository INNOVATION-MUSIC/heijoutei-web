"use client";

import { useState } from "react";
import ScaledSection from "./ScaledSection";
import ReserveModal from "./ReserveModal";
import StickyButton from "./StickyButton";
import Footer from "./Footer";
import MenuLunchSection from "./MenuLunchSection";
import { useStoreParam, type StoreTab } from "./MenuShared";
import { getLunchItems, type MenuItem } from "@/app/lib/menuData";

const DESIGN_PC = 1440;
const GRID_TOP = 1047; // 見出し+店舗タブ〜項目グリッド上端
const TRAILING = 265;

function lunchHeight(itemCount: number) {
  const rows = Math.max(1, Math.ceil(itemCount / 3));
  return GRID_TOP + rows * 200 + (rows - 1) * 40 + TRAILING;
}

/**
 * /menu/lunch ランチメニューのクライアントラッパー（PC のみ）。
 * 店舗（?store=）に応じてメニュー内容を切り替える。SP はデザイン未確定のため未実装。
 */
export default function MenuLunchClient({ lunchByStore, stores }: { lunchByStore?: Record<string, MenuItem[]>; stores?: StoreTab[] }) {
  const [modalOpen, setModalOpen] = useState(false);
  const openModal = () => setModalOpen(true);
  const closeModal = () => setModalOpen(false);

  const [storeId, setStore] = useStoreParam(stores);
  const items = lunchByStore?.[storeId] ?? getLunchItems(storeId);
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
