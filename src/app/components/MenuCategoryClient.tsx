"use client";

import { useState } from "react";
import ScaledSection from "./ScaledSection";
import ReserveModal from "./ReserveModal";
import StickyButton from "./StickyButton";
import Footer from "./Footer";
import MenuCategorySection from "./MenuCategorySection";

const DESIGN_PC = 1440;

/**
 * /menu カテゴリページのクライアントラッパー（PC のみ）。
 * SP はデザイン未確定のため未実装（PC 設計 1440 を ScaledSection で縮小表示）。
 * 予約モーダルは ScaledSection 外で一元管理。
 */
export default function MenuCategoryClient() {
  const [modalOpen, setModalOpen] = useState(false);
  const openModal = () => setModalOpen(true);
  const closeModal = () => setModalOpen(false);

  return (
    <>
      <ScaledSection designWidth={DESIGN_PC} height={3346}>
        <MenuCategorySection onOpenModal={openModal} />
      </ScaledSection>
      <ScaledSection designWidth={DESIGN_PC} height={600}>
        <Footer onOpenModal={openModal} />
      </ScaledSection>

      <ReserveModal open={modalOpen} onClose={closeModal} />
      <StickyButton />
    </>
  );
}
