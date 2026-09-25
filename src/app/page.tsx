import ClientSplash from "./components/ClientSplash";
import ResponsivePage from "./components/ResponsivePage";
import StickyButton from "./components/StickyButton";
import { fetchTopNews } from "./lib/newsDb";
import { fetchBusinessCalendar } from "./lib/businessCalendarDb";
import { fetchTopCourses } from "./lib/courseDb";
import { fetchStoreLineLinks, fetchStoreImages } from "./lib/storeDb";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "平壌亭 | 本格焼肉（亀岡・園部・福知山・焼肉ゆらの）",
  description:
    "創業50年以上。京都の亀岡・園部・福知山に5店舗を構える焼肉店、平壌亭の公式サイト。平壌亭 亀岡店・園部店・福知山店、焼肉ゆらの、KOPU29のお品書き・コース・テイクアウト・ご予約はこちら。",
  alternates: { canonical: "/" },
  openGraph: {
    title: "平壌亭 | 本格焼肉（亀岡・園部・福知山・焼肉ゆらの）",
    description:
      "創業50年以上。京都の亀岡・園部・福知山に5店舗を構える焼肉店、平壌亭の公式サイト。平壌亭 亀岡店・園部店・福知山店、焼肉ゆらの、KOPU29のお品書き・コース・テイクアウト・ご予約はこちら。",
    url: "/",
  },
};

export const revalidate = 60;

export default async function Home() {
  const [topNews, businessMonths, topCourses, lineLinks, storeImages] = await Promise.all([
    fetchTopNews(),
    fetchBusinessCalendar(),
    fetchTopCourses(),
    fetchStoreLineLinks(),
    fetchStoreImages(),
  ]);
  return (
    <ClientSplash>
      <ResponsivePage topNews={topNews} businessMonths={businessMonths} topCourses={topCourses} lineLinks={lineLinks} storeImages={storeImages} />
      <StickyButton />
    </ClientSplash>
  );
}
