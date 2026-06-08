"use client";

import { useState } from "react";
import ScaledSection from "./ScaledSection";
import ReserveModal from "./ReserveModal";
import StickyButton from "./StickyButton";
import Footer from "./Footer";
import RecruitDetailSection from "./RecruitDetailSection";
import { type RecruitJob } from "@/app/lib/recruitData";

const DESIGN_PC = 1440;

// セクション縦寸（Figma「採用情報2」2021:1354 準拠）
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

/** 本文量から詳細セクションの全高を算出する */
function detailHeight(job: RecruitJob) {
  const leadH = countLines(job.lead, LEAD_CPL) * LEAD_LH;
  const rowsH = job.detail.reduce((sum, row) => sum + ROW_PAD + Math.max(1, countLines(row.value, VAL_CPL)) * ROW_LH, 0);
  return HEADER + BAND + LEAD_TOP + leadH + TABLE_TOP + rowsH + APP_TOP + APP_H + TRAILING;
}

/**
 * /recruit/[id] 採用情報詳細ページのクライアントラッパー（PC のみ）。
 * SP はデザイン未確定のため未実装。予約モーダルは ScaledSection 外で一元管理。
 */
export default function RecruitDetailClient({ job }: { job: RecruitJob }) {
  const [modalOpen, setModalOpen] = useState(false);
  const openModal = () => setModalOpen(true);
  const closeModal = () => setModalOpen(false);

  const height = detailHeight(job);

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
