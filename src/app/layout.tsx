import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "焼肉平壌亭 | 本格炭火焼肉",
  description: "本格炭火焼肉で、特別なひとときを。京都・亀岡、園部、福知山で愛される焼肉平壌亭の公式サイト。",
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
