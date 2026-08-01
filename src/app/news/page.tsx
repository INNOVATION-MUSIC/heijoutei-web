import NewsListClient from "@/app/components/NewsListClient";
import { fetchNewsList } from "@/app/lib/newsDb";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "お知らせ | 焼肉平壌亭",
  description:
    "焼肉平壌亭からのお知らせ・最新情報の一覧です。営業案内やキャンペーン、季節のおすすめなどをご案内します。",
  alternates: { canonical: "/news" },
  openGraph: {
    title: "お知らせ | 焼肉平壌亭",
    description:
      "焼肉平壌亭からのお知らせ・最新情報の一覧です。営業案内やキャンペーン、季節のおすすめなどをご案内します。",
    url: "/news",
  },
};

export const revalidate = 60;

export default async function NewsPage() {
  const items = await fetchNewsList();
  return <NewsListClient items={items} />;
}
