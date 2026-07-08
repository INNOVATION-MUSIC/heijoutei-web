"use client";

import { useState } from "react";
import { useIsMobile } from "@/app/lib/useIsMobile";
import ScaledSection from "./ScaledSection";
import ReserveModal from "./ReserveModal";
import StickyButton from "./StickyButton";

import NewsListSection from "./NewsListSection";
import Footer from "./Footer";

// SP
import NewsListSectionSP from "./sp/NewsListSectionSP";
import FooterSP from "./sp/FooterSP";
import SpStickyHeader from "./sp/SpStickyHeader";
import HamburgerMenuSP from "./sp/HamburgerMenuSP";

import { NEWS_LIST_DATA, type NewsListItem } from "@/app/lib/newsData";

const DESIGN_PC = 1440;
const DESIGN_SP = 390;

// 表示件数（PC/SP 共通）
const PAGE_SIZE = 6;

// --- PC: 表示件数・グリッド寸法（NewsListSection と一致させる） ---
const GRID_TOP = 828;   // 1段目カード上端 y
const CARD_H = 437;     // カード最大高（2行タイトル）
const ROW_GAP = 66;
const BTN_BLOCK = 140 + 50; // もっと見るボタン paddingTop + ボタン高
const TRAILING = 277;   // ボタン下〜セクション末尾の余白

/** PC: 表示件数に応じたセクション高さを算出 */
function pcSectionHeight(visible: number, hasMore: boolean) {
  const rows = Math.ceil(visible / 3);
  const gridH = rows * CARD_H + (rows - 1) * ROW_GAP;
  return GRID_TOP + gridH + (hasMore ? BTN_BLOCK : 0) + TRAILING;
}

// --- SP: 寸法（NewsListSectionSP と一致させる） ---
const SP_GRID_TOP = 517;      // ヘッダー(153)+ヒーロー(130)+見出し(73+98)+リスト上余白(63)
const SP_CARD_H = 312;        // カード最大高（写真220+メタ+2行タイトル）
const SP_GAP = 32;
const SP_BTN_BLOCK = 80 + 50; // もっと見るボタン paddingTop + ボタン高
const SP_TRAILING = 149;      // ボタン下〜セクション末尾の余白

/** SP: 表示件数に応じたセクション高さを算出（1列） */
function spSectionHeight(visible: number, hasMore: boolean) {
  const listH = visible * SP_CARD_H + (visible - 1) * SP_GAP;
  return SP_GRID_TOP + listH + (hasMore ? SP_BTN_BLOCK : 0) + SP_TRAILING;
}

/**
 * /news お知らせ一覧ページのクライアントラッパー。
 * useIsMobile で PC（1440）/ SP（390）を切り替える。データ層（items）は共通。
 * 予約モーダル・ハンバーガーは ScaledSection 外で一元管理（overflow:hidden 内だと表示されないため）。
 */
export default function NewsListClient({ items }: { items?: NewsListItem[] }) {
  const list = items ?? NEWS_LIST_DATA;
  const isMobile = useIsMobile();
  const [modalOpen, setModalOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  // この index 以降のカードを出現アニメーション対象にする（初期表示分も再生）
  const [animateFrom, setAnimateFrom] = useState(0);

  const openModal = () => setModalOpen(true);
  const closeModal = () => setModalOpen(false);
  const openMenu = () => setMenuOpen(true);
  const closeMenu = () => setMenuOpen(false);

  const total = list.length;
  const hasMore = visibleCount < total;
  const shownCount = Math.min(visibleCount, total);
  const showMore = () =>
    setVisibleCount((v) => {
      setAnimateFrom(v); // 今回新たに表示する分だけアニメーション
      return Math.min(v + PAGE_SIZE, total);
    });

  if (isMobile === null) {
    return <div style={{ minHeight: "100vh", background: "#0a0a0a" }} />;
  }

  if (isMobile) {
    // お知らせ 0 件のときは見出し＋メッセージだけの高さに抑える
    const height = total === 0 ? SP_GRID_TOP + 220 : spSectionHeight(shownCount, hasMore);
    return (
      <>
        <ScaledSection designWidth={DESIGN_SP} height={height}>
          <NewsListSectionSP
            height={height}
            visibleCount={visibleCount}
            hasMore={hasMore}
            onShowMore={showMore}
            animateFrom={animateFrom}
            items={list}
          />
        </ScaledSection>
        <ScaledSection designWidth={DESIGN_SP} height={973}>
          <FooterSP onOpenModal={openModal} />
        </ScaledSection>

        <SpStickyHeader onOpenMenu={openMenu} />
        <HamburgerMenuSP open={menuOpen} onClose={closeMenu} onOpenModal={openModal} />
        <ReserveModal open={modalOpen} onClose={closeModal} isMobile />
      </>
    );
  }

  const height = total === 0 ? GRID_TOP + 220 : pcSectionHeight(shownCount, hasMore);
  return (
    <>
      <ScaledSection designWidth={DESIGN_PC} height={height}>
        <NewsListSection
          onOpenModal={openModal}
          height={height}
          visibleCount={visibleCount}
          hasMore={hasMore}
          onShowMore={showMore}
          animateFrom={animateFrom}
          items={list}
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
