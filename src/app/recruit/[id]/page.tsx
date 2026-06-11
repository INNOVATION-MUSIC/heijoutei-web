import { notFound } from "next/navigation";
import RecruitDetailClient from "@/app/components/RecruitDetailClient";
import { fetchRecruitJob, fetchRecruitParams } from "@/app/lib/recruitDb";

export const revalidate = 60;

export async function generateStaticParams() {
  return fetchRecruitParams();
}

export default async function RecruitDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const job = await fetchRecruitJob(id);
  if (!job) notFound();
  return <RecruitDetailClient job={job} />;
}
