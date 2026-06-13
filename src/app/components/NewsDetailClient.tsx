"use client";

import { useState } from "react";
import ScaledSection from "./ScaledSection";
import ReserveModal from "./ReserveModal";
import StickyButton from "./StickyButton";
import Footer from "./Footer";
import NewsDetailSection from "./NewsDetailSection";
import { newsBody, type NewsListItem } from "@/app/lib/newsData";

const DESIGN_PC = 1440;

// セクション縦寸（Figma「お知らせ詳細」161:287 準拠）
const HEADER = 153;     // PageHeader
const HERO_TOP = 134;   // ヘッダー下〜見出し行（500画像）上端
const HERO_H = 500;     // ヒーロー画像 = 見出し行の高さ
const BODY_TOP = 83;    // 見出し行下〜本文上端
const BODY_LH = 34;     // 本文 lineHeight
const IMG_TOP = 77;     // 本文下〜本文中画像上端
const IMG_H = 640;      // 本文中画像
const NAV_BLOCK = 100 + 44 + 47; // 前/次ナビ（paddingTop + 区切り線下余白 + 中身）
const TRAILING = 160;   // ナビ下〜Footer の余白

/** 本文以外の固定縦寸（本文画像を含む） */
function fixedHeight(article: NewsListItem) {
  const imgBlock = article.bodyImg ? IMG_TOP + IMG_H : 0;
  return HEADER + HERO_TOP + HERO_H + BODY_TOP + imgBlock + NAV_BLOCK + TRAILING;
}

/** 本文の初期推定高さ（実測前の SSR/初回描画用）。HTML はブロックタグ数、プレーンテキストは改行数で概算 */
function estimateBodyHeight(article: NewsListItem) {
  const body = newsBody(article);
  const lines = body.replace(/<[^>]+>/g, "\n").split("\n").filter((l) => l.trim()).length || 1;
  return lines * BODY_LH;
}

/**
 * /news/[id] お知らせ詳細ページのクライアントラッパー（PC のみ）。
 * SP はデザイン未確定のため未実装。SP 確定後は AboutClient 同様の matchMedia 分岐を追加する想定。
 * 予約モーダルは ScaledSection 外で一元管理。
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
  const [modalOpen, setModalOpen] = useState(false);
  const openModal = () => setModalOpen(true);
  const closeModal = () => setModalOpen(false);

  // 本文は実測（HTML は高さ可変）。実測前は推定値で描画し、マウント後に確定値へ更新。
  const [bodyHeight, setBodyHeight] = useState<number | null>(null);
  const height = fixedHeight(article) + (bodyHeight ?? estimateBodyHeight(article));

  return (
    <>
      <ScaledSection designWidth={DESIGN_PC} height={height}>
        <NewsDetailSection
          article={article}
          onOpenModal={openModal}
          height={height}
          prev={prev}
          next={next}
          onBodyMeasured={(h) => setBodyHeight((p) => (p === h ? p : h))}
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
