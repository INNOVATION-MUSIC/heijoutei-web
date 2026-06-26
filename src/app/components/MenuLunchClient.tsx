"use client";

import { useState } from "react";
import { useIsMobile } from "@/app/lib/useIsMobile";
import ScaledSection from "./ScaledSection";
import ReserveModal from "./ReserveModal";
import StickyButton from "./StickyButton";
import Footer from "./Footer";
import MenuLunchSection from "./MenuLunchSection";
import { useStoreParam, type StoreTab } from "./MenuShared";
import { type MenuItem } from "@/app/lib/menuData";
import { type LunchGroup } from "@/app/lib/menuDb";

// SP
import MenuLunchSectionSP from "./sp/MenuLunchSectionSP";
import FooterSP from "./sp/FooterSP";
import SpStickyHeader from "./sp/SpStickyHeader";
import HamburgerMenuSP from "./sp/HamburgerMenuSP";

const DESIGN_PC = 1440;
const DESIGN_SP = 390;
const PC_HEIGHT_EST = 2000; // PC 初期推定（実測前）。見出し+店舗タブ〜項目グリッド+戻るボタン

// SP: ヘッダースペーサー(153)を除いたコンテンツの初期推定。
const SP_HEADER = 153;
const SP_HEAD_BLOCK = 130 + 73 + 94 + 60 + 49 + 89 + 52 + 20 + 13;
const SP_ITEM_H = 110;
const SP_ITEM_GAP = 20;

function spEstimateContent(itemCount: number) {
  const n = Math.max(1, itemCount);
  return SP_HEAD_BLOCK + 20 + n * SP_ITEM_H + (n - 1) * SP_ITEM_GAP + 80;
}

// アクティブ店舗のカテゴリ別グループを得る。DB 連動が無ければ単一グループにフォールバック。
function groupsForStore(
  storeId: string,
  lunchGroupsByStore?: Record<string, LunchGroup[]>,
  lunchByStore?: Record<string, MenuItem[]>,
): LunchGroup[] {
  const fromDb = lunchGroupsByStore?.[storeId];
  if (fromDb && fromDb.length > 0) return fromDb;
  return [{ slug: null, name: null, items: lunchByStore?.[storeId] ?? [] }];
}

/**
 * /menu/lunch ランチメニューのクライアントラッパー。
 * useIsMobile で PC（1440）/ SP（390）を切り替える。店舗（?store=）でメニュー内容を切替。
 * ランチカテゴリ（lunch_categories）があればサブタブで出し分ける（テイクアウト方式）。
 * カテゴリ数・品目説明の折返しで高さ可変のため PC/SP とも実測してセクション全高を確定する。
 */
export default function MenuLunchClient({
  lunchByStore,
  lunchGroupsByStore,
  stores,
}: {
  lunchByStore?: Record<string, MenuItem[]>;
  lunchGroupsByStore?: Record<string, LunchGroup[]>;
  stores?: StoreTab[];
}) {
  const isMobile = useIsMobile();
  const [modalOpen, setModalOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [measuredSp, setMeasuredSp] = useState<number | null>(null);
  const [measuredPc, setMeasuredPc] = useState<number | null>(null);
  const [catIdx, setCatIdx] = useState(0);

  const openModal = () => setModalOpen(true);
  const closeModal = () => setModalOpen(false);

  const [storeId, setStore] = useStoreParam(stores);
  const selectStore = (id: string) => {
    setStore(id);
    setCatIdx(0);
    setMeasuredSp(null);
    setMeasuredPc(null);
  };
  const selectCategory = (i: number) => {
    setCatIdx(i);
    setMeasuredSp(null);
    setMeasuredPc(null);
  };

  const groups = groupsForStore(storeId, lunchGroupsByStore, lunchByStore);
  const activeIdx = Math.min(catIdx, groups.length - 1);
  const items = groups[activeIdx]?.items ?? [];
  const categoryTabs = groups.length >= 2 ? groups.map((g) => g.name ?? "その他") : undefined;

  if (isMobile === null) {
    return <div style={{ minHeight: "100vh", background: "#0a0a0a" }} />;
  }

  if (isMobile) {
    const height = SP_HEADER + (measuredSp ?? spEstimateContent(items.length));
    return (
      <>
        <ScaledSection designWidth={DESIGN_SP} height={height}>
          <MenuLunchSectionSP
            items={items}
            storeId={storeId}
            stores={stores}
            onSelectStore={selectStore}
            categoryTabs={categoryTabs}
            activeCategory={activeIdx}
            onSelectCategory={selectCategory}
            height={height}
            onMeasured={(h) => setMeasuredSp((p) => (p === h ? p : h))}
          />
        </ScaledSection>
        <ScaledSection designWidth={DESIGN_SP} height={973}>
          <FooterSP onOpenModal={openModal} />
        </ScaledSection>

        <SpStickyHeader onOpenMenu={() => setMenuOpen(true)} />
        <HamburgerMenuSP open={menuOpen} onClose={() => setMenuOpen(false)} onOpenModal={openModal} />
        <ReserveModal open={modalOpen} onClose={closeModal} isMobile />
      </>
    );
  }

  const pcHeight = measuredPc ?? PC_HEIGHT_EST;
  return (
    <>
      <ScaledSection designWidth={DESIGN_PC} height={pcHeight}>
        <MenuLunchSection
          items={items}
          storeId={storeId}
          stores={stores}
          onSelectStore={selectStore}
          categoryTabs={categoryTabs}
          activeCategory={activeIdx}
          onSelectCategory={selectCategory}
          onOpenModal={openModal}
          height={pcHeight}
          onMeasured={(h) => setMeasuredPc((p) => (p === h ? p : h))}
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
