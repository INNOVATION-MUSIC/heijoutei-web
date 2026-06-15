"use client";

import { useState } from "react";
import ScaledSection from "./ScaledSection";
import ReserveModal from "./ReserveModal";
import StickyButton from "./StickyButton";
import Footer from "./Footer";
import MenuDetailSection from "./MenuDetailSection";
import { useStoreParam, type StoreTab } from "./MenuShared";
import { getMenuCategory, type MenuCategory } from "@/app/lib/menuData";

const DESIGN_PC = 1440;

const GRID_TOP = 1307; // セクション上端〜項目グリッド上端
const TRAILING = 265; // グリッド下端〜フッター開始

/** 詳細セクションの全高を項目数（行数）から算出する。 */
function detailHeight(itemCount: number) {
  const rows = Math.max(1, Math.ceil(itemCount / 3));
  const gridHeight = rows * 200 + (rows - 1) * 40;
  return GRID_TOP + gridHeight + TRAILING;
}

/**
 * /menu/[category] 詳細ページのクライアントラッパー（PC のみ）。
 * SP はデザイン未確定のため未実装（PC 設計 1440 を ScaledSection で縮小表示）。
 * カテゴリ・店舗の選択をここで一元管理し、どちらの切替でも品目（と高さ）を再計算する。
 */
export default function MenuDetailClient({ category, allCategories, stores }: { category: MenuCategory; allCategories?: MenuCategory[]; stores?: StoreTab[] }) {
  const [modalOpen, setModalOpen] = useState(false);
  const openModal = () => setModalOpen(true);
  const closeModal = () => setModalOpen(false);

  // カテゴリ切替はリロードせず state で行い、URL は history.replaceState で同期する
  // （スクロール位置を保ったまま中身だけ差し替え／リフレッシュ・共有でも整合）。
  const [activeSlug, setActiveSlug] = useState(category.slug);
  // 店舗選択は ?store= を真実の値として URL 駆動で保持（初回マウント時の URL 復元も内包）。
  const [storeId, selectStore] = useStoreParam(stores);

  const cat = allCategories?.find((c) => c.slug === activeSlug) ?? getMenuCategory(activeSlug) ?? category;
  // 店舗別メニュー。店舗ごとに登録のあるカテゴリ（itemsByStore にキーあり）は、選択店舗に
  // 登録が無ければ空＝「お取り扱いなし」表示にする（既定店舗へのフォールバックはしない）。
  // itemsByStore を持たない純静的カテゴリ（DB空時のフォールバック）は従来どおり items を使う。
  const hasPerStore = !!cat.itemsByStore && Object.keys(cat.itemsByStore).length > 0;
  const items = cat.itemsByStore?.[storeId] ?? (hasPerStore ? [] : cat.items);
  const height = detailHeight(items.length);

  // カテゴリ切替：パスのみ更新（?store= は維持）
  const selectCategory = (slug: string) => {
    setActiveSlug(slug);
    const url = new URL(window.location.href);
    url.pathname = `/menu/${slug}`;
    window.history.replaceState({}, "", url);
  };

  // 店舗切替（selectStore）は useStoreParam が ?store= 更新＋再描画を担う（現在のカテゴリは維持）。

  return (
    <>
      <ScaledSection designWidth={DESIGN_PC} height={height}>
        <MenuDetailSection
          category={cat}
          categories={allCategories}
          items={items}
          storeId={storeId}
          stores={stores}
          height={height}
          onOpenModal={openModal}
          onSelectCategory={selectCategory}
          onSelectStore={selectStore}
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
