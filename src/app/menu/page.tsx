import MenuCategoryClient from "@/app/components/MenuCategoryClient";
import { fetchLunchByStore, fetchMenuCategoriesFull } from "@/app/lib/menuDb";
import { fetchCoursesByStore } from "@/app/lib/courseDb";
import { fetchTakeoutTabsByStore } from "@/app/lib/menuTakeoutDb";
import { fetchPublicStores } from "@/app/lib/storesDb";
import type { PromoAvailability, PromoKey } from "@/app/lib/menuData";
import type { Metadata } from "next";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "お品書き（メニュー） | 平壌亭",
  description: "平壌亭のお品書き。名物・肉・ホルモン・セット・ご飯もの・デザートなど、カテゴリごとにメニューをご覧いただけます。",
  alternates: { canonical: "/menu" },
  openGraph: {
    title: "お品書き（メニュー） | 平壌亭",
    description: "平壌亭のお品書き。名物・肉・ホルモン・セット・ご飯もの・デザートなど、カテゴリごとにメニューをご覧いただけます。",
    url: "/menu",
  },
};

// 下部バナーの出し分け用。各ページ（/menu/lunch・takeout・course）と同じ取得結果で、その店舗に品目があるかを見る
async function fetchPromoAvailability(): Promise<PromoAvailability> {
  const [lunch, takeout, course] = await Promise.all([fetchLunchByStore(), fetchTakeoutTabsByStore(), fetchCoursesByStore()]);
  const sources: [PromoKey, Record<string, unknown[]>][] = [["lunch", lunch], ["takeout", takeout], ["course", course]];
  const result: PromoAvailability = {};
  for (const [key, byStore] of sources) {
    for (const [slug, list] of Object.entries(byStore)) if (list.length > 0) (result[slug] ??= []).push(key);
  }
  return result;
}

export default async function MenuPage() {
  const [categories, stores, promoAvailability] = await Promise.all([fetchMenuCategoriesFull(), fetchPublicStores(), fetchPromoAvailability()]);
  return <MenuCategoryClient categories={categories} stores={stores} promoAvailability={promoAvailability} />;
}
