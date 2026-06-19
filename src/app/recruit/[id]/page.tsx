import { notFound } from "next/navigation";
import type { Metadata } from "next";
import RecruitDetailClient from "@/app/components/RecruitDetailClient";
import { fetchRecruitJob, fetchRecruitParams } from "@/app/lib/recruitDb";

export const revalidate = 60;

export async function generateStaticParams() {
  return fetchRecruitParams();
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const job = await fetchRecruitJob(id);
  if (!job) return {};
  const title = `${job.title}（${job.store}）| 採用情報 | 焼肉平壌亭`;
  const lead = (job.lead ?? "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  const description =
    (lead || job.summary.join(" ") || `焼肉平壌亭 ${job.store}「${job.title}」の募集要項です。`).slice(0, 110);
  return {
    title,
    description,
    alternates: { canonical: `/recruit/${id}` },
    openGraph: { type: "article", title, description, url: `/recruit/${id}` },
  };
}

export default async function RecruitDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const job = await fetchRecruitJob(id);
  if (!job) notFound();
  return <RecruitDetailClient job={job} />;
}
