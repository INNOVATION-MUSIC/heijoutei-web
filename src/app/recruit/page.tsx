import RecruitListClient from "@/app/components/RecruitListClient";
import { fetchRecruitList } from "@/app/lib/recruitDb";

export const revalidate = 60;

export default async function RecruitPage() {
  const allJobs = await fetchRecruitList();
  return <RecruitListClient allJobs={allJobs} />;
}
