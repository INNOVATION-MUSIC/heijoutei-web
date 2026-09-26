import type { Metadata, Viewport } from "next";
import { SITE_URL, SITE_NAME, SITE_DESCRIPTION, IS_PRODUCTION_SITE } from "./lib/site";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "平壌亭 | 本格焼肉",
  description: SITE_DESCRIPTION,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    locale: "ja_JP",
    url: SITE_URL,
    title: "平壌亭 | 本格焼肉",
    description: SITE_DESCRIPTION,
  },
  ...(IS_PRODUCTION_SITE ? {} : { robots: { index: false, follow: false } }),
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className="h-full overflow-x-hidden">
      <body className="min-h-full bg-[#0a0a0a] overflow-x-hidden">
        {children}
        {!IS_PRODUCTION_SITE && (
          <div
            aria-hidden
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              zIndex: 2147483647,
              pointerEvents: "none",
              padding: "2px 10px",
              background: "#c62828",
              color: "#fff",
              fontFamily: "'Noto Sans JP', sans-serif",
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: "0.1em",
            }}
          >
            確認環境
          </div>
        )}
      </body>
    </html>
  );
}
