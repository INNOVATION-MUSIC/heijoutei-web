"use client";

import { useState } from "react";
import { useIsMobile } from "@/app/lib/useIsMobile";
import ScaledSection from "./ScaledSection";
import ReserveModal from "./ReserveModal";
import StickyButton from "./StickyButton";
import Footer from "./Footer";
import RecruitDetailSection from "./RecruitDetailSection";
import { type RecruitJob } from "@/app/lib/recruitData";

// SP
import RecruitDetailSectionSP from "./sp/RecruitDetailSectionSP";
import FooterSP from "./sp/FooterSP";
import SpStickyHeader from "./sp/SpStickyHeader";
import HamburgerMenuSP from "./sp/HamburgerMenuSP";

const DESIGN_PC = 1440;
const DESIGN_SP = 390;

// --- PC: セクション縦寸（Figma「採用情報2」2021:1354 準拠） ---
const HEADER = 153;
const BAND = 134 + 500; // 見出し帯 paddingTop + ヒーロー高
const LEAD_TOP = 60;
const LEAD_LH = 34;
const TABLE_TOP = 62 + 49; // テーブル上余白 + 先頭行までの内側余白
const ROW_PAD = 22 * 2; // 行の上下 padding
const ROW_LH = 26;
const APP_TOP = 53;
const APP_H = 482;
const TRAILING = 90;

// 折り返し見込みの 1 行あたり文字数（実幅より少なめ＝行数を多めに見積もり、はみ出しを防ぐ）
const LEAD_CPL = 54; // 導入文（幅 1120・実測 ≈60）
const VAL_CPL = 46; // テーブル値（幅 769・実測 ≈51）

/** 改行と折り返しから行数を見積もる */
function countLines(text: string, cpl: number) {
  return text.split("\n").reduce((n, seg) => n + Math.max(1, Math.ceil(seg.length / cpl)), 0);
}

/** PC: 本文量から詳細セクションの全高を算出する */
function pcDetailHeight(job: RecruitJob) {
  const leadH = countLines(job.lead, LEAD_CPL) * LEAD_LH;
  const rowsH = job.detail.reduce((sum, row) => sum + ROW_PAD + Math.max(1, countLines(row.value, VAL_CPL)) * ROW_LH, 0);
  return HEADER + BAND + LEAD_TOP + leadH + TABLE_TOP + rowsH + APP_TOP + APP_H + TRAILING;
}

// --- SP: ヘッダースペーサー(153)を除いたコンテンツの初期推定（実測前の初回描画用） ---
const SP_HEADER = 153;
const SP_HERO = 300;
const SP_TITLE_TOP = 28;
const SP_TITLE_LH = 32;
const SP_TAG_TOP = 18 + 20;
const SP_LEAD_TOP = 30;
const SP_LEAD_LH = 28;
const SP_TABLE_TOP = 40;
const SP_ROW_PAD = 22 * 2 + 1; // 行の上下 padding + 区切り線
const SP_ROW_LH = 24;
const SP_APP_TOP = 50;
const SP_APP_H = 470; // 応募方法カードのおおよその高さ
const SP_BOTTOM = 60;
const SP_TITLE_CPL = 16;
const SP_LEAD_CPL = 22;
const SP_VAL_CPL = 18;

/** SP: 本文量から詳細セクションの全高を算出する（実測前の初回描画用） */
function spEstimateContent(job: RecruitJob) {
  const titleH = Math.max(1, countLines(job.title, SP_TITLE_CPL)) * SP_TITLE_LH;
  const leadH = countLines(job.lead, SP_LEAD_CPL) * SP_LEAD_LH;
  const rowsH = job.detail.reduce(
    (sum, row) => sum + SP_ROW_PAD + Math.max(countLines(row.label, 4), countLines(row.value, SP_VAL_CPL)) * SP_ROW_LH,
    0,
  );
  return SP_HERO + SP_TITLE_TOP + titleH + SP_TAG_TOP + SP_LEAD_TOP + leadH + SP_TABLE_TOP + rowsH + SP_APP_TOP + SP_APP_H + SP_BOTTOM;
}

/**
 * /recruit/[id] 採用情報詳細ページのクライアントラッパー。
 * useIsMobile で PC（1440）/ SP（390）を切り替える。データ層（job）は共通。
 * PC は本文量から高さを算出、SP は ResizeObserver で実測してセクション全高を確定する。
 * 予約モーダル・ハンバーガーは ScaledSection 外で一元管理。
 */
export default function RecruitDetailClient({ job }: { job: RecruitJob }) {
  const isMobile = useIsMobile();
  const [modalOpen, setModalOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [measured, setMeasured] = useState<number | null>(null);

  const openModal = () => setModalOpen(true);
  const closeModal = () => setModalOpen(false);
  const openMenu = () => setMenuOpen(true);
  const closeMenu = () => setMenuOpen(false);

  if (isMobile === null) {
    return <div style={{ minHeight: "100vh", background: "#0a0a0a" }} />;
  }

  if (isMobile) {
    const height = SP_HEADER + (measured ?? spEstimateContent(job));
    return (
      <>
        <ScaledSection designWidth={DESIGN_SP} height={height}>
          <RecruitDetailSectionSP
            job={job}
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

  const height = pcDetailHeight(job);
  return (
    <>
      <ScaledSection designWidth={DESIGN_PC} height={height}>
        <RecruitDetailSection job={job} onOpenModal={openModal} height={height} />
      </ScaledSection>
      <ScaledSection designWidth={DESIGN_PC} height={600}>
        <Footer onOpenModal={openModal} />
      </ScaledSection>

      <ReserveModal open={modalOpen} onClose={closeModal} />
      <StickyButton />
    </>
  );
}
