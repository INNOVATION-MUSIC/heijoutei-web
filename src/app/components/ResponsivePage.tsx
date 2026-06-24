"use client";

import { useState } from "react";
import { useIsMobile } from "@/app/lib/useIsMobile";
import ScaledSection from "./ScaledSection";
import ReserveModal from "./ReserveModal";
import LineModal from "./LineModal";

// Desktop
import HeroSection from "./HeroSection";
import NewsSection from "./NewsSection";
import { type NewsItem } from "@/app/lib/newsData";
import { type BusinessMonth } from "@/app/lib/businessCalendarDb";
import { type TopCourse } from "@/app/lib/courseDb";
import KodawariSection from "./KodawariSection";
import MenuSection from "./MenuSection";
import LunchSection from "./LunchSection";
import CourseSection from "./CourseSection";
import StoreSection from "./StoreSection";
import CalendarSection from "./CalendarSection";
import CtaSection from "./CtaSection";
// import OnlineSection from "./OnlineSection"; // OnlineShop非公開中（公開後に解除）
import Footer from "./Footer";

// SP
import HeroSectionSP from "./sp/HeroSectionSP";
import NewsSectionSP from "./sp/NewsSectionSP";
import KodawariSectionSP from "./sp/KodawariSectionSP";
import MenuSectionSP from "./sp/MenuSectionSP";
import LunchSectionSP from "./sp/LunchSectionSP";
import CourseSectionSP from "./sp/CourseSectionSP";
import StoreSectionSP from "./sp/StoreSectionSP";
import CalendarSectionSP from "./sp/CalendarSectionSP";
import CtaSectionSP from "./sp/CtaSectionSP";
// import OnlineSectionSP from "./sp/OnlineSectionSP"; // OnlineShop非公開中（公開後に解除）
import FooterSP from "./sp/FooterSP";
import HamburgerMenuSP from "./sp/HamburgerMenuSP";
import SpStickyHeader from "./sp/SpStickyHeader";

const DESIGN_PC = 1440;
const DESIGN_SP = 390;

export default function ResponsivePage({ topNews, businessMonths, topCourses }: { topNews?: NewsItem[]; businessMonths?: BusinessMonth[]; topCourses?: TopCourse[] }) {
  const isMobile = useIsMobile();
  const [modalOpen, setModalOpen] = useState(false);
  const [lineModalOpen, setLineModalOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const openModal = () => setModalOpen(true);
  const closeModal = () => setModalOpen(false);
  const openLineModal = () => setLineModalOpen(true);
  const closeLineModal = () => setLineModalOpen(false);
  const openMenu = () => setMenuOpen(true);
  const closeMenu = () => setMenuOpen(false);

  if (isMobile === null) {
    return <div style={{ minHeight: "100vh", background: "#0a0a0a" }} />;
  }

  if (isMobile) {
    return (
      <>
        <ScaledSection designWidth={DESIGN_SP} height={955}>
          <HeroSectionSP onOpenModal={openModal} onOpenLineModal={openLineModal} />
        </ScaledSection>
        <ScaledSection designWidth={DESIGN_SP} height={801}>
          <NewsSectionSP items={topNews} />
        </ScaledSection>
        <ScaledSection designWidth={DESIGN_SP} height={1688}>
          <KodawariSectionSP />
        </ScaledSection>
        <ScaledSection designWidth={DESIGN_SP} height={1105}>
          <MenuSectionSP />
        </ScaledSection>
        <ScaledSection designWidth={DESIGN_SP} height={1204}>
          <LunchSectionSP />
        </ScaledSection>
        <ScaledSection designWidth={DESIGN_SP} height={2411}>
          <CourseSectionSP courses={topCourses} />
        </ScaledSection>
        <ScaledSection designWidth={DESIGN_SP} height={1899}>
          <StoreSectionSP />
        </ScaledSection>
        <ScaledSection designWidth={DESIGN_SP} height={1090}>
          <CalendarSectionSP months={businessMonths} />
        </ScaledSection>
        <ScaledSection designWidth={DESIGN_SP} height={671}>
          <CtaSectionSP />
        </ScaledSection>
        {/* OnlineShop: リリース時は非公開。公開後にコメント解除する
        <ScaledSection designWidth={DESIGN_SP} height={973}>
          <OnlineSectionSP />
        </ScaledSection>
        */}
        <ScaledSection designWidth={DESIGN_SP} height={973}>
          <FooterSP onOpenModal={openModal} />
        </ScaledSection>

        {/* スティッキーヘッダー: ScaledSection の外側に fixed で配置 */}
        <SpStickyHeader onOpenMenu={openMenu} />

        {/* ハンバーガーメニュー: fixed overlay（ScaledSection の外側） */}
        <HamburgerMenuSP open={menuOpen} onClose={closeMenu} onOpenModal={openModal} />
        <ReserveModal open={modalOpen} onClose={closeModal} isMobile />
        <LineModal open={lineModalOpen} onClose={closeLineModal} />
      </>
    );
  }

  return (
    <>
      <ScaledSection designWidth={DESIGN_PC} height={1000}>
        <HeroSection onOpenModal={openModal} />
      </ScaledSection>
      <ScaledSection designWidth={DESIGN_PC} height={1000}>
        <NewsSection items={topNews} />
      </ScaledSection>
      <ScaledSection designWidth={DESIGN_PC} height={1840}>
        <KodawariSection />
      </ScaledSection>
      <ScaledSection designWidth={DESIGN_PC} height={1120}>
        <MenuSection />
      </ScaledSection>
      <ScaledSection designWidth={DESIGN_PC} height={1000}>
        <LunchSection />
      </ScaledSection>
      <ScaledSection designWidth={DESIGN_PC} height={1020}>
        <CourseSection courses={topCourses} />
      </ScaledSection>
      <ScaledSection designWidth={DESIGN_PC} height={1620}>
        <StoreSection />
      </ScaledSection>
      <ScaledSection designWidth={DESIGN_PC} height={1000}>
        <CalendarSection months={businessMonths} />
      </ScaledSection>
      <ScaledSection designWidth={DESIGN_PC} height={620}>
        <CtaSection />
      </ScaledSection>
      {/* OnlineShop: リリース時は非公開。公開後にコメント解除する
      <ScaledSection designWidth={DESIGN_PC} height={700}>
        <OnlineSection />
      </ScaledSection>
      */}
      <ScaledSection designWidth={DESIGN_PC} height={600}>
        <Footer onOpenModal={openModal} />
      </ScaledSection>
      <ReserveModal open={modalOpen} onClose={closeModal} />
    </>
  );
}
