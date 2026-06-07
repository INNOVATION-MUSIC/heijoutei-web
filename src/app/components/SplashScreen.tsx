"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

interface Props {
  onDone: () => void;
}

const FADE_IN  = 900;  // ロゴフェードイン（ms）
const HOLD     = 900;  // ロゴ表示ホールド（ms）
const FADE_OUT = 800;  // オーバーレイフェードアウト（ms）
const TOTAL    = FADE_IN + HOLD + FADE_OUT;

export default function SplashScreen({ onDone }: Props) {
  const [logoVisible, setLogoVisible] = useState(false);
  const [hiding, setHiding] = useState(false);
  const frameRef = useRef<number>(0);

  useEffect(() => {
    // 初期状態(opacity:0)がDOMに描画されてからトランジション開始するため2フレーム待つ
    frameRef.current = requestAnimationFrame(() => {
      frameRef.current = requestAnimationFrame(() => setLogoVisible(true));
    });

    const t1 = setTimeout(() => setHiding(true), FADE_IN + HOLD);
    const t2 = setTimeout(onDone, TOTAL);

    return () => {
      cancelAnimationFrame(frameRef.current);
      clearTimeout(t1);
      clearTimeout(t2);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 200,
        backgroundColor: "#0a0a0a",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        opacity: hiding ? 0 : 1,
        transition: hiding ? `opacity ${FADE_OUT}ms ease` : "none",
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          position: "relative",
          width: 300,
          height: 156,
          opacity: logoVisible ? 1 : 0,
          transform: logoVisible ? "scale(1)" : "scale(0.96)",
          transition: `opacity ${FADE_IN}ms ease, transform ${FADE_IN}ms ease`,
        }}
      >
        <Image
          src="/images/logo.webp"
          alt="焼肉平壌亭"
          fill
          className="object-contain"
          sizes="300px"
          priority
        />
      </div>
    </div>
  );
}
