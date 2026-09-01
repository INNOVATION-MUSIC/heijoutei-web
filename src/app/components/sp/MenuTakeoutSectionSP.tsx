"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import OutlineButton from "../OutlineButton";
import { TAKEOUT_MENU_NOTE, TAKEOUT_MENU_CONTACT, type MenuItem, type TakeoutMenuTab } from "@/app/lib/menuData";
import { SECTION_LINKS } from "@/app/lib/navLinks";
import { resolveStoreContact, type StoreContact } from "../MenuShared";
import { MenuHeadingSP, StoreTabsSP, MenuSelectBoxSP, ItemCardSP, mincho, sans, display, PANEL, GOLD } from "./MenuSharedSP";

/* ─────────── カテゴリサブタブ（SP・横スクロール・アクティブは金下線） ─────────── */
function TakeoutTabsSP({ tabs, activeSlug, onSelect }: { tabs: TakeoutMenuTab[]; activeSlug: string; onSelect: (slug: string) => void }) {
  return (
    <div style={{ paddingLeft: 20, paddingRight: 20, paddingTop: 30, overflowX: "auto" }}>
      <div style={{ display: "inline-flex", gap: 24, borderBottom: "1px solid rgba(234,229,219,0.15)", minWidth: 350 }}>
        {tabs.map((t) => {
          const active = t.slug === activeSlug;
          return (
            <button
              key={t.slug}
              type="button"
              onClick={() => onSelect(t.slug)}
              style={{
                background: "transparent",
                border: "none",
                borderBottom: active ? `2px solid ${GOLD}` : "2px solid transparent",
                marginBottom: -1,
                padding: 0,
                paddingBottom: 14,
                cursor: "pointer",
                fontFamily: mincho,
                fontSize: 15,
                letterSpacing: "0.04em",
                color: active ? GOLD : "#99948c",
                whiteSpace: "nowrap",
                transition: "color 0.3s ease",
              }}
            >
              {t.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ─────────── 注記パネル（タイトル + ・ 箇条書き） ─────────── */
function TakeoutNoteSP() {
  return (
    <div style={{ paddingLeft: 20, paddingRight: 20, paddingTop: 50 }}>
      <div style={{ background: PANEL, padding: "24px 22px", display: "flex", flexDirection: "column", gap: 16 }}>
        <p style={{ fontFamily: mincho, fontSize: 15, letterSpacing: "0.04em", lineHeight: "22px", color: "#d9b86b", margin: 0 }}>{TAKEOUT_MENU_NOTE.title}</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {TAKEOUT_MENU_NOTE.lines.map((l, i) => (
            <p key={i} style={{ fontFamily: mincho, fontSize: 12, letterSpacing: "0.02em", lineHeight: "19px", color: "rgba(235,229,219,0.65)", margin: 0, display: "flex", gap: 6 }}>
              <span style={{ flexShrink: 0, color: "rgba(217,184,107,0.7)" }}>・</span>
              <span>{l}</span>
            </p>
          ))}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, borderTop: "1px solid rgba(234,229,219,0.15)", paddingTop: 16 }}>
          <p style={{ fontFamily: mincho, fontSize: 13, letterSpacing: "0.06em", color: "#ebe5db", margin: 0 }}>{TAKEOUT_MENU_NOTE.reserveTitle}</p>
          {TAKEOUT_MENU_NOTE.reserveNotes.map(([label, val], i) => (
            <div key={i} style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
              <span style={{ width: 96, flexShrink: 0, fontFamily: mincho, fontSize: 12, letterSpacing: "0.04em", color: "rgba(235,229,219,0.55)" }}>{label}</span>
              <span style={{ fontFamily: mincho, fontSize: 15, letterSpacing: "0.04em", color: "#d9b86b" }}>{val}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─────────── 下部CTA帯（SP・縦積み: お電話 / オンライン注文） ─────────── */
function TakeoutCtaSP({ tel, closedDays }: { tel: string; closedDays: string }) {
  return (
    <div style={{ position: "relative", width: 390, overflow: "hidden" }}>
      <Image src="/images/takeout_hero.webp" alt="" fill className="object-cover" sizes="390px" />
      <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.72)" }} />
      <div style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center", gap: 48, paddingTop: 80, paddingBottom: 80 }}>
        {/* お電話でのご注文 */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
          <span style={{ fontFamily: display, fontSize: 13, letterSpacing: "0.2em", color: "rgba(217,184,107,0.6)" }}>ORDER BY PHONE</span>
          <span style={{ fontFamily: mincho, fontSize: 18, fontWeight: 800, letterSpacing: "0.08em", color: "#ebe5db", marginTop: 12 }}>お電話でのご注文</span>
          <a href={`tel:${tel.replace(/[^0-9+]/g, "")}`} style={{ fontFamily: mincho, fontSize: 28, fontWeight: 800, letterSpacing: "0.04em", color: GOLD, marginTop: 20, textDecoration: "none" }}>{tel}</a>
          <span style={{ fontFamily: sans, fontSize: 12, letterSpacing: "0.04em", color: "#99948c", marginTop: 14 }}>{closedDays ? `定休日：${closedDays}` : ""}</span>
        </div>
        {/* 区切り */}
        <div style={{ width: 200, height: 1, background: "rgba(234,229,219,0.2)" }} />
        {/* オンラインでご注文 */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
          <span style={{ fontFamily: display, fontSize: 13, letterSpacing: "0.2em", color: "rgba(217,184,107,0.6)" }}>TAKEOUT ORDER</span>
          <span style={{ fontFamily: mincho, fontSize: 18, fontWeight: 800, letterSpacing: "0.08em", color: "#ebe5db", marginTop: 12 }}>オンラインでご注文</span>
          <div style={{ marginTop: 20 }}>
            <OutlineButton jp="ご注文" en="Takeout" href={SECTION_LINKS.takeout} align="center" />
          </div>
          <span style={{ fontFamily: sans, fontSize: 12, letterSpacing: "0.04em", color: "#99948c", marginTop: 16 }}>{TAKEOUT_MENU_CONTACT.onlineHours}</span>
        </div>
      </div>
    </div>
  );
}

type Props = {
  tabs: TakeoutMenuTab[];
  activeSlug: string;
  items: MenuItem[];
  storeId: string;
  stores?: StoreContact[];
  onSelectTab: (slug: string) => void;
  onSelectStore: (id: string) => void;
  height: number;
  onMeasured?: (h: number) => void;
};

/**
 * /menu/takeout テイクアウトメニュー SP 版。Figma node 2147:1397（設計幅 390）。
 * 縦並び: ヒーロー → Menu 見出し → 店舗タブ → 見出しボックス「テイクアウトメニュー」→
 *   カテゴリサブタブ → 税込注記 → 項目カード1列 → 注記パネル → 下部CTA帯（縦積み）。
 * カテゴリ切替はリロードせず state で行う。品目/CTA の折返しで高さ可変のため実測する。
 */
export default function MenuTakeoutSectionSP({ tabs, activeSlug, items, storeId, stores, onSelectTab, onSelectStore, height, onMeasured }: Props) {
  const contact = resolveStoreContact(storeId, stores);
  const contentRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = contentRef.current;
    if (!el || !onMeasured) return;
    const report = () => onMeasured(el.offsetHeight);
    report();
    const ro = new ResizeObserver(report);
    ro.observe(el);
    return () => ro.disconnect();
  }, [onMeasured, items, activeSlug, storeId]);

  return (
    <div style={{ display: "flex", flexDirection: "column", width: 390, height, background: "#0a0a0a", overflow: "hidden" }}>
      <div style={{ height: 153, flexShrink: 0 }} />

      <div ref={contentRef} style={{ display: "flex", flexDirection: "column" }}>
        <MenuHeadingSP />
        <StoreTabsSP stores={stores} activeId={storeId} onSelect={onSelectStore} />

        <MenuSelectBoxSP title="テイクアウトメニュー" />

        {/* カテゴリサブタブ */}
        <TakeoutTabsSP tabs={tabs} activeSlug={activeSlug} onSelect={onSelectTab} />

        {/* 税込注記 */}
        <p style={{ fontFamily: sans, fontSize: 12, letterSpacing: "0.04em", color: "#99948c", paddingLeft: 20, paddingTop: 20, margin: 0 }}>※ 価格はすべて税込表示です</p>

        {/* 項目カード（1列・gap20） */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20, paddingLeft: 20, paddingRight: 20, paddingTop: 20 }}>
          {items.map((it, i) => (
            <ItemCardSP key={`${it.name}-${i}`} item={it} />
          ))}
        </div>

        {/* 注記パネル */}
        <TakeoutNoteSP />

        {/* 下部CTA帯 */}
        <div style={{ paddingTop: 60 }}>
          <TakeoutCtaSP tel={contact.tel} closedDays={contact.closedDays} />
        </div>
      </div>
    </div>
  );
}
