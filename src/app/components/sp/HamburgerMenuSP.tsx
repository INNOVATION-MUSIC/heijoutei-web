"use client";

import { useEffect, useState } from "react";

const mincho = "'Shippori Mincho', serif";
const sans = "'Noto Sans JP', sans-serif";

import { NAV_LINKS, SECTION_LINKS } from "@/app/lib/navLinks";

// ハンバーガーメニュー用: Figmaの縦書き順に並べた表示順
const NAV_ITEMS = [
  { label: "お問い合せ",           href: NAV_LINKS.find(l => l.label === "お問い合せ")!.href },
  { label: "採用情報",             href: NAV_LINKS.find(l => l.label === "採用情報")!.href },
  // { label: "公式オンラインストア", href: NAV_LINKS.find(l => l.label === "公式オンラインストア")!.href }, // OnlineShop非公開中（公開後に解除）
  { label: "店舗情報",             href: SECTION_LINKS.store },
  { label: "メニュー",             href: NAV_LINKS.find(l => l.label === "メニュー")!.href },
  { label: "お知らせ",             href: NAV_LINKS.find(l => l.label === "お知らせ")!.href },
  { label: "平壌亭について",       href: NAV_LINKS.find(l => l.label === "平壌亭について")!.href },
];

interface Props {
  open: boolean;
  onClose: () => void;
  onOpenModal: () => void;
}

export default function HamburgerMenuSP({ open, onClose, onOpenModal }: Props) {
  const [scale, setScale] = useState(1);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    const update = () => setScale(window.innerWidth / 390);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  // body スクロールロックは外部システムの同期なので effect で行う（setState ではないため lint OK）。
  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const handleClose = () => setIsClosing(true);

  const handleAnimationEnd = () => {
    if (isClosing) {
      setIsClosing(false);
      onClose();
    }
  };

  // open 中、または閉じるアニメーション中だけマウントする（visible state を effect で立てない）。
  if (!open && !isClosing) return null;

  const DESIGN_H = 844;
  const anim = isClosing
    ? "hamburger-out 0.25s ease both"
    : "hamburger-in 0.3s ease both";

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 200,
        background: "#0a0a0a",
        overflow: "hidden",
        animation: anim,
      }}
      onAnimationEnd={handleAnimationEnd}
    >
      {/* 390×844 設計をビューポートにスケール */}
      <div
        style={{
          width: 390,
          height: DESIGN_H,
          transformOrigin: "top left",
          transform: `scale(${scale})`,
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* 閉じるボタン行 */}
        <div
          style={{
            height: 54,
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "flex-end",
            paddingTop: 19,
            paddingRight: 17,
            flexShrink: 0,
          }}
        >
          <button
            onClick={handleClose}
            aria-label="メニューを閉じる"
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 4,
            }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <line
                x1="1"
                y1="1"
                x2="15"
                y2="15"
                stroke="#ffffff"
                strokeWidth="1"
                strokeLinecap="round"
              />
              <line
                x1="15"
                y1="1"
                x2="1"
                y2="15"
                stroke="#ffffff"
                strokeWidth="1"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        {/* メインコンテンツ */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          {/* ナビゲーション: 縦書き、横並び */}
          <nav
            style={{
              paddingTop: 54,
              display: "flex",
              flexDirection: "row",
              gap: 31,
            }}
          >
            {NAV_ITEMS.map((item) => (
              <a
                key={item.label}
                href={item.href}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 8,
                  textDecoration: "none",
                }}
              >
                <span
                  style={{
                    fontFamily: "sans-serif",
                    fontSize: 14,
                    fontWeight: 700,
                    color: "#ffffff",
                    lineHeight: 1,
                  }}
                >
                  ·
                </span>
                <span
                  style={{
                    writingMode: "vertical-rl" as const,
                    fontFamily: mincho,
                    fontSize: 11,
                    fontWeight: 400,
                    letterSpacing: "0.1em",
                    color: "rgba(235,229,219,0.75)",
                    lineHeight: 1.3,
                  }}
                >
                  {item.label}
                </span>
              </a>
            ))}
          </nav>

          {/* スペーサー */}
          <div style={{ flex: 1 }} />

          {/* ボタンエリア: ご予約 + ご注文 */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 50,
              paddingBottom: 295,
            }}
          >
            {/* 予約ボタン */}
            <button
              onClick={() => {
                handleClose();
                onOpenModal();
              }}
              style={{
                width: 184,
                height: 50,
                borderRadius: 25,
                border: "1px solid rgba(221,168,63,0.6)",
                background: "transparent",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 8,
                paddingLeft: 22,
              }}
            >
              <span
                style={{ fontFamily: "sans-serif", fontSize: 16, color: "#fff", lineHeight: 1 }}
              >
                ·
              </span>
              <span
                style={{
                  fontFamily: mincho,
                  fontSize: 12,
                  letterSpacing: "0.083em",
                  color: "#fff",
                }}
              >
                ご予約
              </span>
              <span
                style={{
                  fontFamily: sans,
                  fontSize: 12,
                  fontWeight: 700,
                  letterSpacing: "0.125em",
                  color: "#ebe5db",
                }}
              >
                Reserve
              </span>
            </button>

            {/* テイクアウトボタン */}
            <a
              href={SECTION_LINKS.takeout}
              style={{
                width: 184,
                height: 50,
                borderRadius: 25,
                border: "1px solid rgba(221,168,63,0.6)",
                background: "transparent",
                display: "flex",
                alignItems: "center",
                gap: 8,
                paddingLeft: 22,
                textDecoration: "none",
              }}
            >
              <span
                style={{ fontFamily: "sans-serif", fontSize: 16, color: "#fff", lineHeight: 1 }}
              >
                ·
              </span>
              <span
                style={{
                  fontFamily: mincho,
                  fontSize: 12,
                  letterSpacing: "0.083em",
                  color: "#fff",
                }}
              >
                ご注文
              </span>
              <span
                style={{
                  fontFamily: sans,
                  fontSize: 12,
                  fontWeight: 700,
                  letterSpacing: "0.125em",
                  color: "#ebe5db",
                }}
              >
                Takeout
              </span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
