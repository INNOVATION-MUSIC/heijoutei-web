"use client";

import { useSyncExternalStore } from "react";

// PC/SP 切り替えのブレークポイント（未満が SP）。ScaledSection 方式と一致。
export const BREAKPOINT = 1024;
const QUERY = `(max-width: ${BREAKPOINT - 1}px)`;

function subscribe(onChange: () => void): () => void {
  const mq = window.matchMedia(QUERY);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

function getSnapshot(): boolean {
  return window.matchMedia(QUERY).matches;
}

// サーバー（および初回ハイドレーション）では幅が不明なので null を返す。
// ハイドレーション後に getSnapshot の boolean へ自動で切り替わる（setState を effect で呼ばずに済む）。
function getServerSnapshot(): boolean | null {
  return null;
}

/**
 * SP かどうかを返す。初期（クライアント確定前）は null。
 * useSyncExternalStore でハイドレーション安全に matchMedia を購読する。
 */
export function useIsMobile(): boolean | null {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
