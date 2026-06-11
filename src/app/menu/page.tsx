import MenuCategoryClient from "@/app/components/MenuCategoryClient";
import { fetchMenuCategoriesFull } from "@/app/lib/menuDb";

export const revalidate = 60;

export const metadata = {
  title: "お品書き（メニュー） | 焼肉平壌亭",
  description: "焼肉平壌亭のお品書き。名物・肉・ホルモン・セット・ご飯もの・デザートなど、カテゴリごとにメニューをご覧いただけます。",
};

export default async function MenuPage() {
  const categories = await fetchMenuCategoriesFull();
  return <MenuCategoryClient categories={categories} />;
}
