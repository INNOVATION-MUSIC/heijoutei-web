"use client";

import { useEffect, useState } from "react";
import ScaledSection from "./ScaledSection";
import ReserveModal from "./ReserveModal";
import StickyButton from "./StickyButton";
import Footer from "./Footer";
import MenuDetailSection from "./MenuDetailSection";
import { getMenuCategory, getMenuItems, MENU_STORES, type MenuCategory } from "@/app/lib/menuData";

const DESIGN_PC = 1440;
const DEFAULT_STORE = MENU_STORES[0].id;

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
export default function MenuDetailClient({ category, allCategories }: { category: MenuCategory; allCategories?: MenuCategory[] }) {
  const [modalOpen, setModalOpen] = useState(false);
  const openModal = () => setModalOpen(true);
  const closeModal = () => setModalOpen(false);

  // カテゴリ・店舗の切替はリロードせず state で行い、URL は history.replaceState で同期する
  // （スクロール位置を保ったまま中身だけ差し替え／リフレッシュ・共有でも整合）。
  const [activeSlug, setActiveSlug] = useState(category.slug);
  const [storeId, setStoreId] = useState<string>(DEFAULT_STORE);

  // 初回マウント時に URL の ?store= から選択店舗を復元する。
  useEffect(() => {
    const p = new URLSearchParams(window.location.search).get("store");
    if (p && MENU_STORES.some((s) => s.id === p)) setStoreId(p);
  }, []);

  const cat = allCategories?.find((c) => c.slug === activeSlug) ?? getMenuCategory(activeSlug) ?? category;
  const items = getMenuItems(cat, storeId); // 店舗別メニュー（無ければ既定にフォールバック）
  const height = detailHeight(items.length);

  // カテゴリ切替：パスのみ更新（?store= は維持）
  const selectCategory = (slug: string) => {
    setActiveSlug(slug);
    const url = new URL(window.location.href);
    url.pathname = `/menu/${slug}`;
    window.history.replaceState({}, "", url);
  };

  // 店舗切替：?store= のみ更新（現在のカテゴリは維持）。同じカテゴリのその店舗のメニューに切り替わる。
  const selectStore = (id: string) => {
    setStoreId(id);
    const url = new URL(window.location.href);
    if (id === DEFAULT_STORE) url.searchParams.delete("store");
    else url.searchParams.set("store", id);
    window.history.replaceState({}, "", url);
  };

  return (
    <>
      <ScaledSection designWidth={DESIGN_PC} height={height}>
        <MenuDetailSection
          category={cat}
          items={items}
          storeId={storeId}
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
