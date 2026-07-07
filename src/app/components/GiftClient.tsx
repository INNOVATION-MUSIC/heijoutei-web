"use client";

import { useState } from "react";
import { useIsMobile } from "@/app/lib/useIsMobile";
import { GIFT_PRODUCTS, type GiftProduct } from "@/app/lib/giftData";
import ScaledSection from "./ScaledSection";
import ReserveModal from "./ReserveModal";
import StickyButton from "./StickyButton";
import Footer from "./Footer";

// PC
import GiftMainSection from "./gift/GiftMainSection";
import GiftCtaSection from "./gift/GiftCtaSection";
import GiftShippingSection from "./gift/GiftShippingSection";

// SP
import GiftSectionSP from "./sp/GiftSectionSP";
import FooterSP from "./sp/FooterSP";
import SpStickyHeader from "./sp/SpStickyHeader";
import HamburgerMenuSP from "./sp/HamburgerMenuSP";

const DESIGN_PC = 1440;
const DESIGN_SP = 390;
// SP 全高の初期推定（実測前の SSR/初回描画用。Figma 設計 5896 − フッター 973）
const SP_ESTIMATE = 4923;

// PC メインセクションの高さを商品数から算出する。
// 見出しまで801（=header153+paddingTop144+ヒーロー320+カードpaddingTop184）＋各カード（通常460/低い354）＋カード間gap60＋末尾133。
function pcMainHeight(products: GiftProduct[]): number {
  const cards = products.reduce((sum, p) => sum + (p.short ? 354 : 460), 0);
  const gaps = 60 * Math.max(0, products.length - 1);
  return 801 + cards + gaps + 133;
}

/**
 * /gift ギフト（ご進物）ページのクライアントラッパー。
 * useIsMobile で PC（1440）/ SP（390）を切り替える。データは lib/giftData.ts（PC/SP 共通の正本）。
 * SP は内容で高さが変わるため ResizeObserver で全高を実測してセクション高を確定する。
 * 予約モーダル・ハンバーガーは ScaledSection 外で一元管理。
 * products はサーバー（giftDb）から取得したギフト商品。未指定時は各セクションが静的データにフォールバック。
 */
export default function GiftClient({ products }: { products?: GiftProduct[] }) {
  const isMobile = useIsMobile();
  const [modalOpen, setModalOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [measured, setMeasured] = useState<number | null>(null);

  const openModal = () => setModalOpen(true);
  const closeModal = () => setModalOpen(false);
  const openMenu = () => setMenuOpen(true);
  const closeMenu = () => setMenuOpen(false);

  if (isMobile === null) {
    return <div style={{ minHeight: "100vh", background: "#0a0a0a" }} />;
  }

  if (isMobile) {
    const height = measured ?? SP_ESTIMATE;
    return (
      <>
        <ScaledSection designWidth={DESIGN_SP} height={height}>
          <GiftSectionSP products={products} onMeasured={(h) => setMeasured((p) => (p === h ? p : h))} />
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

  const mainHeight = pcMainHeight(products ?? GIFT_PRODUCTS);
  return (
    <>
      <ScaledSection designWidth={DESIGN_PC} height={mainHeight}>
        <GiftMainSection onOpenModal={openModal} products={products} height={mainHeight} />
      </ScaledSection>
      <ScaledSection designWidth={DESIGN_PC} height={332}>
        <GiftCtaSection />
      </ScaledSection>
      <ScaledSection designWidth={DESIGN_PC} height={988}>
        <GiftShippingSection />
      </ScaledSection>
      <ScaledSection designWidth={DESIGN_PC} height={600}>
        <Footer onOpenModal={openModal} />
      </ScaledSection>

      <ReserveModal open={modalOpen} onClose={closeModal} />
      <StickyButton />
    </>
  );
}
