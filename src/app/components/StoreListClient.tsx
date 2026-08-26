"use client";

import { useState } from "react";
import { useIsMobile } from "@/app/lib/useIsMobile";
import ScaledSection from "./ScaledSection";
import ReserveModal from "./ReserveModal";
import StickyButton from "./StickyButton";

import StoreListSection, { STORES } from "./StoreListSection";
import Footer from "./Footer";

// SP
import StoreListSectionSP from "./sp/StoreListSectionSP";
import FooterSP from "./sp/FooterSP";
import SpStickyHeader from "./sp/SpStickyHeader";
import HamburgerMenuSP from "./sp/HamburgerMenuSP";

import type { StoreCardData } from "@/app/lib/storeListDb";

const DESIGN_PC = 1440;
const DESIGN_SP = 390;

// --- PC: 店舗カードは可変件数。高さを件数から算出する ---
// カード高さ。Figma初期値は350だが、実データの住所・営業時間等が長い店舗（亀岡など）で
// 詳細ボタンが下にはみ出すため400に拡張（2026-08-26）。StoreListSectionのStoreCardと一致させる。
const CARD_H = 400;
const CARD_GAP = 60; // カード間ギャップ
const TOP_OFFSET = 803; // 先頭カード上端 y（ヘッダー＋StoreInfo見出し領域）
const BOTTOM_PAD = 257; // 最終カード下〜フッターまでの余白
const FALLBACK_COUNT = 5; // DB 未連携時の静的フォールバック件数

function pcStoreHeight(count: number) {
  return TOP_OFFSET + count * CARD_H + (count - 1) * CARD_GAP + BOTTOM_PAD;
}

// --- SP: ヘッダースペーサー(153)を除いたコンテンツの初期推定（実測前の初回描画用） ---
const SP_HEADER = 153;
const SP_HERO = 130;          // ヒーロー画像
const SP_HEADING = 73 + 94;   // ヒーロー下の見出しブロック（gap + 縦書きラベル/StoreInfo）
const SP_LIST_TOP = 63;       // 見出し〜カード上余白
const SP_CARD_GAP = 40;       // カード間ギャップ
const SP_LIST_BOTTOM = 149;   // 最終カード下〜末尾の余白
const SP_CARD_BASE = 661;     // 営業時間以外のカード縦寸（写真320 + 情報 + 店舗詳細ボタン70）
const SP_HOUR_LH = 22;        // 営業時間 1 行の高さ

/** SP: 1 カードの推定高さ（営業時間の折返し行数を概算） */
function spEstimateCard(store: StoreCardData) {
  const hourLines = store.hours.reduce((n, line) => n + Math.max(1, Math.ceil(line.length / 24)), 0) || 1;
  return SP_CARD_BASE + hourLines * SP_HOUR_LH;
}

/** SP: コンテンツ（ヘッダースペーサー除く）の初期推定高さ */
function spEstimateContent(stores: StoreCardData[]) {
  const cards = stores.reduce((sum, s) => sum + spEstimateCard(s), 0) + Math.max(0, stores.length - 1) * SP_CARD_GAP;
  return SP_HERO + SP_HEADING + SP_LIST_TOP + cards + SP_LIST_BOTTOM;
}

/**
 * /store 店舗一覧ページのクライアントラッパー。
 * useIsMobile で PC（1440）/ SP（390）を切り替える。データ層（stores）は共通。
 * SP はカードが住所/営業時間の折返しで高さ可変のため、実測してセクション全高を確定する。
 * 予約モーダル・ハンバーガーは ScaledSection 外で一元管理。
 */
export default function StoreListClient({ stores }: { stores?: StoreCardData[] }) {
  const list = stores && stores.length > 0 ? stores : STORES;
  const isMobile = useIsMobile();
  const [modalOpen, setModalOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  // SP: コンテンツ高さは実測。実測前は推定値で描画し、マウント後に確定値へ更新。
  const [measured, setMeasured] = useState<number | null>(null);

  const openModal = () => setModalOpen(true);
  const closeModal = () => setModalOpen(false);
  const openMenu = () => setMenuOpen(true);
  const closeMenu = () => setMenuOpen(false);

  if (isMobile === null) {
    return <div style={{ minHeight: "100vh", background: "#0a0a0a" }} />;
  }

  if (isMobile) {
    const height = SP_HEADER + (measured ?? spEstimateContent(list));
    return (
      <>
        <ScaledSection designWidth={DESIGN_SP} height={height}>
          <StoreListSectionSP
            stores={list}
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

  const count = stores && stores.length > 0 ? stores.length : FALLBACK_COUNT;
  const storeSectionHeight = pcStoreHeight(count);
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
