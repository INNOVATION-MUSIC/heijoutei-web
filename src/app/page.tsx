import ClientSplash from "./components/ClientSplash";
import ResponsivePage from "./components/ResponsivePage";
import StickyButton from "./components/StickyButton";
import { fetchTopNews } from "./lib/newsDb";
import { fetchBusinessCalendar } from "./lib/businessCalendarDb";
import { fetchTopCourses } from "./lib/courseDb";

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
