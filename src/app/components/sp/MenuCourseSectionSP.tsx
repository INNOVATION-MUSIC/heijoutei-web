"use client";

import { useEffect, useRef } from "react";
import { COURSE_NOTES, DRINK_PLAN_TITLE, DRINK_PLANS, type CourseItem } from "@/app/lib/menuData";
import { type StoreTab } from "../MenuShared";
import { MenuHeadingSP, StoreTabsSP, MenuSelectBoxSP, mincho, sans, PANEL, GOLD } from "./MenuSharedSP";

const DRINK_BAR = "#9e4b3d"; // 飲み放題プラン見出しバーのテラコッタ

/* ─────────── 2時間飲み放題プラン（SP・指定カテゴリ選択時のみ・注意書きの上） ─────────── */
function DrinkPlanPanelSP() {
  return (
    <div style={{ display: "flex", flexDirection: "column", background: PANEL }}>
      <div style={{ background: DRINK_BAR, padding: "12px 0", textAlign: "center" }}>
        <span style={{ fontFamily: mincho, fontSize: 18, fontWeight: 600, letterSpacing: "0.1em", color: "#f3ece0" }}>{DRINK_PLAN_TITLE}</span>
      </div>
      {DRINK_PLANS.map((p, i) => (
        <div
          key={p.name}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 8,
            padding: "20px 20px",
            borderTop: i > 0 ? "1px solid rgba(234,229,219,0.12)" : "none",
          }}
        >
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 10 }}>
            <span style={{ fontFamily: mincho, fontSize: 16, letterSpacing: "0.04em", color: "#ebe5db" }}>{p.name}</span>
            <span style={{ fontFamily: mincho, fontSize: 22, fontWeight: 600, letterSpacing: "0.04em", color: GOLD }}>{p.price}</span>
          </div>
          <p style={{ fontFamily: sans, fontSize: 12, lineHeight: "22px", letterSpacing: "0.04em", color: "#99948c", margin: 0, whiteSpace: "pre-wrap" }}>{p.desc}</p>
        </div>
      ))}
    </div>
  );
}

/* ─────────── 「飯物付き」ラベル（カテゴリ風の金枠タグ） ─────────── */
function RiceBadgeSP() {
  return (
    <span style={{ alignSelf: "flex-start", border: `1px solid ${GOLD}`, color: GOLD, fontFamily: mincho, fontSize: 12, fontWeight: 600, letterSpacing: "0.12em", padding: "4px 12px", marginBottom: 14 }}>
      飯物付き
    </span>
  );
}

/* ─────────── コースカード（SP・350幅・画像なし・テキストのみ + 任意「飯物付き」） ─────────── */
function CourseCardSP({ course }: { course: CourseItem }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", width: 350, background: PANEL, paddingLeft: 24, paddingRight: 24, paddingTop: 26, paddingBottom: 30 }}>
      {course.withRice && <RiceBadgeSP />}
      {course.label && <span style={{ fontFamily: sans, fontSize: 12, letterSpacing: "0.08em", color: "#99948c" }}>{course.label}</span>}
      <div style={{ width: 32, height: 1, background: GOLD, marginTop: 12 }} />
      <span style={{ fontFamily: mincho, fontSize: 24, letterSpacing: "0.04em", color: "#ebe5db", marginTop: 12 }}>{course.title}</span>
      <span style={{ fontFamily: mincho, fontSize: 22, fontWeight: 600, letterSpacing: "0.04em", color: GOLD, marginTop: 10 }}>{course.price}</span>
      <p style={{ fontFamily: sans, fontSize: 13, lineHeight: "24px", letterSpacing: "0.04em", color: "#99948c", marginTop: 12, whiteSpace: "pre-wrap" }}>{course.desc}</p>
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
  showDrinkPlan?: boolean;
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
  showDrinkPlan = false,
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

        {/* 2時間飲み放題プラン（指定カテゴリ選択時のみ・注記の上） */}
        {showDrinkPlan && (
          <div style={{ paddingLeft: 20, paddingRight: 20, paddingTop: 40 }}>
            <DrinkPlanPanelSP />
          </div>
        )}

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
