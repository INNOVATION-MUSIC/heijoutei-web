"use client";

import { useEffect, useState } from "react";
import { useIsMobile } from "@/app/lib/useIsMobile";

interface Props {
  open: boolean;
  onClose: () => void;
  isMobile?: boolean; // fallback; 内部で viewport 検知するためほぼ不要
}

const STORES = [
  { name: "亀岡店",   storeFull: "平壞亭　亀岡店",   phone: "0771-23-8410" },
  { name: "園部店",   storeFull: "平壞亭　園部店",   phone: "0771-68-1760" },
  { name: "福知山店", storeFull: "平壞亭　福知山店", phone: "0773-24-2322" },
  { name: "焼肉ゆらの", storeFull: "焼肉　ゆらの",  phone: "0773-45-8429" },
];

const mincho = "'Shippori Mincho', serif";
const sans = "'Noto Sans JP', sans-serif";

function PhoneIconSVG({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
      <path
        d="M1.5 4.5a3 3 0 013-3h1.372c.86 0 1.61.586 1.819 1.42l1.105 4.423a1.875 1.875 0 01-.694 1.955l-1.293.97c-.135.101-.164.249-.126.352a11.285 11.285 0 006.697 6.697c.103.038.25.009.352-.126l.97-1.293a1.875 1.875 0 011.955-.694l4.423 1.105c.834.209 1.42.959 1.42 1.82V19.5a3 3 0 01-3 3h-2.25C8.552 22.5 1.5 15.448 1.5 8.25V4.5z"
        fill="#d9b86b"
      />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
      <line x1="0.5" y1="0.5" x2="14.5" y2="14.5" stroke="white" strokeLinecap="round" />
      <line x1="14.5" y1="0.5" x2="0.5" y2="14.5" stroke="white" strokeLinecap="round" />
    </svg>
  );
}

