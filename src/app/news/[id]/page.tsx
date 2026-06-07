import { notFound } from "next/navigation";
import NewsDetailClient from "@/app/components/NewsDetailClient";
import { NEWS_LIST_DATA, getNewsArticle } from "@/app/lib/newsData";

export function generateStaticParams() {
  return NEWS_LIST_DATA.map((n) => ({ id: n.id }));
}

export default async function NewsDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const article = getNewsArticle(id);
  if (!article) notFound();
  return <NewsDetailClient article={article} />;
}
