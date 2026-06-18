"use client";

import { useState } from "react";
import { useIsMobile } from "@/app/lib/useIsMobile";
import ScaledSection from "./ScaledSection";
import ReserveModal from "./ReserveModal";
import StickyButton from "./StickyButton";
import Footer from "./Footer";
import RecruitListSection from "./RecruitListSection";
import { RECRUIT_JOBS, RECRUIT_STORE_TABS, type RecruitJob } from "@/app/lib/recruitData";

// SP
import RecruitListSectionSP from "./sp/RecruitListSectionSP";
import FooterSP from "./sp/FooterSP";
import SpStickyHeader from "./sp/SpStickyHeader";
import HamburgerMenuSP from "./sp/HamburgerMenuSP";

const DESIGN_PC = 1440;
const DESIGN_SP = 390;

// --- PC: セクション縦寸（Figma「採用情報1」2021:1059 準拠） ---
const CARDS_TOP = 957; // 1枚目カード上端 y
const CARD_H = 240;
const CARD_GAP = 40;
const TRAILING = 251; // 最終カード下〜Footer の余白
const EMPTY_H = 320; // 0件時の空状態パネル高

/** PC: 表示件数に応じたセクション高さを算出（0件時は空状態の高さ） */
function pcSectionHeight(n: number) {
  if (n === 0) return CARDS_TOP + EMPTY_H + TRAILING;
  return CARDS_TOP + n * CARD_H + (n - 1) * CARD_GAP + TRAILING;
}

// --- SP: ヘッダースペーサー(153)を除いたコンテンツの初期推定（実測前の初回描画用） ---
const SP_HEADER = 153;
const SP_HERO = 130;
const SP_HEADING = 73 + 94;
const SP_TABS = 56 + 50;
const SP_CARDS_TOP = 50;
const SP_CARD_GAP = 40;
const SP_CARDS_BOTTOM = 120;
const SP_CARD_PHOTO = 200;
const SP_TITLE_LH = 26;
const SP_SUMMARY_LH = 20;
const SP_EMPTY_H = 320;

/** SP: 1 カードの推定高さ（タイトル/説明の折返し行数を概算） */
function spEstimateCard(job: RecruitJob) {
  const titleLines = Math.max(1, Math.ceil(job.title.length / 16));
  const summaryLines = job.summary.reduce((n, s) => n + Math.max(1, Math.ceil(s.length / 26)), 0) || 1;
  // 写真200 + 内容（padding48 + 日付14 + 線10 + 1 + 11 + タイトル + タグ20 + 18 + 説明 + ボタン22+48）
  return SP_CARD_PHOTO + 48 + 14 + 10 + 1 + 11 + titleLines * SP_TITLE_LH + 14 + 20 + 18 + summaryLines * SP_SUMMARY_LH + 22 + 48;
}

/** SP: コンテンツ（ヘッダースペーサー除く）の初期推定高さ */
function spEstimateContent(jobs: RecruitJob[]) {
  const cardsArea =
    jobs.length === 0
      ? SP_EMPTY_H
      : jobs.reduce((sum, j) => sum + spEstimateCard(j), 0) + (jobs.length - 1) * SP_CARD_GAP;
  return SP_HERO + SP_HEADING + SP_TABS + SP_CARDS_TOP + cardsArea + SP_CARDS_BOTTOM;
}

/**
 * /recruit 採用情報一覧ページのクライアントラッパー。
 * useIsMobile で PC（1440）/ SP（390）を切り替える。データ層（jobs）は共通。
 * 店舗タブで求人を絞り込み、件数・本文量に応じてセクション高さを可変にする
 * （PC は件数ベース算出、SP は ResizeObserver 実測）。
 * 予約モーダル・ハンバーガーは ScaledSection 外で一元管理。
 */
export default function RecruitListClient({ allJobs, storeTabs }: { allJobs?: RecruitJob[]; storeTabs?: string[] }) {
  const source = allJobs ?? RECRUIT_JOBS;
  const tabs = storeTabs && storeTabs.length > 0 ? storeTabs : [...RECRUIT_STORE_TABS];
  const isMobile = useIsMobile();
  const [modalOpen, setModalOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<string>(tabs[0]);
  // SP: コンテンツ高さは実測。タブ切替で内容が変わるため切替時に null へ戻して再実測する。
  const [measured, setMeasured] = useState<number | null>(null);

  const openModal = () => setModalOpen(true);
  const closeModal = () => setModalOpen(false);
  const openMenu = () => setMenuOpen(true);
  const closeMenu = () => setMenuOpen(false);

  const selectTab = (tab: string) => {
    setActiveTab(tab);
    setMeasured(null);
  };

  const jobs = source.filter((j) => j.store === activeTab);

  if (isMobile === null) {
    return <div style={{ minHeight: "100vh", background: "#0a0a0a" }} />;
  }

  if (isMobile) {
    const height = SP_HEADER + (measured ?? spEstimateContent(jobs));
    return (
      <>
        <ScaledSection designWidth={DESIGN_SP} height={height}>
          <RecruitListSectionSP
            jobs={jobs}
            storeTabs={tabs}
            activeTab={activeTab}
            onSelectTab={selectTab}
            height={height}
            onMeasured={(h) => setMeasured((p) => (p === h ? p : h))}
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

  const height = pcSectionHeight(jobs.length);
  return (
    <>
      <ScaledSection designWidth={DESIGN_PC} height={height}>
        <RecruitListSection
          onOpenModal={openModal}
          height={height}
          jobs={jobs}
          storeTabs={tabs}
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          emptyHeight={EMPTY_H}
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
