import { notFound } from "next/navigation";
import NewsDetailClient from "@/app/components/NewsDetailClient";
import { fetchNewsArticle, fetchNewsParams } from "@/app/lib/newsDb";

export const revalidate = 60;

export async function generateStaticParams() {
  return fetchNewsParams();
}

export default async function NewsDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const article = await fetchNewsArticle(id);
  if (!article) notFound();
  return <NewsDetailClient article={article} />;
}
