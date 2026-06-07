"use client";

import { useState } from "react";
import SplashScreen from "./SplashScreen";

export default function ClientSplash({ children }: { children: React.ReactNode }) {
  const [done, setDone] = useState(false);

  return (
    <>
      {children}
      {!done && <SplashScreen onDone={() => setDone(true)} />}
    </>
  );
}
