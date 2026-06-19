import RecruitListClient from "@/app/components/RecruitListClient";
import { fetchRecruitList, fetchRecruitStoreTabs } from "@/app/lib/recruitDb";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "採用情報 | 焼肉平壌亭",
  description:
    "焼肉平壌亭の採用・求人情報です。ホール・キッチンスタッフなど、亀岡・園部・福知山の各店で一緒に働く仲間を募集しています。",
  alternates: { canonical: "/recruit" },
};

export const revalidate = 60;

export default async function RecruitPage() {
  const [allJobs, storeTabs] = await Promise.all([fetchRecruitList(), fetchRecruitStoreTabs()]);
  return <RecruitListClient allJobs={allJobs} storeTabs={storeTabs} />;
}
