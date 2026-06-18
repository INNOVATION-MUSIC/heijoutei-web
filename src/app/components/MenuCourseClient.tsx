"use client";

import { useState } from "react";
import { useIsMobile } from "@/app/lib/useIsMobile";
import ScaledSection from "./ScaledSection";
import ReserveModal from "./ReserveModal";
import StickyButton from "./StickyButton";
import Footer from "./Footer";
import MenuCourseSection from "./MenuCourseSection";
import { useStoreParam, type StoreTab } from "./MenuShared";
import { getCourses, type CourseItem } from "@/app/lib/menuData";

// SP
import MenuCourseSectionSP from "./sp/MenuCourseSectionSP";
import FooterSP from "./sp/FooterSP";
import SpStickyHeader from "./sp/SpStickyHeader";
import HamburgerMenuSP from "./sp/HamburgerMenuSP";

const DESIGN_PC = 1440;
const DESIGN_SP = 390;
const HEIGHT = 2060; // PC: 見出し+店舗タブ+コースカード3枚+注記+一覧へ戻るボタン

// SP: ヘッダースペーサー(153)を除いたコンテンツの初期推定（実測前の初回描画用）。
const SP_HEADER = 153;
const SP_HEAD_BLOCK = 130 + 73 + 94 + 60 + 49 + 89 + 52; // ヒーロー〜店舗タブ〜見出しボックス
const SP_COURSE_CARD = 320 + 240; // 写真 + テキスト概算
const SP_NOTES = 40 + 240 + 80;

function spEstimateContent(courseCount: number) {
  return SP_HEAD_BLOCK + 30 + courseCount * SP_COURSE_CARD + (courseCount - 1) * 40 + SP_NOTES;
}

/**
 * /menu/course コースメニューのクライアントラッパー。
 * useIsMobile で PC（1440）/ SP（390）を切り替える。店舗（?store=）でコース内容を切替。
 * SP は説明の折返しで高さ可変のため実測してセクション全高を確定する。
 */
export default function MenuCourseClient({ coursesByStore, stores }: { coursesByStore?: Record<string, CourseItem[]>; stores?: StoreTab[] }) {
  const isMobile = useIsMobile();
  const [modalOpen, setModalOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [measured, setMeasured] = useState<number | null>(null);

  const openModal = () => setModalOpen(true);
  const closeModal = () => setModalOpen(false);

  const [storeId, setStore] = useStoreParam(stores);
  const courses = coursesByStore?.[storeId] ?? getCourses(storeId);

  if (isMobile === null) {
    return <div style={{ minHeight: "100vh", background: "#0a0a0a" }} />;
  }

  if (isMobile) {
    const height = SP_HEADER + (measured ?? spEstimateContent(courses.length));
    return (
      <>
        <ScaledSection designWidth={DESIGN_SP} height={height}>
          <MenuCourseSectionSP
            courses={courses}
            storeId={storeId}
            stores={stores}
            onSelectStore={setStore}
            height={height}
            onMeasured={(h) => setMeasured((p) => (p === h ? p : h))}
          />
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

  return (
    <>
      <ScaledSection designWidth={DESIGN_PC} height={HEIGHT}>
        <MenuCourseSection courses={courses} storeId={storeId} stores={stores} onSelectStore={setStore} onOpenModal={openModal} height={HEIGHT} />
      </ScaledSection>
      <ScaledSection designWidth={DESIGN_PC} height={600}>
        <Footer onOpenModal={openModal} />
      </ScaledSection>

      <ReserveModal open={modalOpen} onClose={closeModal} />
      <StickyButton />
    </>
  );
}
