"use client";

import { useEffect, useRef, useState } from "react";

export default function ScaledSection({
  designWidth,
  height,
  children,
}: {
  designWidth: number;
  height: number;
  children: React.ReactNode;
}) {
  const [scale, setScale] = useState(1);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const update = () => {
      setScale(window.innerWidth / designWidth);
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [designWidth]);

  return (
    <div style={{ width: "100%", height: height * scale, position: "relative", overflow: "hidden" }}>
      <div
        ref={ref}
        style={{
          width: designWidth,
          height,
          transformOrigin: "top left",
          transform: `scale(${scale})`,
          position: "absolute",
          top: 0,
          left: 0,
        }}
      >
        {children}
      </div>
    </div>
  );
}
