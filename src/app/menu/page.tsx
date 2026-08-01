import MenuCategoryClient from "@/app/components/MenuCategoryClient";
import { fetchMenuCategoriesFull } from "@/app/lib/menuDb";
import { fetchPublicStores } from "@/app/lib/storesDb";
import type { Metadata } from "next";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "お品書き（メニュー） | 焼肉平壌亭",
  description: "焼肉平壌亭のお品書き。名物・肉・ホルモン・セット・ご飯もの・デザートなど、カテゴリごとにメニューをご覧いただけます。",
  alternates: { canonical: "/menu" },
  openGraph: {
    title: "お品書き（メニュー） | 焼肉平壌亭",
    description: "焼肉平壌亭のお品書き。名物・肉・ホルモン・セット・ご飯もの・デザートなど、カテゴリごとにメニューをご覧いただけます。",
    url: "/menu",
  },
};

export default async function MenuPage() {
  const [categories, stores] = await Promise.all([fetchMenuCategoriesFull(), fetchPublicStores()]);
  return <MenuCategoryClient categories={categories} stores={stores} />;
}
