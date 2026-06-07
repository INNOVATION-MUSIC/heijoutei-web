"use client";

import { useState } from "react";
import ScaledSection from "./ScaledSection";
import ReserveModal from "./ReserveModal";
import StickyButton from "./StickyButton";

import NewsListSection from "./NewsListSection";
import Footer from "./Footer";
import { NEWS_LIST_DATA } from "@/app/lib/newsData";

const DESIGN_PC = 1440;

// 表示件数・グリッド寸法（NewsListSection と一致させる）
const PAGE_SIZE = 6;
const GRID_TOP = 828;   // 1段目カード上端 y
const CARD_H = 437;     // カード最大高（2行タイトル）
const ROW_GAP = 66;
const BTN_BLOCK = 140 + 50; // もっと見るボタン paddingTop + ボタン高
const TRAILING = 277;   // ボタン下〜セクション末尾の余白

/** 表示件数に応じたセクション高さを算出 */
function sectionHeight(visible: number, hasMore: boolean) {
  const rows = Math.ceil(visible / 3);
  const gridH = rows * CARD_H + (rows - 1) * ROW_GAP;
  return GRID_TOP + gridH + (hasMore ? BTN_BLOCK : 0) + TRAILING;
}

/**
 * /news お知らせ一覧ページのクライアントラッパー。
 * SP はデザイン未確定のため、現状は PC レイアウト（1440 設計）を ScaledSection で表示する。
 * SP デザイン確定後に AboutClient と同様の PC/SP 分岐を追加する想定。
 * 予約モーダルは ScaledSection 外で一元管理。
 */
export default function NewsListClient() {
  const [modalOpen, setModalOpen] = useState(false);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  // この index 以降のカードを出現アニメーション対象にする（初期表示分も再生）
  const [animateFrom, setAnimateFrom] = useState(0);

  const openModal = () => setModalOpen(true);
  const closeModal = () => setModalOpen(false);

  const total = NEWS_LIST_DATA.length;
  const hasMore = visibleCount < total;
  const showMore = () =>
    setVisibleCount((v) => {
      setAnimateFrom(v); // 今回新たに表示する分だけアニメーション
      return Math.min(v + PAGE_SIZE, total);
    });
  const height = sectionHeight(visibleCount, hasMore);

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
