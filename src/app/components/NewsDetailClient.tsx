"use client";

import { useState } from "react";
import { useIsMobile } from "@/app/lib/useIsMobile";
import ScaledSection from "./ScaledSection";
import ReserveModal from "./ReserveModal";
import StickyButton from "./StickyButton";
import Footer from "./Footer";
import NewsDetailSection from "./NewsDetailSection";

// SP
import NewsDetailSectionSP from "./sp/NewsDetailSectionSP";
import FooterSP from "./sp/FooterSP";
import SpStickyHeader from "./sp/SpStickyHeader";
import HamburgerMenuSP from "./sp/HamburgerMenuSP";

import { newsBody, type NewsListItem } from "@/app/lib/newsData";

const DESIGN_PC = 1440;
const DESIGN_SP = 390;

// --- PC: セクション縦寸（Figma「お知らせ詳細」161:287 準拠） ---
const HEADER = 153;     // PageHeader
const HERO_TOP = 134;   // ヘッダー下〜見出し行（500画像）上端
const HERO_H = 500;     // ヒーロー画像 = 見出し行の高さ
const BODY_TOP = 83;    // 見出し行下〜本文上端
const BODY_LH = 34;     // 本文 lineHeight
const IMG_TOP = 77;     // 本文下〜本文中画像上端
const IMG_H = 640;      // 本文中画像
const NAV_BLOCK = 100 + 44 + 47; // 前/次ナビ（paddingTop + 区切り線下余白 + 中身）
const TRAILING = 160;   // ナビ下〜Footer の余白

/** PC: 本文以外の固定縦寸（本文画像を含む） */
function pcFixedHeight(article: NewsListItem) {
  const imgBlock = article.bodyImg ? IMG_TOP + IMG_H : 0;
  return HEADER + HERO_TOP + HERO_H + BODY_TOP + imgBlock + NAV_BLOCK + TRAILING;
}

/** PC: 本文の初期推定高さ（実測前の SSR/初回描画用） */
function pcEstimateBodyHeight(article: NewsListItem) {
  const body = newsBody(article);
  const lines = body.replace(/<[^>]+>/g, "\n").split("\n").filter((l) => l.trim()).length || 1;
  return lines * BODY_LH;
}

// --- SP: セクション縦寸（Figma「お知らせ詳細_sp」2135:621 準拠） ---
const SP_HEADER = 153;        // SpStickyHeader 分のスペーサー
const SP_HERO_H = 300;        // ヒーロー画像（350×300）
const SP_BODY_LH = 30;        // 本文 lineHeight
const SP_IMG_BLOCK = 36 + 300; // 本文中画像（paddingTop + 画像高）
const SP_TRAILING = 150;      // 末尾〜Footer の余白

/** SP: タイトル+日付+本文ブロック以外の固定縦寸 */
function spFixedHeight(article: NewsListItem) {
  return SP_HEADER + SP_HERO_H + (article.bodyImg ? SP_IMG_BLOCK : 0) + SP_TRAILING;
}

/** SP: タイトル+日付+本文ブロックの初期推定高さ（実測前の SSR/初回描画用） */
function spEstimateTextHeight(article: NewsListItem) {
  const body = newsBody(article);
  const bodyLines = body.replace(/<[^>]+>/g, "\n").split("\n").filter((l) => l.trim()).length || 1;
  const titleLines = Math.max(1, Math.ceil(article.title.length / 16));
  // paddingTop28 + タイトル(29/行) + 日付行(20+20) + 本文paddingTop46 + 本文
  return 28 + titleLines * 29 + 40 + 46 + bodyLines * SP_BODY_LH;
}

/**
 * /news/[id] お知らせ詳細ページのクライアントラッパー。
 * useIsMobile で PC（1440）/ SP（390）を切り替える。データ層（article/prev/next）は共通。
 * 本文は高さ可変のため、表示中のレイアウトで実測してセクション全高を確定する。
 * 予約モーダル・ハンバーガーは ScaledSection 外で一元管理。
 */
type NavItem = { id: string; title: string } | null;

export default function NewsDetailClient({
  article,
  prev = null,
  next = null,
}: {
  article: NewsListItem;
  prev?: NavItem;
  next?: NavItem;
}) {
  const isMobile = useIsMobile();
  const [modalOpen, setModalOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const openModal = () => setModalOpen(true);
  const closeModal = () => setModalOpen(false);
  const openMenu = () => setMenuOpen(true);
  const closeMenu = () => setMenuOpen(false);

  // 本文（PC）/ タイトル+本文（SP）は実測。実測前は推定値で描画し、マウント後に確定値へ更新。
  const [measured, setMeasured] = useState<number | null>(null);

  if (isMobile === null) {
    return <div style={{ minHeight: "100vh", background: "#0a0a0a" }} />;
  }

  if (isMobile) {
    const height = spFixedHeight(article) + (measured ?? spEstimateTextHeight(article));
    return (
      <>
        <ScaledSection designWidth={DESIGN_SP} height={height}>
          <NewsDetailSectionSP
            article={article}
            height={height}
            onBodyMeasured={(h) => setMeasured((p) => (p === h ? p : h))}
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

  const height = pcFixedHeight(article) + (measured ?? pcEstimateBodyHeight(article));
  return (
    <>
      <ScaledSection designWidth={DESIGN_PC} height={height}>
        <NewsDetailSection
          article={article}
          onOpenModal={openModal}
          height={height}
          prev={prev}
          next={next}
          onBodyMeasured={(h) => setMeasured((p) => (p === h ? p : h))}
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
