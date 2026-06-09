"use client";

import { useState } from "react";
import ScaledSection from "./ScaledSection";
import ReserveModal from "./ReserveModal";
import StickyButton from "./StickyButton";
import Footer from "./Footer";
import MenuCourseSection from "./MenuCourseSection";
import { useStoreParam } from "./MenuShared";
import { getCourses } from "@/app/lib/menuData";

const DESIGN_PC = 1440;
const HEIGHT = 2060; // 見出し+店舗タブ+コースカード3枚+注記+一覧へ戻るボタン（余白を詰めた）

/**
 * /menu/course コースメニューのクライアントラッパー（PC のみ）。
 * 店舗（?store=）に応じてコース内容を切り替える。SP はデザイン未確定のため未実装。
 */
export default function MenuCourseClient() {
  const [modalOpen, setModalOpen] = useState(false);
  const openModal = () => setModalOpen(true);
  const closeModal = () => setModalOpen(false);

  const [storeId, setStore] = useStoreParam();
  const courses = getCourses(storeId);

  return (
    <>
      <ScaledSection designWidth={DESIGN_PC} height={HEIGHT}>
        <MenuCourseSection courses={courses} storeId={storeId} onSelectStore={setStore} onOpenModal={openModal} height={HEIGHT} />
      </ScaledSection>
      <ScaledSection designWidth={DESIGN_PC} height={600}>
        <Footer onOpenModal={openModal} />
      </ScaledSection>

      <ReserveModal open={modalOpen} onClose={closeModal} />
      <StickyButton />
    </>
  );
}
