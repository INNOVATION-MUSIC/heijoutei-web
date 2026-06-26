"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { COURSE_NOTES, type CourseItem } from "@/app/lib/menuData";
import { type StoreTab } from "../MenuShared";
import { MenuHeadingSP, StoreTabsSP, MenuSelectBoxSP, mincho, sans, PANEL, GOLD } from "./MenuSharedSP";

/* ─────────── コースカード（SP・350幅・写真350×320上 + 見出し/価格/説明） ─────────── */
function CourseCardSP({ course }: { course: CourseItem }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", width: 350, background: PANEL }}>
      <div style={{ position: "relative", width: 350, height: 320, overflow: "hidden", background: "#22140c" }}>
        <Image src={course.photo} alt={course.title} fill className="object-cover" sizes="350px" />
      </div>
      <div style={{ display: "flex", flexDirection: "column", paddingLeft: 24, paddingRight: 24, paddingTop: 26, paddingBottom: 30 }}>
        <span style={{ fontFamily: sans, fontSize: 12, letterSpacing: "0.08em", color: "#99948c" }}>{course.label}</span>
        <div style={{ width: 32, height: 1, background: GOLD, marginTop: 12 }} />
        <span style={{ fontFamily: mincho, fontSize: 24, letterSpacing: "0.04em", color: "#ebe5db", marginTop: 12 }}>{course.title}</span>
        <span style={{ fontFamily: mincho, fontSize: 22, fontWeight: 600, letterSpacing: "0.04em", color: GOLD, marginTop: 10 }}>{course.price}</span>
        <p style={{ fontFamily: sans, fontSize: 13, lineHeight: "24px", letterSpacing: "0.04em", color: "#99948c", marginTop: 12, margin: 0 }}>{course.desc}</p>
      </div>
    </div>
  );
}

/* ─────────── コースカテゴリのサブタブ（SP・横スクロール・金下線） ─────────── */
function CourseCategoryTabsSP({ tabs, active, onSelect }: { tabs: string[]; active: number; onSelect: (i: number) => void }) {
  return (
    <div style={{ display: "flex", gap: 18, paddingLeft: 20, paddingRight: 20, paddingTop: 24, overflowX: "auto" }}>
      {tabs.map((t, i) => (
        <button
          key={t}
          type="button"
          onClick={() => onSelect(i)}
          style={{
            padding: "6px 4px 10px",
            background: "transparent",
            border: "none",
            borderBottom: `2px solid ${i === active ? GOLD : "rgba(234,229,219,0.15)"}`,
            cursor: "pointer",
            fontFamily: mincho,
            fontSize: 15,
            letterSpacing: "0.06em",
            color: i === active ? "#ebe5db" : "#99948c",
            whiteSpace: "nowrap",
            flexShrink: 0,
          }}
        >
          {t}
        </button>
      ))}
    </div>
  );
}

type Props = {
  courses: CourseItem[];
  storeId: string;
  stores?: StoreTab[];
  onSelectStore: (id: string) => void;
  categoryTabs?: string[];
  activeCategory?: number;
  onSelectCategory?: (i: number) => void;
  height: number;
  onMeasured?: (h: number) => void;
};

/**
 * /menu/course コースメニュー SP 版。Figma node 2147:1648（設計幅 390）。
 * 縦並び: ヒーロー → Menu 見出し → 店舗タブ → 見出しボックス →（コースカテゴリのサブタブ）→ コースカード → 注記パネル。
 * カテゴリ数・説明の折返しで高さ可変のため、コンテンツ全体を ResizeObserver で実測する。
 */
export default function MenuCourseSectionSP({
  courses,
  storeId,
  stores,
  onSelectStore,
  categoryTabs,
  activeCategory = 0,
  onSelectCategory,
  height,
  onMeasured,
}: Props) {
  const contentRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = contentRef.current;
    if (!el || !onMeasured) return;
    const report = () => onMeasured(el.offsetHeight);
    report();
    const ro = new ResizeObserver(report);
    ro.observe(el);
    return () => ro.disconnect();
  }, [onMeasured, courses, storeId, activeCategory]);

  return (
    <div style={{ display: "flex", flexDirection: "column", width: 390, height, background: "#0a0a0a", overflow: "hidden" }}>
      <div style={{ height: 153, flexShrink: 0 }} />

      <div ref={contentRef} style={{ display: "flex", flexDirection: "column" }}>
        <MenuHeadingSP />
        <StoreTabsSP stores={stores} activeId={storeId} onSelect={onSelectStore} />

        <MenuSelectBoxSP title="コースメニュー" />

        {/* コースカテゴリのサブタブ（2カテゴリ以上のとき） */}
        {categoryTabs && onSelectCategory && (
          <CourseCategoryTabsSP tabs={categoryTabs} active={activeCategory} onSelect={onSelectCategory} />
        )}

        {/* コースカード（1列・gap40） */}
        <div style={{ display: "flex", flexDirection: "column", gap: 40, paddingLeft: 20, paddingRight: 20, paddingTop: 30 }}>
          {courses.map((c) => (
            <CourseCardSP key={c.title} course={c} />
          ))}
        </div>

        {/* 注記パネル（・マーカー） */}
        <div style={{ paddingLeft: 20, paddingRight: 20, paddingTop: 40, paddingBottom: 80 }}>
          <div style={{ background: PANEL, padding: "28px 24px", display: "flex", flexDirection: "column", gap: 12 }}>
            {COURSE_NOTES.map((n) => (
              <p key={n} style={{ fontFamily: mincho, fontSize: 13, letterSpacing: "0.04em", lineHeight: "22px", color: "#ebe5db", margin: 0 }}>・ {n}</p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
