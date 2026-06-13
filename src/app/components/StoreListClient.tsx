"use client";

import { useState } from "react";
import ScaledSection from "./ScaledSection";
import ReserveModal from "./ReserveModal";
import StickyButton from "./StickyButton";

import StoreListSection from "./StoreListSection";
import Footer from "./Footer";
import type { StoreCardData } from "@/app/lib/storeListDb";

const DESIGN_PC = 1440;

// 店舗カードは可変件数。高さを件数から算出する（5件のとき Figma の y=3050 に一致）。
const CARD_H = 350; // カード高さ
const CARD_GAP = 60; // カード間ギャップ
const TOP_OFFSET = 803; // 先頭カード上端 y（ヘッダー＋StoreInfo見出し領域）
const BOTTOM_PAD = 257; // 最終カード下〜フッターまでの余白
const FALLBACK_COUNT = 5; // DB 未連携時の静的フォールバック件数

function storeHeight(count: number) {
  return TOP_OFFSET + count * CARD_H + (count - 1) * CARD_GAP + BOTTOM_PAD;
}

/**
 * /store 店舗一覧ページのクライアントラッパー。
 * SP はデザイン未確定のため、現状は PC レイアウト（1440 設計）を ScaledSection で表示する。
 * SP デザイン確定後に AboutClient と同様の PC/SP 分岐を追加する想定。
 * 予約モーダルは ScaledSection 外で一元管理。
 */
export default function StoreListClient({ stores }: { stores?: StoreCardData[] }) {
  const [modalOpen, setModalOpen] = useState(false);
  const openModal = () => setModalOpen(true);
  const closeModal = () => setModalOpen(false);

  const count = stores && stores.length > 0 ? stores.length : FALLBACK_COUNT;
  const storeSectionHeight = storeHeight(count);

  return (
    <>
      <ScaledSection designWidth={DESIGN_PC} height={storeSectionHeight}>
        <StoreListSection onOpenModal={openModal} height={storeSectionHeight} stores={stores} />
      </ScaledSection>
      <ScaledSection designWidth={DESIGN_PC} height={600}>
        <Footer onOpenModal={openModal} />
      </ScaledSection>

      <ReserveModal open={modalOpen} onClose={closeModal} />
      <StickyButton />
    </>
  );
}
