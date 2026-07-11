"use client";

import { useState } from "react";
import { useIsMobile } from "@/app/lib/useIsMobile";
import ScaledSection from "./ScaledSection";
import ReserveModal from "./ReserveModal";
import StickyButton from "./StickyButton";
import Footer from "./Footer";
import MenuTakeoutSection from "./MenuTakeoutSection";
import { useStoreParam, type StoreTab } from "./MenuShared";
import { getTakeoutTabs, TAKEOUT_MENU_TABS, type TakeoutMenuTab } from "@/app/lib/menuData";

// SP
import MenuTakeoutSectionSP from "./sp/MenuTakeoutSectionSP";
import FooterSP from "./sp/FooterSP";
import SpStickyHeader from "./sp/SpStickyHeader";
import HamburgerMenuSP from "./sp/HamburgerMenuSP";

const DESIGN_PC = 1440;
const DESIGN_SP = 390;

const GRID_TOP = 1216; // セクション上端〜項目グリッド上端
const AFTER = 50 + 206 + 80 + 500 + 194; // 注記gap + 注記 + 余白 + CTA帯 + 戻るボタン

/** PC: カテゴリの項目数（行数）からセクション全高を算出する。 */
function takeoutHeight(itemCount: number) {
  const rows = Math.max(1, Math.ceil(itemCount / 3));
  const gridHeight = rows * 200 + (rows - 1) * 40;
  return GRID_TOP + gridHeight + AFTER;
}

// SP: ヘッダースペーサー(153)を除いたコンテンツの初期推定（実測前の初回描画用）。
const SP_HEADER = 153;
const SP_HEAD_BLOCK = 130 + 73 + 94 + 60 + 49 + 89 + 52 + 30 + 49 + 20 + 13; // ヒーロー〜サブタブ〜税込注記
const SP_ITEM_H = 150;
const SP_ITEM_GAP = 20;
const SP_AFTER = 50 + 420 + 60 + 663; // 注記パネル + CTA帯

function spEstimateContent(itemCount: number) {
  const n = Math.max(1, itemCount);
  return SP_HEAD_BLOCK + 20 + n * SP_ITEM_H + (n - 1) * SP_ITEM_GAP + SP_AFTER;
}

/**
 * /menu/takeout テイクアウトメニューのクライアントラッパー。
 * useIsMobile で PC（1440）/ SP（390）を切り替える。店舗（?store=）でメニュー内容を切替、
 * カテゴリタブの切替はリロードせず state で行う。
 * SP は品目/CTA の折返しで高さ可変のため実測してセクション全高を確定する。
 */
export default function MenuTakeoutClient({ tabsByStore, stores }: { tabsByStore?: Record<string, TakeoutMenuTab[]>; stores?: StoreTab[] }) {
  const isMobile = useIsMobile();
  const [modalOpen, setModalOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [measured, setMeasured] = useState<number | null>(null);

  const openModal = () => setModalOpen(true);
  const closeModal = () => setModalOpen(false);

  // テイクアウトの取扱いがある店舗（DBに品目がある店舗）だけを店舗タブに出す。
  // useStoreParam に渡すと readStoreParam が未取扱い店舗の ?store= を既定（先頭の取扱い店舗）へ
  // 丸めるため、直リンクでも未取扱い店舗の空画面／クラッシュにならない。
  const takeoutStores = (stores ?? []).filter((s) => (tabsByStore?.[s.id]?.length ?? 0) > 0);
  const storeTabs = takeoutStores.length > 0 ? takeoutStores : stores;

  const [storeId, setStore] = useStoreParam(storeTabs);
  const [activeSlug, setActiveSlug] = useState(TAKEOUT_MENU_TABS[0].slug);

  // 上のフィルタで storeId は取扱い店舗に限定されるが、念のため空配列でも落ちないよう length で判定。
  const dbTabs = tabsByStore?.[storeId];
  const tabs = dbTabs && dbTabs.length > 0 ? dbTabs : getTakeoutTabs(storeId);
  const tab = tabs.find((t) => t.slug === activeSlug) ?? tabs[0];

  const selectTab = (slug: string) => {
    setActiveSlug(slug);
    setMeasured(null);
  };

  if (isMobile === null) {
    return <div style={{ minHeight: "100vh", background: "#0a0a0a" }} />;
  }

  if (isMobile) {
    const height = SP_HEADER + (measured ?? spEstimateContent(tab.items.length));
    return (
      <>
        <ScaledSection designWidth={DESIGN_SP} height={height}>
          <MenuTakeoutSectionSP
            tabs={tabs}
            activeSlug={tab.slug}
            items={tab.items}
            storeId={storeId}
            stores={storeTabs}
            onSelectTab={selectTab}
            onSelectStore={setStore}
            height={height}
            onMeasured={(h) => setMeasured((p) => (p === h ? p : h))}
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

  const height = takeoutHeight(tab.items.length);
  return (
    <>
      <ScaledSection designWidth={DESIGN_PC} height={height}>
        <MenuTakeoutSection
          tabs={tabs}
          activeSlug={tab.slug}
          items={tab.items}
          storeId={storeId}
          stores={storeTabs}
          onSelectTab={setActiveSlug}
          onSelectStore={setStore}
          onOpenModal={openModal}
          height={height}
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
