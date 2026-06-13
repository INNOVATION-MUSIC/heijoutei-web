import { notFound } from "next/navigation";
import NewsDetailClient from "@/app/components/NewsDetailClient";
import { fetchNewsArticle, fetchNewsList, fetchNewsParams } from "@/app/lib/newsDb";

export const revalidate = 60;

export async function generateStaticParams() {
  return fetchNewsParams();
}

export default async function NewsDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [article, list] = await Promise.all([fetchNewsArticle(id), fetchNewsList()]);
  if (!article) notFound();

  // 前後のお知らせは一覧（新しい順）の並びから算出。DB 記事も静的記事も同じロジックで動く。
  const idx = list.findIndex((n) => n.id === id);
  const prev = idx > 0 ? list[idx - 1] : null;
  const next = idx >= 0 && idx < list.length - 1 ? list[idx + 1] : null;
  const toNav = (n: (typeof list)[number] | null) => (n ? { id: n.id, title: n.title } : null);

  return <NewsDetailClient article={article} prev={toNav(prev)} next={toNav(next)} />;
}
