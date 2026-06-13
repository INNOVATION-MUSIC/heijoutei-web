"use client";

import { useState } from "react";
import ScaledSection from "./ScaledSection";
import ReserveModal from "./ReserveModal";
import StickyButton from "./StickyButton";
import Footer from "./Footer";
import RecruitListSection from "./RecruitListSection";
import { RECRUIT_JOBS, RECRUIT_STORE_TABS, type RecruitJob } from "@/app/lib/recruitData";

const DESIGN_PC = 1440;

// セクション縦寸（Figma「採用情報1」2021:1059 準拠）
const CARDS_TOP = 957; // 1枚目カード上端 y
const CARD_H = 240;
const CARD_GAP = 40;
const TRAILING = 251; // 最終カード下〜Footer の余白
const EMPTY_H = 320; // 0件時の空状態パネル高

/** 表示件数に応じたセクション高さを算出（0件時は空状態の高さ） */
function sectionHeight(n: number) {
  if (n === 0) return CARDS_TOP + EMPTY_H + TRAILING;
  return CARDS_TOP + n * CARD_H + (n - 1) * CARD_GAP + TRAILING;
}

/**
 * /recruit 採用情報一覧ページのクライアントラッパー（PC のみ）。
 * 店舗タブで求人を絞り込み、件数に応じてセクション高さを可変にする。
 * SP はデザイン未確定のため未実装。予約モーダルは ScaledSection 外で一元管理。
 */
export default function RecruitListClient({ allJobs, storeTabs }: { allJobs?: RecruitJob[]; storeTabs?: string[] }) {
  const source = allJobs ?? RECRUIT_JOBS;
  const tabs = storeTabs && storeTabs.length > 0 ? storeTabs : [...RECRUIT_STORE_TABS];
  const [modalOpen, setModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<string>(tabs[0]);

  const openModal = () => setModalOpen(true);
  const closeModal = () => setModalOpen(false);

  const jobs = source.filter((j) => j.store === activeTab);
  const height = sectionHeight(jobs.length);

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
