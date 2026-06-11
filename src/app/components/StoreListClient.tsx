"use client";

import { useState } from "react";
import ScaledSection from "./ScaledSection";
import ReserveModal from "./ReserveModal";
import StickyButton from "./StickyButton";

import StoreListSection from "./StoreListSection";
import Footer from "./Footer";
import type { StoreCardData } from "@/app/lib/storeListDb";

const DESIGN_PC = 1440;
const STORE_HEIGHT = 3050; // Figma: フッター開始 y=3050

/**
 * /store 店舗一覧ページのクライアントラッパー。
 * SP はデザイン未確定のため、現状は PC レイアウト（1440 設計）を ScaledSection で表示する。
 * SP デザイン確定後に AboutClient と同様の PC/SP 分岐を追加する想定。
 * 予約モーダルは ScaledSection 外で一元管理。
 */
export default function StoreListClient({ stores }: { stores?: StoreCardData[] }) {
  const [modalOpen, setModalOpen] = useState(false);
  const openModal = () => setModalOpen(true);
  const closeModal = () => setModalOpen(false);

  return (
    <>
      <ScaledSection designWidth={DESIGN_PC} height={STORE_HEIGHT}>
        <StoreListSection onOpenModal={openModal} height={STORE_HEIGHT} stores={stores} />
      </ScaledSection>
      <ScaledSection designWidth={DESIGN_PC} height={600}>
        <Footer onOpenModal={openModal} />
      </ScaledSection>

      <ReserveModal open={modalOpen} onClose={closeModal} />
      <StickyButton />
    </>
  );
}
