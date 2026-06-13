import MenuCategoryClient from "@/app/components/MenuCategoryClient";
import { fetchMenuCategoriesFull } from "@/app/lib/menuDb";
import { fetchPublicStores } from "@/app/lib/storesDb";

export const revalidate = 60;

export const metadata = {
  title: "お品書き（メニュー） | 焼肉平壌亭",
  description: "焼肉平壌亭のお品書き。名物・肉・ホルモン・セット・ご飯もの・デザートなど、カテゴリごとにメニューをご覧いただけます。",
};

export default async function MenuPage() {
  const [categories, stores] = await Promise.all([fetchMenuCategoriesFull(), fetchPublicStores()]);
  return <MenuCategoryClient categories={categories} stores={stores} />;
}
