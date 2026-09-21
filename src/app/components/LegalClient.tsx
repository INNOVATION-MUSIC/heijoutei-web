"use client";

import { useState } from "react";
import { useIsMobile } from "@/app/lib/useIsMobile";
import ScaledSection from "./ScaledSection";
import ReserveModal from "./ReserveModal";
import StickyButton from "./StickyButton";
import Footer from "./Footer";
import LegalSection from "./LegalSection";
import LegalSectionSP from "./sp/LegalSectionSP";
import type { LegalDoc } from "@/app/lib/legalDoc";
import FooterSP from "./sp/FooterSP";
import SpStickyHeader from "./sp/SpStickyHeader";
import HamburgerMenuSP from "./sp/HamburgerMenuSP";

const DESIGN_PC = 1440;
const DESIGN_SP = 390;

// 実測前の初回描画用の推定高さ（ResizeObserver で確定する）
const PC_EST = 5200;
const SP_EST = 7600;

/** 利用規約・プライバシーポリシーページ共通。useIsMobile で PC（1440）/ SP（390）を切り替える。 */
export default function LegalClient({ doc }: { doc: LegalDoc }) {
  const isMobile = useIsMobile();
  const [modalOpen, setModalOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [measured, setMeasured] = useState<number | null>(null);
  const openModal = () => setModalOpen(true);
  const closeModal = () => setModalOpen(false);

  const onMeasured = (h: number) => setMeasured((p) => (p === h ? p : h));

  if (isMobile === null) {
    return <div style={{ minHeight: "100vh", background: "#0a0a0a" }} />;
  }

  if (isMobile) {
    const height = measured ?? SP_EST;
    return (
      <>
        <ScaledSection designWidth={DESIGN_SP} height={height}>
          <LegalSectionSP doc={doc} height={height} onMeasured={onMeasured} />
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

  const height = measured ?? PC_EST;
  return (
    <>
      <ScaledSection designWidth={DESIGN_PC} height={height}>
        <LegalSection doc={doc} height={height} onOpenModal={openModal} onMeasured={onMeasured} />
      </ScaledSection>

      <ScaledSection designWidth={DESIGN_PC} height={600}>
        <Footer onOpenModal={openModal} />
      </ScaledSection>

      <ReserveModal open={modalOpen} onClose={closeModal} />
      <StickyButton />
    </>
  );
}
