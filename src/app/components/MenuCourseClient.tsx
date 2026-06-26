"use client";

import { useState } from "react";
import { useIsMobile } from "@/app/lib/useIsMobile";
import ScaledSection from "./ScaledSection";
import ReserveModal from "./ReserveModal";
import StickyButton from "./StickyButton";
import Footer from "./Footer";
import MenuCourseSection from "./MenuCourseSection";
import { useStoreParam, type StoreTab } from "./MenuShared";
import { getCourses, DRINK_PLAN_CATEGORY_SLUGS, type CourseItem } from "@/app/lib/menuData";
import { type CourseGroup } from "@/app/lib/courseDb";

// SP
import MenuCourseSectionSP from "./sp/MenuCourseSectionSP";
import FooterSP from "./sp/FooterSP";
import SpStickyHeader from "./sp/SpStickyHeader";
import HamburgerMenuSP from "./sp/HamburgerMenuSP";

const DESIGN_PC = 1440;
const DESIGN_SP = 390;
const PC_HEIGHT_EST = 1500; // PC 初期推定（実測前）。見出し+店舗タブ+コースカード(画像なし)+注記+戻るボタン

// SP: ヘッダースペーサー(153)を除いたコンテンツの初期推定（実測前の初回描画用）。
const SP_HEADER = 153;
const SP_HEAD_BLOCK = 130 + 73 + 94 + 60 + 49 + 89 + 52; // ヒーロー〜店舗タブ〜見出しボックス
const SP_COURSE_CARD = 240; // テキストのみカード概算（画像なし）
const SP_NOTES = 40 + 240 + 80;

function spEstimateContent(courseCount: number) {
  return SP_HEAD_BLOCK + 30 + courseCount * SP_COURSE_CARD + Math.max(0, courseCount - 1) * 40 + SP_NOTES;
}

// アクティブ店舗のカテゴリ別グループを得る。DB 連動が無ければ静的データの単一グループにフォールバック。
function groupsForStore(
  storeId: string,
  courseGroupsByStore?: Record<string, CourseGroup[]>,
  coursesByStore?: Record<string, CourseItem[]>,
): CourseGroup[] {
  const fromDb = courseGroupsByStore?.[storeId];
  if (fromDb && fromDb.length > 0) return fromDb;
  return [{ slug: null, name: null, courses: coursesByStore?.[storeId] ?? getCourses(storeId) }];
}

/**
 * /menu/course コースメニューのクライアントラッパー。
 * useIsMobile で PC（1440）/ SP（390）を切り替える。店舗（?store=）でコース内容を切替。
 * コースカテゴリ（course_categories）があればサブタブで出し分ける（テイクアウト方式）。
 * カテゴリ数・説明の折返しで高さ可変のため PC/SP とも実測してセクション全高を確定する。
 */
export default function MenuCourseClient({
  coursesByStore,
  courseGroupsByStore,
  stores,
}: {
  coursesByStore?: Record<string, CourseItem[]>;
  courseGroupsByStore?: Record<string, CourseGroup[]>;
  stores?: StoreTab[];
}) {
  const isMobile = useIsMobile();
  const [modalOpen, setModalOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [measuredSp, setMeasuredSp] = useState<number | null>(null);
  const [measuredPc, setMeasuredPc] = useState<number | null>(null);
  const [catIdx, setCatIdx] = useState(0);

  const openModal = () => setModalOpen(true);
  const closeModal = () => setModalOpen(false);

  const [storeId, setStore] = useStoreParam(stores);
  // 店舗切替時はカテゴリ選択と実測をリセットする
  const selectStore = (id: string) => {
    setStore(id);
    setCatIdx(0);
    setMeasuredSp(null);
    setMeasuredPc(null);
  };
  const selectCategory = (i: number) => {
    setCatIdx(i);
    setMeasuredSp(null);
    setMeasuredPc(null);
  };

  const groups = groupsForStore(storeId, courseGroupsByStore, coursesByStore);
  const activeIdx = Math.min(catIdx, groups.length - 1);
  const courses = groups[activeIdx]?.courses ?? [];
  // タブは2グループ以上のときのみ表示（単一/未分類はフラット表示）
  const categoryTabs = groups.length >= 2 ? groups.map((g) => g.name ?? "その他") : undefined;
  // 飲み放題プランは指定カテゴリ（フルコース/盛り合わせ）選択時のみ注意書きの上に表示
  const showDrinkPlan = DRINK_PLAN_CATEGORY_SLUGS.includes(groups[activeIdx]?.slug ?? "");

  if (isMobile === null) {
    return <div style={{ minHeight: "100vh", background: "#0a0a0a" }} />;
  }

  if (isMobile) {
    const height = SP_HEADER + (measuredSp ?? spEstimateContent(courses.length));
    return (
      <>
        <ScaledSection designWidth={DESIGN_SP} height={height}>
          <MenuCourseSectionSP
            courses={courses}
            storeId={storeId}
            stores={stores}
            onSelectStore={selectStore}
            categoryTabs={categoryTabs}
            activeCategory={activeIdx}
            onSelectCategory={selectCategory}
            showDrinkPlan={showDrinkPlan}
            height={height}
            onMeasured={(h) => setMeasuredSp((p) => (p === h ? p : h))}
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

  const pcHeight = measuredPc ?? PC_HEIGHT_EST;
  return (
    <>
      <ScaledSection designWidth={DESIGN_PC} height={pcHeight}>
        <MenuCourseSection
          courses={courses}
          storeId={storeId}
          stores={stores}
          onSelectStore={selectStore}
          categoryTabs={categoryTabs}
          activeCategory={activeIdx}
          onSelectCategory={selectCategory}
          showDrinkPlan={showDrinkPlan}
          onOpenModal={openModal}
          height={pcHeight}
          onMeasured={(h) => setMeasuredPc((p) => (p === h ? p : h))}
        />
      </ScaledSection>
      <ScaledSection designWidth={DESIGN_PC} height={600}>
        <Footer onOpenModal={openModal} />
      </ScaledSection>

      <ReserveModal open={modalOpen} onClose={closeModal} />
      <StickyButton />
    </>
  );
}
