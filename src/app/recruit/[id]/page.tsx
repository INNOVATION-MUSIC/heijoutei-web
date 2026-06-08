import { notFound } from "next/navigation";
import RecruitDetailClient from "@/app/components/RecruitDetailClient";
import { RECRUIT_JOBS, getRecruitJob } from "@/app/lib/recruitData";

export function generateStaticParams() {
  return RECRUIT_JOBS.map((j) => ({ id: j.id }));
}

export default async function RecruitDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const job = getRecruitJob(id);
  if (!job) notFound();
  return <RecruitDetailClient job={job} />;
}
