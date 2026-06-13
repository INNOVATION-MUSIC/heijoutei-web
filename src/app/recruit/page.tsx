import RecruitListClient from "@/app/components/RecruitListClient";
import { fetchRecruitList, fetchRecruitStoreTabs } from "@/app/lib/recruitDb";

export const revalidate = 60;

export default async function RecruitPage() {
  const [allJobs, storeTabs] = await Promise.all([fetchRecruitList(), fetchRecruitStoreTabs()]);
  return <RecruitListClient allJobs={allJobs} storeTabs={storeTabs} />;
}
