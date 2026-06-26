import MenuCourseClient from "@/app/components/MenuCourseClient";
import { fetchCoursesByStore, fetchCourseGroupsByStore } from "@/app/lib/courseDb";
import { fetchPublicStores } from "@/app/lib/storesDb";

export const revalidate = 60;

export const metadata = {
  title: "コースメニュー | 焼肉平壌亭",
  description: "焼肉平壌亭のコースメニュー。ご宴会・ご接待・お祝いに最適なフルコース・飲み放題付コースをご用意しております。",
};

export default async function MenuCoursePage() {
  const [coursesByStore, courseGroupsByStore, stores] = await Promise.all([
    fetchCoursesByStore(),
    fetchCourseGroupsByStore(),
    fetchPublicStores(),
  ]);
  return <MenuCourseClient coursesByStore={coursesByStore} courseGroupsByStore={courseGroupsByStore} stores={stores} />;
}
