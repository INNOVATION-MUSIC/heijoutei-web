"use client";

import { useState } from "react";
import ScaledSection from "./ScaledSection";
import ReserveModal from "./ReserveModal";
import StickyButton from "./StickyButton";
import Footer from "./Footer";
import StoreDetailSection from "./StoreDetailSection";
import { type StoreDetail } from "@/app/lib/storeDetailData";

const DESIGN_PC = 1440;

// セクション縦寸（Figma「店舗一覧（詳細）」162:879 準拠）
const HEADER = 153;
const HERO = 134 + 500 + 24 + 20; // ヒーロー帯 paddingTop + 写真高 + アロー行(gap24 + 高20)
const BUTTONS = 40 + 50; // ボタン行 paddingTop（アロー行分 84→40）+ ボタン高
const TABLE_TOP = 88; // テーブル上余白
const ROW_GAP = 36;
const MAP_TOP = 62; // テーブル → 地図 余白
const MAP_H = 500;
const TRAILING = 331; // 地図下端 → フッター開始（y2256）

/** テーブルの全高（行の値の行数から算出）。 */
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

/** 店舗詳細セクションの全高を算出する（フッターは別 ScaledSection）。 */
function detailHeight(store: StoreDetail) {
  return HEADER + HERO + BUTTONS + TABLE_TOP + tableHeight(store) + MAP_TOP + MAP_H + TRAILING;
}

/**
 * /store/[id] 店舗詳細ページのクライアントラッパー（PC のみ）。
 * SP はデザイン未確定のため未実装（PC 設計 1440 を ScaledSection で縮小表示）。
 * 予約モーダルは ScaledSection 外で一元管理。
 */
export default function StoreDetailClient({ store }: { store: StoreDetail }) {
  const [modalOpen, setModalOpen] = useState(false);
  const openModal = () => setModalOpen(true);
  const closeModal = () => setModalOpen(false);

  const height = detailHeight(store);

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
