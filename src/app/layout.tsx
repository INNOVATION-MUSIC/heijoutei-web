import type { Metadata, Viewport } from "next";
import { SITE_URL, SITE_NAME, SITE_DESCRIPTION } from "./lib/site";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "焼肉平壌亭 | 本格焼肉",
  description: SITE_DESCRIPTION,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    locale: "ja_JP",
    url: SITE_URL,
    title: "焼肉平壌亭 | 本格焼肉",
    description: SITE_DESCRIPTION,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className="h-full overflow-x-hidden">
      <body className="min-h-full bg-[#0a0a0a] overflow-x-hidden">{children}</body>
    </html>
  );
}
