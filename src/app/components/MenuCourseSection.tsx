"use client";

import { useEffect, useRef } from "react";
import { MenuHeading, StoreTabs, BackToMenuButton, mincho, sans, PANEL, GOLD, type StoreTab } from "./MenuShared";
import { COURSE_NOTES, DRINK_PLAN_TITLE, DRINK_PLANS, POKKIRI_OPTION, ENKAI_INFO, type CourseItem } from "@/app/lib/menuData";

const DRINK_BAR = "#9e4b3d"; // 飲み放題プラン見出しバーのテラコッタ
const ENKAI_BAR = "#5e2a25"; // 宴会案内見出しバーのマルーン

/* ─────────── ポッキリ宴会の案内（マイクロバス送迎＋宴会注意事項） ─────────── */
function EnkaiInfoPanel() {
  return (
    <div style={{ display: "flex", flexDirection: "column", background: PANEL }}>
      <div style={{ background: ENKAI_BAR, padding: "22px 40px", display: "flex", flexDirection: "column", gap: 6 }}>
        <span style={{ fontFamily: mincho, fontSize: 20, letterSpacing: "0.04em", color: "#f3ece0" }}>{ENKAI_INFO.headline}</span>
        <span style={{ fontFamily: mincho, fontSize: 14, letterSpacing: "0.04em", color: "#d8cfc4" }}>{ENKAI_INFO.headlineSub}</span>
      </div>
      <div style={{ padding: "26px 40px", display: "flex", flexDirection: "column", gap: 10 }}>
        {ENKAI_INFO.notes.map((n) => (
          <p key={n} style={{ margin: 0, fontFamily: mincho, fontSize: 15, letterSpacing: "0.04em", lineHeight: "26px", color: "#ebe5db" }}>{n}</p>
        ))}
      </div>
    </div>
  );
}

/* ─────────── ポッキリ宴会オプション（ポッキリ宴会カテゴリ選択時のみ・注意書きの上） ─────────── */
function PokkiriOptionPanel() {
  return (
    <div style={{ display: "flex", flexDirection: "column", background: PANEL }}>
      <div style={{ background: GOLD, padding: "16px 0", textAlign: "center" }}>
        <span style={{ fontFamily: mincho, fontSize: 24, fontWeight: 600, letterSpacing: "0.1em", color: "#1a1410" }}>{POKKIRI_OPTION.title}</span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, padding: "34px 40px" }}>
        <p style={{ margin: 0, display: "flex", alignItems: "baseline", gap: 4 }}>
          <span style={{ fontFamily: mincho, fontSize: 42, fontWeight: 700, letterSpacing: "0.02em", color: GOLD }}>{POKKIRI_OPTION.price}</span>
          <span style={{ fontFamily: mincho, fontSize: 20, color: "#ebe5db" }}>{POKKIRI_OPTION.priceSuffix}</span>
        </p>
        <p style={{ margin: 0, fontFamily: mincho, fontSize: 22, fontWeight: 600, letterSpacing: "0.06em", color: "#ebe5db" }}>{POKKIRI_OPTION.desc}</p>
      </div>
    </div>
  );
}

/* ─────────── 2時間飲み放題プラン（指定カテゴリ選択時のみ・注意書きの上） ─────────── */
function DrinkPlanPanel() {
  return (
    <div style={{ display: "flex", flexDirection: "column", background: PANEL }}>
      <div style={{ background: DRINK_BAR, padding: "16px 0", textAlign: "center" }}>
        <span style={{ fontFamily: mincho, fontSize: 24, fontWeight: 600, letterSpacing: "0.12em", color: "#f3ece0" }}>{DRINK_PLAN_TITLE}</span>
      </div>
      {DRINK_PLANS.map((p, i) => (
        <div
          key={p.name}
          style={{
            display: "flex",
            alignItems: "center",
            padding: "26px 48px",
            borderTop: i > 0 ? "1px solid rgba(234,229,219,0.12)" : "none",
          }}
        >
          <span style={{ width: 240, flexShrink: 0, fontFamily: mincho, fontSize: 19, letterSpacing: "0.06em", color: "#ebe5db" }}>{p.name}</span>
          <span style={{ width: 150, flexShrink: 0, fontFamily: mincho, fontSize: 26, fontWeight: 600, letterSpacing: "0.04em", color: GOLD }}>{p.price}</span>
          <p style={{ flex: 1, fontFamily: sans, fontSize: 14, lineHeight: "26px", letterSpacing: "0.04em", color: "#99948c", margin: 0, whiteSpace: "pre-wrap" }}>{p.desc}</p>
        </div>
      ))}
    </div>
  );
}

/* ─────────── 「飯物付き」ラベル（カテゴリ風の金枠タグ） ─────────── */
function RiceBadge() {
  return (
    <span style={{ alignSelf: "flex-start", border: `1px solid ${GOLD}`, color: GOLD, fontFamily: mincho, fontSize: 12, fontWeight: 600, letterSpacing: "0.12em", padding: "5px 14px", marginBottom: 16 }}>
      飯物付き
    </span>
  );
}

