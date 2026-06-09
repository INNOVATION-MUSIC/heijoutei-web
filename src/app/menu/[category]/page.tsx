import { notFound } from "next/navigation";
import MenuDetailClient from "@/app/components/MenuDetailClient";
import { MENU_CATEGORIES, getMenuCategory } from "@/app/lib/menuData";

export function generateStaticParams() {
  return MENU_CATEGORIES.map((c) => ({ category: c.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params;
  const data = getMenuCategory(category);
  if (!data) return {};
  return {
    title: `${data.title} | 焼肉平壌亭`,
    description: `焼肉平壌亭の${data.title}。${data.items.map((i) => i.name).slice(0, 6).join("・")}など。`,
  };
}

export default async function MenuDetailPage({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params;
  const data = getMenuCategory(category);
  if (!data) notFound();
  return <MenuDetailClient category={data} />;
}
