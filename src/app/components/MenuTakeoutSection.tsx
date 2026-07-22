"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import OutlineButton from "./OutlineButton";
import { MenuHeading, StoreTabs, ItemCard, BackToMenuButton, mincho, sans, display, PANEL, GOLD, type StoreTab } from "./MenuShared";
import { TAKEOUT_MENU_NOTE, TAKEOUT_MENU_CONTACT, type MenuItem, type TakeoutMenuTab } from "@/app/lib/menuData";
import { SECTION_LINKS } from "@/app/lib/navLinks";

const TAB_W = 191; // カテゴリタブ1つの幅（191×7≒1340）

/* ─────────── カテゴリタブ（7種・1行・現在タブは金で点灯・リロードせず切替） ─────────── */
function TakeoutTabs({ tabs, activeSlug, onSelect }: { tabs: TakeoutMenuTab[]; activeSlug: string; onSelect: (slug: string) => void }) {
  const activeIndex = Math.max(0, tabs.findIndex((t) => t.slug === activeSlug));
  // タブ数が多いと flex でボタンが縮み固定幅計算とズレるため、アクティブタブの実位置を測って下線を合わせる
  const rowRef = useRef<HTMLDivElement>(null);
  const [bar, setBar] = useState<{ left: number; width: number } | null>(null);
  useEffect(() => {
    const row = rowRef.current;
    if (!row) return;
    const measure = () => {
      const btn = row.children[activeIndex] as HTMLElement | undefined;
      if (btn) setBar({ left: btn.offsetLeft, width: btn.offsetWidth });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(row);
    return () => ro.disconnect();
  }, [activeIndex, tabs]);

  return (
    <div style={{ paddingLeft: 50, paddingRight: 50, paddingTop: 66 }}>
      <div style={{ width: 1337 }}>
        <div ref={rowRef} style={{ display: "flex", position: "relative" }}>
          {tabs.map((t) => (
            <button
              key={t.slug}
              type="button"
              onClick={() => onSelect(t.slug)}
              style={{
                width: TAB_W,
                height: 80,
                background: "transparent",
                border: "none",
                cursor: "pointer",
                fontFamily: mincho,
                fontSize: 16,
                letterSpacing: "0.04em",
                color: t.slug === activeSlug ? GOLD : "#99948c",
                whiteSpace: "nowrap",
                transition: "color 0.3s ease",
              }}
            >
              {t.name}
            </button>
          ))}
        </div>
        <div style={{ position: "relative", width: 1337, height: 2, background: "rgba(234,229,219,0.15)" }}>
          {bar && <div style={{ position: "absolute", top: 0, left: bar.left, width: bar.width, height: 2, background: GOLD, transition: "left 0.3s ease, width 0.3s ease" }} />}
        </div>
      </div>
    </div>
  );
}

/* ─────────── 注記パネル ─────────── */
function TakeoutNote() {
  return (
    <div style={{ paddingLeft: 140, paddingRight: 140, paddingTop: 50 }}>
      <div style={{ background: PANEL, padding: "28px 48px", display: "flex", flexDirection: "column", gap: 18 }}>
        <p style={{ fontFamily: mincho, fontSize: 18, letterSpacing: "0.06em", color: "#d9b86b", margin: 0 }}>{TAKEOUT_MENU_NOTE.title}</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {TAKEOUT_MENU_NOTE.lines.map((l, i) => (
            <p key={i} style={{ fontFamily: mincho, fontSize: 13, letterSpacing: "0.04em", lineHeight: "22px", color: "rgba(235,229,219,0.65)", margin: 0, display: "flex", gap: 8 }}>
              <span style={{ color: "rgba(217,184,107,0.7)" }}>・</span>
              <span>{l}</span>
            </p>
          ))}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10, borderTop: "1px solid rgba(234,229,219,0.15)", paddingTop: 18 }}>
          <p style={{ fontFamily: mincho, fontSize: 14, letterSpacing: "0.08em", color: "#ebe5db", margin: 0 }}>{TAKEOUT_MENU_NOTE.reserveTitle}</p>
          <div style={{ display: "flex", gap: 64 }}>
            {TAKEOUT_MENU_NOTE.reserveNotes.map(([label, val], i) => (
              <div key={i} style={{ display: "flex", alignItems: "baseline", gap: 16 }}>
                <span style={{ fontFamily: mincho, fontSize: 12, letterSpacing: "0.06em", color: "rgba(235,229,219,0.55)" }}>{label}</span>
                <span style={{ fontFamily: mincho, fontSize: 16, letterSpacing: "0.04em", color: "#d9b86b" }}>{val}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────── 下部CTA帯（お電話 / オンライン注文） ─────────── */
function TakeoutCta() {
  return (
    <div style={{ position: "relative", width: 1440, height: 500, overflow: "hidden" }}>
      <Image src="/images/takeout_hero.webp" alt="" fill className="object-cover" sizes="1440px" />
      <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.72)" }} />
      <div style={{ position: "relative", display: "flex", height: "100%", alignItems: "center", justifyContent: "center", gap: 0 }}>
        {/* 左：お電話でのご注文 */}
        <div style={{ width: 440, display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
          <span style={{ fontFamily: display, fontSize: 13, letterSpacing: "0.2em", color: "rgba(217,184,107,0.6)" }}>ORDER BY PHONE</span>
          <span style={{ fontFamily: mincho, fontSize: 20, fontWeight: 800, letterSpacing: "0.08em", color: "#ebe5db", marginTop: 12 }}>お電話でのご注文</span>
          <span style={{ fontFamily: mincho, fontSize: 30, fontWeight: 800, letterSpacing: "0.04em", color: GOLD, marginTop: 24 }}>{TAKEOUT_MENU_CONTACT.tel}</span>
          <span style={{ fontFamily: sans, fontSize: 13, letterSpacing: "0.04em", color: "#99948c", marginTop: 16 }}>{TAKEOUT_MENU_CONTACT.telHours}</span>
        </div>
        {/* 区切り */}
        <div style={{ width: 1, height: 200, background: "rgba(234,229,219,0.2)" }} />
        {/* 右：オンラインでご注文 */}
        <div style={{ width: 440, display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
          <span style={{ fontFamily: display, fontSize: 13, letterSpacing: "0.2em", color: "rgba(217,184,107,0.6)" }}>TAKEOUT ORDER</span>
          <span style={{ fontFamily: mincho, fontSize: 20, fontWeight: 800, letterSpacing: "0.08em", color: "#ebe5db", marginTop: 12 }}>オンラインでご注文</span>
          <div style={{ marginTop: 24 }}>
            <OutlineButton jp="ご注文" en="Takeout" href={SECTION_LINKS.takeout} align="center" />
          </div>
          <span style={{ fontFamily: sans, fontSize: 13, letterSpacing: "0.04em", color: "#99948c", marginTop: 18 }}>{TAKEOUT_MENU_CONTACT.onlineHours}</span>
        </div>
      </div>
    </div>
  );
}

/**
 * /menu/takeout テイクアウトメニュー（PC のみ・Figma 2020:488）。
 * 見出し + 店舗タブ + カテゴリタブ7 + 項目グリッド + 注記 + CTA帯。
 * カテゴリ切替はリロードせず client の state で行う。
 */
export default function MenuTakeoutSection({
  tabs,
  activeSlug,
  items,
  storeId,
  stores,
  onSelectTab,
  onSelectStore,
  onOpenModal,
  height,
}: {
  tabs: TakeoutMenuTab[];
  activeSlug: string;
  items: MenuItem[];
  storeId: string;
  stores?: StoreTab[];
  onSelectTab: (slug: string) => void;
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
        <h1 style={{ fontFamily: mincho, fontSize: 28, fontWeight: 600, letterSpacing: "0.1em", color: "#ebe5db", margin: 0 }}>テイクアウトメニュー</h1>
      </div>

      {/* カテゴリタブ */}
      <TakeoutTabs tabs={tabs} activeSlug={activeSlug} onSelect={onSelectTab} />

      {/* 税込注記 */}
      <p style={{ fontFamily: sans, fontSize: 13, letterSpacing: "0.04em", color: "#99948c", paddingLeft: 50, paddingTop: 48, margin: 0 }}>※ 価格はすべて税込表示です</p>

      {/* 項目グリッド（価格は左寄せ） */}
      <div style={{ display: "flex", flexWrap: "wrap", columnGap: 40, rowGap: 40, paddingLeft: 50, paddingRight: 50, paddingTop: 18 }}>
        {items.map((it, i) => (
          <ItemCard key={`${it.name}-${i}`} item={it} priceAlign="left" />
        ))}
      </div>

      {/* 注記パネル */}
      <TakeoutNote />

      <div style={{ flex: 1 }} />

      {/* メニュー一覧に戻る（お電話でのご注文セクションの上） */}
      <BackToMenuButton />

      {/* 下部CTA帯 */}
      <TakeoutCta />
    </section>
  );
}
