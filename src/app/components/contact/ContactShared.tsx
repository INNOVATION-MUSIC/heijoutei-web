"use client";

import Image from "next/image";
import PageHeader from "../PageHeader";
import CommonOutlineButton from "../OutlineButton";

const mincho = "'Shippori Mincho', serif";
const sans = "'Noto Sans JP', sans-serif";
const display = "'Cormorant Garamond', serif";

export const GOLD_BORDER = "rgba(221,168,63,0.6)";

/* ─────────── ヘッダー + Contact 見出し（全ステップ共通） ─────────── */
export function ContactHeader({ onOpenModal }: { onOpenModal: () => void }) {
  return (
    <>
      <PageHeader onOpenModal={onOpenModal} />
      {/* 見出し + ヒーロー画像（Hero 上端 y=297） */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", paddingLeft: 57, paddingRight: 40, paddingTop: 144 }}>
        <div style={{ display: "flex", gap: 49, alignItems: "flex-start", paddingTop: 48 }}>
          {/* 縦書きラベル「お問合せ」 */}
          <div style={{ width: 44, height: 85, border: "1px solid rgba(255,255,255,0.3)", display: "flex", justifyContent: "center", alignItems: "center", flexShrink: 0, overflow: "hidden" }}>
            <span style={{ writingMode: "vertical-rl" as const, fontFamily: mincho, fontSize: 12, letterSpacing: "7px", lineHeight: "1", color: "#fff", transform: "translateY(4px)" }}>
              お問合せ
            </span>
          </div>
          <p style={{ fontFamily: display, fontSize: 80, letterSpacing: "-1px", color: "#ebe5db", lineHeight: "normal", margin: 0 }}>Contact</p>
        </div>
        {/* ヒーロー画像（820×320） */}
        <div style={{ position: "relative", width: 820, height: 320, overflow: "hidden", flexShrink: 0, background: "#472914" }}>
          <Image src="/images/contact_hero.webp" alt="焼肉平壌亭 お問い合わせ" fill className="object-cover" sizes="820px" priority />
        </div>
      </div>
    </>
  );
}

/* ─────────── ゴールド枠ボタン（共通 OutlineButton のラッパー・label/disabled API 維持） ─────────── */
export function OutlineButton({ label, onClick, href, disabled, width = 172 }: { label: string; onClick?: () => void; href?: string; disabled?: boolean; width?: number }) {
  return <CommonOutlineButton jp={label} onClick={onClick} href={href} disabled={disabled} width={width} align="center" />;
}

export { mincho, sans, display };
