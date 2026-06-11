import MenuCourseClient from "@/app/components/MenuCourseClient";
import { fetchCoursesByStore } from "@/app/lib/courseDb";

export const revalidate = 60;

export const metadata = {
  title: "コースメニュー | 焼肉平壌亭",
  description: "焼肉平壌亭のコースメニュー。ご宴会・ご接待・お祝いに最適なフルコース・飲み放題付コースをご用意しております。",
};

export default async function MenuCoursePage() {
  const coursesByStore = await fetchCoursesByStore();
  return <MenuCourseClient coursesByStore={coursesByStore} />;
}
