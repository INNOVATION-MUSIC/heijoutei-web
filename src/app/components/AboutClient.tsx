"use client";

import { useState } from "react";
import { useIsMobile } from "@/app/lib/useIsMobile";
import ScaledSection from "./ScaledSection";
import ReserveModal from "./ReserveModal";
import StickyButton from "./StickyButton";

// Desktop
import AboutSection from "./AboutSection";
import CtaSection from "./CtaSection";
import OnlineSection from "./OnlineSection";
import Footer from "./Footer";

// SP
import AboutSectionSP from "./sp/AboutSectionSP";
import CtaSectionSP from "./sp/CtaSectionSP";
import OnlineSectionSP from "./sp/OnlineSectionSP";
import FooterSP from "./sp/FooterSP";
import SpStickyHeader from "./sp/SpStickyHeader";
import HamburgerMenuSP from "./sp/HamburgerMenuSP";

const DESIGN_PC = 1440;
const DESIGN_SP = 390;

/**
 * /about ページのクライアントラッパー。
 * PC / SP を切り替え、下層ページ共通の構成（メイン → CTA → オンライン → フッター）を
 * ScaledSection で並べる。CTA / オンライン / フッターはトップと同じ既存コンポーネントを再利用。
 * ヘッダー（PC: PageHeader / SP: SpStickyHeader）・フッターはトップと共通化済み。
 * 予約モーダルは ScaledSection 外で一元管理（overflow:hidden 内だと表示されないため）。
 */
export default function AboutClient() {
  const isMobile = useIsMobile();
  const [modalOpen, setModalOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const openModal = () => setModalOpen(true);
  const closeModal = () => setModalOpen(false);
  const openMenu = () => setMenuOpen(true);
  const closeMenu = () => setMenuOpen(false);

  if (isMobile === null) {
    return <div style={{ minHeight: "100vh", background: "#0a0a0a" }} />;
  }

  if (isMobile) {
    return (
      <>
        <ScaledSection designWidth={DESIGN_SP} height={3520}>
          <AboutSectionSP />
        </ScaledSection>
        <ScaledSection designWidth={DESIGN_SP} height={671}>
          <CtaSectionSP />
        </ScaledSection>
        <ScaledSection designWidth={DESIGN_SP} height={973}>
          <OnlineSectionSP />
        </ScaledSection>
        <ScaledSection designWidth={DESIGN_SP} height={973}>
          <FooterSP onOpenModal={openModal} />
        </ScaledSection>

        {/* スティッキーヘッダー: ScaledSection の外側に fixed で配置 */}
        <SpStickyHeader onOpenMenu={openMenu} />

        {/* ハンバーガーメニュー: fixed overlay（ScaledSection の外側） */}
        <HamburgerMenuSP open={menuOpen} onClose={closeMenu} onOpenModal={openModal} />
        <ReserveModal open={modalOpen} onClose={closeModal} isMobile />
      </>
    );
  }

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

      <ReserveModal open={modalOpen} onClose={closeModal} />
      <StickyButton />
    </>
  );
}
