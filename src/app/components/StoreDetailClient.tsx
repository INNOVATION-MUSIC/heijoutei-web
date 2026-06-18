"use client";

import { useState } from "react";
import { useIsMobile } from "@/app/lib/useIsMobile";
import ScaledSection from "./ScaledSection";
import ReserveModal from "./ReserveModal";
import StickyButton from "./StickyButton";
import Footer from "./Footer";
import StoreDetailSection from "./StoreDetailSection";

// SP
import StoreDetailSectionSP from "./sp/StoreDetailSectionSP";
import FooterSP from "./sp/FooterSP";
import SpStickyHeader from "./sp/SpStickyHeader";
import HamburgerMenuSP from "./sp/HamburgerMenuSP";

import { type StoreDetail } from "@/app/lib/storeDetailData";

const DESIGN_PC = 1440;
const DESIGN_SP = 390;

// --- PC: セクション縦寸（Figma「店舗一覧（詳細）」162:879 準拠） ---
const HEADER = 153;
const HERO = 134 + 500 + 24 + 20; // ヒーロー帯 paddingTop + 写真高 + アロー行(gap24 + 高20)
const BUTTONS = 40 + 50; // ボタン行 paddingTop（アロー行分 84→40）+ ボタン高
const TABLE_TOP = 88; // テーブル上余白
const ROW_GAP = 36;
const MAP_TOP = 62; // テーブル → 地図 余白
const MAP_H = 500;
const TRAILING = 331; // 地図下端 → フッター開始（y2256）

/** PC: テーブルの全高（行の値の行数から算出）。 */
function tableHeight(store: StoreDetail) {
  const rows: number[] = [
    22, // 住所
    22, // 電話番号
    22, // アクセス
    store.hours.length * 32, // 営業時間
    22, // 定休日
  ];
  if (store.seats) rows.push(22); // お席
  const sum = rows.reduce((a, b) => a + b, 0);
  return sum + (rows.length - 1) * ROW_GAP;
}

/** PC: 店舗詳細セクションの全高を算出する（フッターは別 ScaledSection）。 */
function pcDetailHeight(store: StoreDetail) {
  return HEADER + HERO + BUTTONS + TABLE_TOP + tableHeight(store) + MAP_TOP + MAP_H + TRAILING;
}

// --- SP: ヘッダースペーサー(153)を除いたコンテンツの初期推定（実測前の初回描画用） ---
const SP_HEADER = 153;
const SP_NAME = 12 + 1 + 12 + 43; // EN + gap + 金線 + gap + 店名
const SP_PHOTO = 44 + 260 + 22 + 20; // paddingTop + 写真 + アロー(paddingTop + 高)
const SP_BUTTONS = 44 + 50 + 19 + 50; // paddingTop + 2行ボタン
const SP_TABLE_TOP = 56;
const SP_ROW_GAP = 28;
const SP_MAP = 36 + 300; // paddingTop + 地図
const SP_TRAILING = 149;
const SP_LINE_LH = 22; // テーブル値 1 行
const SP_DESC_LH = 30; // 説明文 1 行

/** SP: 折返しを概算してテーブル値の行数を見積もる（fontSize14・約24字/行） */
function spWrapLines(text: string) {
  return Math.max(1, Math.ceil(text.length / 24));
}

/** SP: テーブルの推定高さ */
function spTableHeight(store: StoreDetail) {
  const rows: number[] = [
    spWrapLines(store.address),
    1, // 電話番号
    spWrapLines(store.access),
    store.hours.reduce((n, l) => n + spWrapLines(l), 0),
    spWrapLines(store.closed),
  ];
  if (store.seats) rows.push(spWrapLines(store.seats));
  const sum = rows.reduce((a, b) => a + b, 0) * SP_LINE_LH;
  return sum + (rows.length - 1) * SP_ROW_GAP;
}

/** SP: コンテンツ（ヘッダースペーサー除く）の初期推定高さ */
function spContentHeight(store: StoreDetail) {
  const desc = store.desc ? 34 + store.desc.length * SP_DESC_LH : 0;
  return SP_NAME + desc + SP_PHOTO + SP_BUTTONS + SP_TABLE_TOP + spTableHeight(store) + SP_MAP + SP_TRAILING;
}

/**
 * /store/[id] 店舗詳細ページのクライアントラッパー。
 * useIsMobile で PC（1440）/ SP（390）を切り替える。データ層（store）は共通。
 * SP は説明/アクセス/営業時間などの折返しで高さ可変のため、実測してセクション全高を確定する。
 * 予約モーダル・ハンバーガーは ScaledSection 外で一元管理。
 */
export default function StoreDetailClient({ store }: { store: StoreDetail }) {
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
    const height = SP_HEADER + (measured ?? spContentHeight(store));
    return (
      <>
        <ScaledSection designWidth={DESIGN_SP} height={height}>
          <StoreDetailSectionSP
            store={store}
            height={height}
            onOpenModal={openModal}
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

  const height = pcDetailHeight(store);
  return (
    <>
      <ScaledSection designWidth={DESIGN_PC} height={height}>
        <StoreDetailSection store={store} onOpenModal={openModal} height={height} />
      </ScaledSection>
      <ScaledSection designWidth={DESIGN_PC} height={600}>
        <Footer onOpenModal={openModal} />
      </ScaledSection>

      <ReserveModal open={modalOpen} onClose={closeModal} />
      <StickyButton />
    </>
  );
}
