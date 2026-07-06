"use client";

import { useState } from "react";
import ScaledSection from "./ScaledSection";
import ReserveModal from "./ReserveModal";
import StickyButton from "./StickyButton";
import Footer from "./Footer";

import GiftMainSection from "./gift/GiftMainSection";
import GiftCtaSection from "./gift/GiftCtaSection";
import GiftShippingSection from "./gift/GiftShippingSection";

const DESIGN_PC = 1440;

/**
 * /gift ギフト（ご進物）ページのクライアントラッパー。
 * 構成: メイン（見出し + 商品カード） → CTA（電話注文） → 送料金表 → フッター。
 * データは lib/giftData.ts（PC/SP 共通の正本）を参照。
 *
 * 現状は PC のみ（ユーザー指定）。SP デザイン確定後に AboutClient と同様
 * useIsMobile 分岐で sp/ 版セクションを追加する（データ層は giftData のまま流用）。
 */
export default function GiftClient() {
  const [modalOpen, setModalOpen] = useState(false);
  const openModal = () => setModalOpen(true);
  const closeModal = () => setModalOpen(false);

  return (
    <>
      <ScaledSection designWidth={DESIGN_PC} height={2848}>
        <GiftMainSection onOpenModal={openModal} />
      </ScaledSection>
      <ScaledSection designWidth={DESIGN_PC} height={332}>
        <GiftCtaSection />
      </ScaledSection>
      <ScaledSection designWidth={DESIGN_PC} height={988}>
        <GiftShippingSection />
      </ScaledSection>
      <ScaledSection designWidth={DESIGN_PC} height={600}>
        <Footer onOpenModal={openModal} />
      </ScaledSection>

      <ReserveModal open={modalOpen} onClose={closeModal} />
      <StickyButton />
    </>
  );
}
