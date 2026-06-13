"use client";

import { useState } from "react";
import ScaledSection from "./ScaledSection";
import ReserveModal from "./ReserveModal";
import StickyButton from "./StickyButton";
import Footer from "./Footer";
import MenuCourseSection from "./MenuCourseSection";
import { useStoreParam, type StoreTab } from "./MenuShared";
import { getCourses, type CourseItem } from "@/app/lib/menuData";

const DESIGN_PC = 1440;
const HEIGHT = 2060; // 見出し+店舗タブ+コースカード3枚+注記+一覧へ戻るボタン（余白を詰めた）

/**
 * /menu/course コースメニューのクライアントラッパー（PC のみ）。
 * 店舗（?store=）に応じてコース内容を切り替える。SP はデザイン未確定のため未実装。
 * coursesByStore（DB 由来）が渡された場合はそれを優先し、無ければ静的データにフォールバック。
 */
export default function MenuCourseClient({ coursesByStore, stores }: { coursesByStore?: Record<string, CourseItem[]>; stores?: StoreTab[] }) {
  const [modalOpen, setModalOpen] = useState(false);
  const openModal = () => setModalOpen(true);
  const closeModal = () => setModalOpen(false);

  const [storeId, setStore] = useStoreParam(stores);
  const courses = coursesByStore?.[storeId] ?? getCourses(storeId);

  return (
    <>
      <ScaledSection designWidth={DESIGN_PC} height={HEIGHT}>
        <MenuCourseSection courses={courses} storeId={storeId} stores={stores} onSelectStore={setStore} onOpenModal={openModal} height={HEIGHT} />
      </ScaledSection>
      <ScaledSection designWidth={DESIGN_PC} height={600}>
        <Footer onOpenModal={openModal} />
      </ScaledSection>

      <ReserveModal open={modalOpen} onClose={closeModal} />
      <StickyButton />
    </>
  );
}