/* ─────────── コースカード（420・画像なし・テキストのみ + 任意「飯物付き」） ─────────── */
function CourseCard({ course }: { course: CourseItem }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", width: 420, background: PANEL, paddingLeft: 32, paddingRight: 32, paddingTop: 36, paddingBottom: 40 }}>
      {course.withRice && <RiceBadge />}
      {course.label && <span style={{ fontFamily: sans, fontSize: 12, letterSpacing: "0.08em", color: "#99948c" }}>{course.label}</span>}
      <div style={{ width: 32, height: 1, background: GOLD, marginTop: 12 }} />
      <span style={{ fontFamily: mincho, fontSize: 26, letterSpacing: "0.04em", color: "#ebe5db", marginTop: 12 }}>{course.title}</span>
      <span style={{ fontFamily: mincho, fontSize: 24, fontWeight: 600, letterSpacing: "0.04em", color: GOLD, marginTop: 12 }}>{course.price}</span>
      <p style={{ fontFamily: sans, fontSize: 13, lineHeight: "26px", letterSpacing: "0.04em", color: "#99948c", marginTop: 14, whiteSpace: "pre-wrap" }}>{course.desc}</p>
    </div>
  );
}

/* ─────────── コースカテゴリのサブタブ（中央寄せ・金下線ハイライト） ─────────── */
function CourseCategoryTabs({ tabs, active, onSelect }: { tabs: string[]; active: number; onSelect: (i: number) => void }) {
  return (
    <div style={{ display: "flex", justifyContent: "center", gap: 8, paddingTop: 36, paddingLeft: 50, paddingRight: 50, flexWrap: "wrap" }}>
      {tabs.map((t, i) => (
        <button
          key={t}
          type="button"
          onClick={() => onSelect(i)}
          style={{
            padding: "8px 22px 12px",
            background: "transparent",
            border: "none",
            borderBottom: `2px solid ${i === active ? GOLD : "rgba(234,229,219,0.15)"}`,
            cursor: "pointer",
            fontFamily: mincho,
            fontSize: 18,
            letterSpacing: "0.08em",
            color: i === active ? "#ebe5db" : "#99948c",
            transition: "color 0.3s ease, border-color 0.3s ease",
            whiteSpace: "nowrap",
          }}
        >
          {t}
        </button>
      ))}
    </div>
  );
}

/**
 * /menu/course コースメニュー（PC のみ・Figma 2109:243）。
 * 見出し + 店舗タブ +（コースカテゴリのサブタブ）+ コースカード + 注記パネル。
 * カテゴリ数・カード枚数で高さが変わるため、コンテンツを ResizeObserver で実測する。
 */
export default function MenuCourseSection({
  courses,
  storeId,
  stores,
  onSelectStore,
  categoryTabs,
  activeCategory = 0,
  onSelectCategory,
  showDrinkPlan = false,
  showPokkiriOption = false,
  onOpenModal,
  height,
  onMeasured,
}: {
  courses: CourseItem[];
  storeId: string;
  stores?: StoreTab[];
  onSelectStore: (id: string) => void;
  categoryTabs?: string[];
  activeCategory?: number;
  onSelectCategory?: (i: number) => void;
  showDrinkPlan?: boolean;
  showPokkiriOption?: boolean;
  onOpenModal: () => void;
  height: number;
  onMeasured?: (h: number) => void;
}) {
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
    <section style={{ display: "flex", flexDirection: "column", width: 1440, minHeight: height, background: "#0a0a0a" }}>
      <div ref={contentRef} style={{ display: "flex", flexDirection: "column" }}>
        <MenuHeading onOpenModal={onOpenModal} />
        <StoreTabs stores={stores} activeId={storeId} onSelect={onSelectStore} />

        {/* 見出し（中央） */}
        <div style={{ display: "flex", justifyContent: "center", paddingTop: 64 }}>
          <h1 style={{ fontFamily: mincho, fontSize: 28, fontWeight: 600, letterSpacing: "0.1em", color: "#ebe5db", margin: 0 }}>コースメニュー</h1>
        </div>

        {/* コースカテゴリのサブタブ（2カテゴリ以上のとき） */}
        {categoryTabs && onSelectCategory && (
          <CourseCategoryTabs tabs={categoryTabs} active={activeCategory} onSelect={onSelectCategory} />
        )}

        {/* コースカード（枚数可変・横並びで折返し） */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 40, rowGap: 40, paddingLeft: 50, paddingRight: 50, paddingTop: 54 }}>
          {courses.map((c) => (
            <CourseCard key={c.title} course={c} />
          ))}
        </div>

        {/* 2時間飲み放題プラン（フルコース/盛り合わせ選択時のみ・注記の上） */}
        {showDrinkPlan && (
          <div style={{ paddingLeft: 146, paddingRight: 134, paddingTop: 55 }}>
            <DrinkPlanPanel />
          </div>
        )}

        {/* ポッキリ宴会オプション + 宴会案内（ポッキリ宴会選択時のみ・注記の上） */}
        {showPokkiriOption && (
          <div style={{ paddingLeft: 146, paddingRight: 134, paddingTop: 55, display: "flex", flexDirection: "column", gap: 24 }}>
            <PokkiriOptionPanel />
            <EnkaiInfoPanel />
          </div>
        )}

        {/* 注記パネル */}
        <div style={{ paddingLeft: 146, paddingRight: 134, paddingTop: 55 }}>
          <div style={{ background: PANEL, padding: "34px 48px", display: "flex", flexDirection: "column", gap: 12 }}>
            {COURSE_NOTES.map((n) => (
              <p key={n} style={{ fontFamily: mincho, fontSize: 14, letterSpacing: "0.04em", lineHeight: "24px", color: "#ebe5db", margin: 0 }}>■ {n}</p>
            ))}
          </div>
        </div>

        {/* 一覧へ戻る（注記の直後） */}
        <BackToMenuButton />
      </div>
    </section>
  );
}
