import { notFound } from "next/navigation";
import type { Metadata } from "next";
import NewsDetailClient from "@/app/components/NewsDetailClient";
import { fetchNewsArticle, fetchNewsList, fetchNewsParams } from "@/app/lib/newsDb";

export const revalidate = 60;

export async function generateStaticParams() {
  return fetchNewsParams();
}

// 本文(HTML/プレーン)から description 用に抜粋（タグ除去・整形）
function excerpt(body: string | undefined, fallback: string, max = 110): string {
  const text = (body ?? "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  if (!text) return fallback;
  return text.length > max ? `${text.slice(0, max)}…` : text;
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const article = await fetchNewsArticle(id);
  if (!article) return {};
  const title = `${article.title} | お知らせ | 焼肉平壌亭`;
  const description = excerpt(article.body, `焼肉平壌亭のお知らせ「${article.title}」をご紹介します。`);
  return {
    title,
    description,
    alternates: { canonical: `/news/${id}` },
    openGraph: {
      type: "article",
      title,
      description,
      url: `/news/${id}`,
      ...(article.heroImg ? { images: [article.heroImg] } : {}),
    },
  };
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
