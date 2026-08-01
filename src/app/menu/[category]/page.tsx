import { notFound } from "next/navigation";
import type { Metadata } from "next";
import MenuDetailClient from "@/app/components/MenuDetailClient";
import { fetchMenuCategoriesFull, fetchMenuParams } from "@/app/lib/menuDb";
import { fetchPublicStores } from "@/app/lib/storesDb";

export const revalidate = 60;

export async function generateStaticParams() {
  return fetchMenuParams();
}

export async function generateMetadata({ params }: { params: Promise<{ category: string }> }): Promise<Metadata> {
  const { category } = await params;
  const all = await fetchMenuCategoriesFull();
  const data = all.find((c) => c.slug === category);
  if (!data) return {};
  const title = `${data.title} | 焼肉平壌亭`;
  const description = `焼肉平壌亭の${data.title}。${data.items.map((i) => i.name).slice(0, 6).join("・")}など。`;
  return {
    title,
    description,
    alternates: { canonical: `/menu/${category}` },
    openGraph: { title, description, url: `/menu/${category}` },
  };
}

export default async function MenuDetailPage({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params;
  const [all, stores] = await Promise.all([fetchMenuCategoriesFull(), fetchPublicStores()]);
  const data = all.find((c) => c.slug === category);
  if (!data) notFound();
  return <MenuDetailClient category={data} allCategories={all} stores={stores} />;
}
