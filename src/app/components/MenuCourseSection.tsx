"use client";

import Image from "next/image";
import { MenuHeading, StoreTabs, BackToMenuButton, mincho, sans, PANEL, GOLD, type StoreTab } from "./MenuShared";
import { COURSE_NOTES, type CourseItem } from "@/app/lib/menuData";

/* ─────────── コースカード（420×576・写真上 + 見出し/価格/説明） ─────────── */
function CourseCard({ course }: { course: CourseItem }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", width: 420, height: 576, background: PANEL }}>
      <div style={{ position: "relative", width: 420, height: 320, overflow: "hidden", background: "#22140c", flexShrink: 0 }}>
        <Image src={course.photo} alt={course.title} fill className="object-cover" sizes="420px" />
      </div>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", paddingLeft: 28, paddingRight: 28, paddingTop: 30 }}>
        <span style={{ fontFamily: sans, fontSize: 12, letterSpacing: "0.08em", color: "#99948c" }}>{course.label}</span>
        <div style={{ width: 32, height: 1, background: GOLD, marginTop: 12 }} />
        <span style={{ fontFamily: mincho, fontSize: 26, letterSpacing: "0.04em", color: "#ebe5db", marginTop: 12 }}>{course.title}</span>
        <span style={{ fontFamily: mincho, fontSize: 24, fontWeight: 600, letterSpacing: "0.04em", color: GOLD, marginTop: 12 }}>{course.price}</span>
        <p style={{ fontFamily: sans, fontSize: 13, lineHeight: "26px", letterSpacing: "0.04em", color: "#99948c", marginTop: 14 }}>{course.desc}</p>
      </div>
    </div>
  );
}

/**
 * /menu/course コースメニュー（PC のみ・Figma 2109:243）。
 * 見出し + 店舗タブ + 3コースカード + 注記パネル。
 */
export default function MenuCourseSection({
  courses,
  storeId,
  stores,
  onSelectStore,
  onOpenModal,
  height,
}: {
  courses: CourseItem[];
  storeId: string;
  stores?: StoreTab[];
  onSelectStore: (id: string) => void;
  onOpenModal: () => void;
  height: number;
}) {
  return (
    <section style={{ display: "flex", flexDirection: "column", width: 1440, height, background: "#0a0a0a" }}>
      <MenuHeading onOpenModal={onOpenModal} />
      <StoreTabs stores={stores} activeId={storeId} onSelect={onSelectStore} />

      {/* 見出し（中央） */}
      <div style={{ display: "flex", justifyContent: "center", paddingTop: 64 }}>
        <h1 style={{ fontFamily: mincho, fontSize: 28, fontWeight: 600, letterSpacing: "0.1em", color: "#ebe5db", margin: 0 }}>コースメニュー</h1>
      </div>

      {/* コースカード3枚 */}
      <div style={{ display: "flex", gap: 40, paddingLeft: 50, paddingRight: 50, paddingTop: 54 }}>
        {courses.map((c) => (
          <CourseCard key={c.title} course={c} />
        ))}
      </div>

      {/* 注記パネル */}
      <div style={{ paddingLeft: 146, paddingRight: 134, paddingTop: 55 }}>
        <div style={{ background: PANEL, padding: "34px 48px", display: "flex", flexDirection: "column", gap: 12 }}>
          {COURSE_NOTES.map((n) => (
            <p key={n} style={{ fontFamily: mincho, fontSize: 14, letterSpacing: "0.04em", lineHeight: "24px", color: "#ebe5db", margin: 0 }}>■ {n}</p>
          ))}
        </div>
      </div>

      {/* 一覧へ戻る（注記の直後・余白を詰める） */}
      <BackToMenuButton />
      <div style={{ flex: 1 }} />
    </section>
  );
}
