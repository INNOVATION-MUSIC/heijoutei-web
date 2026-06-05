"use client";

import { useEffect, useRef, useState } from "react";

// Desktop
import HeroSection from "./HeroSection";
import NewsSection from "./NewsSection";
import KodawariSection from "./KodawariSection";
import MenuSection from "./MenuSection";
import LunchSection from "./LunchSection";
import CourseSection from "./CourseSection";
import StoreSection from "./StoreSection";
import CalendarSection from "./CalendarSection";
import CtaSection from "./CtaSection";
import OnlineSection from "./OnlineSection";
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
import OnlineSectionSP from "./sp/OnlineSectionSP";
import FooterSP from "./sp/FooterSP";

const DESIGN_PC = 1440;
const DESIGN_SP = 390;
const BREAKPOINT = 1024; // px

// ScaledContentをインライン実装（両方向対応）
function ScaledSection({
  designWidth,
  height,
  children,
}: {
  designWidth: number;
  height: number;
  children: React.ReactNode;
}) {
  const [scale, setScale] = useState(1);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const update = () => {
      // window.innerWidth を使いviewport基準でスケール計算
      setScale(window.innerWidth / designWidth);
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [designWidth]);

  return (
    <div style={{ width: "100%", height: height * scale, position: "relative", overflow: "hidden" }}>
      <div
        ref={ref}
        style={{
          width: designWidth,
          height,
          transformOrigin: "top left",
          transform: `scale(${scale})`,
          position: "absolute",
          top: 0,
          left: 0,
        }}
      >
        {children}
      </div>
    </div>
  );
}

export default function ResponsivePage() {
  const [isMobile, setIsMobile] = useState<boolean | null>(null);

  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${BREAKPOINT - 1}px)`);
    // 初回チェック
    setIsMobile(mq.matches);
    // DevTools切り替え・実機向けリスナー
    const onChange = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  // マウント前は空レンダリング（ちらつき防止）
  if (isMobile === null) {
    return <div style={{ minHeight: "100vh", background: "#0a0a0a" }} />;
  }

  if (isMobile) {
    // SP: 390px設計を画面幅にスケール
    // KodawariSectionSP = こだわり1(844) + こだわり2(844) = 1688px
    return (
      <>
        <ScaledSection designWidth={DESIGN_SP} height={915}><HeroSectionSP /></ScaledSection>
        <ScaledSection designWidth={DESIGN_SP} height={844}><NewsSectionSP /></ScaledSection>
        <ScaledSection designWidth={DESIGN_SP} height={1688}><KodawariSectionSP /></ScaledSection>
        <ScaledSection designWidth={DESIGN_SP} height={1105}><MenuSectionSP /></ScaledSection>
        <ScaledSection designWidth={DESIGN_SP} height={1204}><LunchSectionSP /></ScaledSection>
        <ScaledSection designWidth={DESIGN_SP} height={2411}><CourseSectionSP /></ScaledSection>
        <ScaledSection designWidth={DESIGN_SP} height={1899}><StoreSectionSP /></ScaledSection>
        <ScaledSection designWidth={DESIGN_SP} height={1090}><CalendarSectionSP /></ScaledSection>
        <ScaledSection designWidth={DESIGN_SP} height={671}><CtaSectionSP /></ScaledSection>
        <ScaledSection designWidth={DESIGN_SP} height={973}><OnlineSectionSP /></ScaledSection>
        <ScaledSection designWidth={DESIGN_SP} height={973}><FooterSP /></ScaledSection>
      </>
    );
  }

  // PC: 1440px設計を画面幅にスケール
  // KodawariSection = こだわり1(920) + こだわり2(920) = 1840px
  return (
    <>
      <ScaledSection designWidth={DESIGN_PC} height={1000}><HeroSection /></ScaledSection>
      <ScaledSection designWidth={DESIGN_PC} height={1000}><NewsSection /></ScaledSection>
      <ScaledSection designWidth={DESIGN_PC} height={1840}><KodawariSection /></ScaledSection>
      <ScaledSection designWidth={DESIGN_PC} height={1120}><MenuSection /></ScaledSection>
      <ScaledSection designWidth={DESIGN_PC} height={1000}><LunchSection /></ScaledSection>
      <ScaledSection designWidth={DESIGN_PC} height={1020}><CourseSection /></ScaledSection>
      <ScaledSection designWidth={DESIGN_PC} height={1620}><StoreSection /></ScaledSection>
      <ScaledSection designWidth={DESIGN_PC} height={1000}><CalendarSection /></ScaledSection>
      <ScaledSection designWidth={DESIGN_PC} height={620}><CtaSection /></ScaledSection>
      <ScaledSection designWidth={DESIGN_PC} height={700}><OnlineSection /></ScaledSection>
      <ScaledSection designWidth={DESIGN_PC} height={600}><Footer /></ScaledSection>
    </>
  );
}
