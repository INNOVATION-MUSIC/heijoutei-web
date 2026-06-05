"use client";

import { useEffect, useRef, useState } from "react";

interface Props {
  designWidth: number;
  children: React.ReactNode;
}

export default function ScaledContent({ designWidth, children }: Props) {
  const innerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [ready, setReady] = useState(false);
  const [outerHeight, setOuterHeight] = useState(0);

  useEffect(() => {
    const update = () => {
      const vw = window.innerWidth;
      const newScale = vw / designWidth;
      setScale(newScale);
      if (innerRef.current) {
        setOuterHeight(innerRef.current.offsetHeight * newScale);
      }
      setReady(true);
    };

    update();
    window.addEventListener("resize", update);
    const ro = new ResizeObserver(update);
    if (innerRef.current) ro.observe(innerRef.current);

    return () => {
      window.removeEventListener("resize", update);
      ro.disconnect();
    };
  }, [designWidth]);

  return (
    <div
      style={{
        width: "100%",
        position: "relative",
        overflow: "hidden",
        height: ready ? outerHeight : "auto",
      }}
    >
      <div
        ref={innerRef}
        style={{
          width: designWidth,
          transformOrigin: "top left",
          transform: ready ? `scale(${scale})` : "none",
          position: ready ? "absolute" : "relative",
          top: 0,
          left: 0,
        }}
      >
        {children}
      </div>
    </div>
  );
}