export default function ReserveModal({ open, onClose, isMobile: isMobileProp = false }: Props) {
  const [isClosing, setIsClosing] = useState(false);

  // viewport 幅で SP/PC を自律検知（ScaledSection 外に置かれるため自前で判定）。
  // 確定前（null）はプロップのフォールバックを使う。
  const detected = useIsMobile();
  const isMobile = detected ?? isMobileProp;

  // body スクロールロックは外部システムの同期なので effect で行う（setState ではないため lint OK）。
  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const handleClose = () => setIsClosing(true);

  const handlePanelAnimationEnd = () => {
    if (isClosing) {
      setIsClosing(false);
      onClose();
    }
  };

  // open 中、または閉じるアニメーション中だけマウントする（visible state を effect で立てない）。
  if (!open && !isClosing) return null;

  const overlayAnim = isClosing
    ? "modal-overlay-out 0.22s ease both"
    : "modal-overlay-in 0.25s ease both";
  const panelAnim = isClosing
    ? "modal-panel-out 0.22s ease both"
    : "modal-panel-in 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) both";

  /* ── SP レイアウト ── */
  if (isMobile) {
    return (
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 100,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          animation: overlayAnim,
        }}
        onClick={handleClose}
      >
        <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.6)" }} />

        <div
          style={{
            position: "relative",
            width: 342,
            background: "#171717",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            padding: "44px 0 40px",
            animation: panelAnim,
          }}
          onClick={(e) => e.stopPropagation()}
          onAnimationEnd={handlePanelAnimationEnd}
        >
          {/* × 閉じるボタン */}
          <button
            onClick={handleClose}
            aria-label="閉じる"
            style={{
              position: "absolute",
              top: 14,
              right: 16,
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 4,
            }}
          >
            <CloseIcon />
          </button>

          {/* タイトル */}
          <p
            style={{
              fontFamily: sans,
              fontSize: 18,
              fontWeight: 500,
              letterSpacing: "4px",
              color: "#ebe5db",
              textAlign: "center",
              lineHeight: "31px",
              marginBottom: 47,
            }}
          >
            ご予約は各店舗へ
            <br />
            お電話にて承り中!!
          </p>

          {/* 店舗ボタン */}
          <div style={{ display: "flex", flexDirection: "column", gap: 30, width: "100%", alignItems: "center" }}>
            {STORES.map(({ name, phone }) => (
              <a
                key={name}
                href={`tel:${phone}`}
                style={{
                  display: "flex",
                  alignItems: "center",
                  width: 200,
                  height: 40,
                  borderRadius: 25,
                  border: "1px solid rgba(221,168,63,0.6)",
                  background: "transparent",
                  textDecoration: "none",
                  paddingLeft: 17,
                  paddingRight: 17,
                  gap: 10,
                }}
              >
                <PhoneIconSVG size={18} />
                <span
                  style={{
                    fontFamily: mincho,
                    fontSize: 12,
                    letterSpacing: "1px",
                    color: "#fff",
                    flex: 1,
                  }}
                >
                  {name}
                </span>
                <span
                  style={{
                    fontFamily: sans,
                    fontSize: 12,
                    fontWeight: 700,
                    letterSpacing: "1.5px",
                    color: "#ebe5db",
                  }}
                >
                  予約する
                </span>
              </a>
            ))}
          </div>

          {/* 注記 */}
          <p
            style={{
              fontFamily: sans,
              fontSize: 11,
              fontWeight: 300,
              letterSpacing: "3px",
              color: "#ebe5db",
              textAlign: "center",
              lineHeight: "20px",
              marginTop: 40,
            }}
          >
            おかけ間違いのないようお願いいたします
          </p>
        </div>
      </div>
    );
  }

  /* ── PC レイアウト ── */
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
        animation: overlayAnim,
      }}
      onClick={handleClose}
    >
      <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.75)" }} />
      <div
        style={{
          position: "relative",
          width: "min(708px, 95vw)",
          background: "#1a1410",
          border: "1px solid rgba(234,229,219,0.15)",
          padding: "56px 72px 48px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          animation: panelAnim,
        }}
        onClick={(e) => e.stopPropagation()}
        onAnimationEnd={handlePanelAnimationEnd}
      >
        <button
          onClick={handleClose}
          style={{
            position: "absolute",
            top: 20,
            right: 20,
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: 6,
          }}
          aria-label="閉じる"
        >
          <CloseIcon />
        </button>

        <div style={{ textAlign: "center", marginBottom: 50 }}>
          <p
            style={{
              fontFamily: mincho,
              fontSize: 22,
              fontWeight: 400,
              letterSpacing: "0.2em",
              color: "#ebe5db",
              lineHeight: "1.4",
              margin: 0,
            }}
          >
            ご予約は各店舗へ
          </p>
          <p
            style={{
              fontFamily: mincho,
              fontSize: 22,
              fontWeight: 400,
              letterSpacing: "0.2em",
              color: "#ebe5db",
              lineHeight: "1.4",
              margin: 0,
            }}
          >
            お電話にて承り中!!
          </p>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 38,
            width: "100%",
            maxWidth: 419,
            marginBottom: 50,
          }}
        >
          {STORES.map(({ storeFull, phone }) => (
            <div
              key={storeFull}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <span
                style={{
                  fontFamily: mincho,
                  fontSize: 20,
                  fontWeight: 400,
                  letterSpacing: "0.12em",
                  color: "#ebe5db",
                }}
              >
                {storeFull}
              </span>
              <a
                href={`tel:${phone}`}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  textDecoration: "none",
                  flexShrink: 0,
                }}
              >
                <PhoneIconSVG size={18} />
                <span
                  style={{
                    fontFamily: sans,
                    fontSize: 18,
                    fontWeight: 300,
                    letterSpacing: "0.05em",
                    color: "#d9b86b",
                  }}
                >
                  {phone}
                </span>
              </a>
            </div>
          ))}
        </div>

        <p
          style={{
            fontFamily: sans,
            fontSize: 12,
            fontWeight: 300,
            letterSpacing: "0.1em",
            color: "#99948c",
            textAlign: "center",
            lineHeight: "1.9",
            margin: 0,
          }}
        >
          おかけ間違いのないようお願いいたします
        </p>
      </div>
    </div>
  );
}
