import ClientSplash from "./components/ClientSplash";
import ResponsivePage from "./components/ResponsivePage";
import StickyButton from "./components/StickyButton";
import { fetchTopNews } from "./lib/newsDb";
import { fetchBusinessCalendar } from "./lib/businessCalendarDb";
import { fetchTopCourses } from "./lib/courseDb";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "焼肉平壌亭 | 本格焼肉（亀岡・園部・福知山）",
  description:
    "創業50年。受け継がれる伝統と、変わらない美味しさ。京都・亀岡、園部、福知山で愛される焼肉平壌亭の公式サイト。お品書き・コース・テイクアウト・店舗情報・ご予約はこちら。",
  alternates: { canonical: "/" },
};

export const revalidate = 60;

export default async function Home() {
  const [topNews, businessMonths, topCourses] = await Promise.all([
    fetchTopNews(),
    fetchBusinessCalendar(),
    fetchTopCourses(),
  ]);
  return (
    <ClientSplash>
      <ResponsivePage topNews={topNews} businessMonths={businessMonths} topCourses={topCourses} />
      <StickyButton />
    </ClientSplash>
  );
}
