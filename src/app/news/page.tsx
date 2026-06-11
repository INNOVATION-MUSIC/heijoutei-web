import NewsListClient from "@/app/components/NewsListClient";
import { fetchNewsList } from "@/app/lib/newsDb";

export const revalidate = 60;

export default async function NewsPage() {
  const items = await fetchNewsList();
  return <NewsListClient items={items} />;
}
