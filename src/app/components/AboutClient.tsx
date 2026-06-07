"use client";

import { useState } from "react";
import ScaledSection from "./ScaledSection";
import ReserveModal from "./ReserveModal";
import AboutSection from "./AboutSection";
import CtaSection from "./CtaSection";
import OnlineSection from "./OnlineSection";
import Footer from "./Footer";
import StickyButton from "./StickyButton";

const DESIGN_PC = 1440;

/**
 * /about ページの PC ラッパー。
 * 下層ページ共通の構成（メイン → CTA → オンライン → フッター）を ScaledSection で並べる。
 * 予約モーダルは ScaledSection 外で一元管理（overflow:hidden 内だと表示されないため）。
 */
export default function AboutClient() {
  const [modalOpen, setModalOpen] = useState(false);
  const openModal = () => setModalOpen(true);

  return (
    <>
      <ScaledSection designWidth={DESIGN_PC} height={4211}>
        <AboutSection onOpenModal={openModal} />
      </ScaledSection>
      <ScaledSection designWidth={DESIGN_PC} height={620}>
        <CtaSection />
      </ScaledSection>
      <ScaledSection designWidth={DESIGN_PC} height={700}>
        <OnlineSection />
      </ScaledSection>
      <ScaledSection designWidth={DESIGN_PC} height={600}>
        <Footer onOpenModal={openModal} />
      </ScaledSection>

      <ReserveModal open={modalOpen} onClose={() => setModalOpen(false)} />
      <StickyButton />
    </>
  );
}
