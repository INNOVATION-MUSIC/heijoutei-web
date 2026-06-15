"use client";

import { useEffect, useRef } from "react";

// Cloudflare Turnstile（CAPTCHA）ウィジェット。
// NEXT_PUBLIC_TURNSTILE_SITE_KEY 未設定なら何も描画せず無効（フォームは従来どおり動作）。
const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
export const turnstileEnabled = !!SITE_KEY;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare global { interface Window { turnstile?: any } }

const SCRIPT_SRC = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

export default function Turnstile({ onVerify }: { onVerify: (token: string) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string | null>(null);
  const cb = useRef(onVerify);
  // 最新の onVerify を ref に保持（render 中の ref 書き込みを避けるため毎レンダー後に更新）
  useEffect(() => {
    cb.current = onVerify;
  });

  useEffect(() => {
    if (!SITE_KEY) return;
    let cancelled = false;

    const render = () => {
      if (cancelled || !window.turnstile || !ref.current || widgetId.current) return;
      widgetId.current = window.turnstile.render(ref.current, {
        sitekey: SITE_KEY,
        callback: (token: string) => cb.current(token),
        "expired-callback": () => cb.current(""),
        "error-callback": () => cb.current(""),
      });
    };

    if (window.turnstile) {
      render();
    } else {
      let s = document.querySelector<HTMLScriptElement>(`script[src="${SCRIPT_SRC}"]`);
      if (!s) {
        s = document.createElement("script");
        s.src = SCRIPT_SRC;
        s.async = true;
        document.head.appendChild(s);
      }
      s.addEventListener("load", render);
    }

    return () => {
      cancelled = true;
      if (widgetId.current && window.turnstile) {
        try { window.turnstile.remove(widgetId.current); } catch { /* noop */ }
        widgetId.current = null;
      }
    };
  }, []);

  if (!SITE_KEY) return null;
  return <div ref={ref} />;
}
