import { notFound } from "next/navigation";
import type { Metadata } from "next";
import StoreDetailClient from "@/app/components/StoreDetailClient";
import { fetchStoreDetail, fetchStoreParams } from "@/app/lib/storeDb";

export const revalidate = 60;

export async function generateStaticParams() {
  return fetchStoreParams();
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const store = await fetchStoreDetail(id);
  if (!store) return {};
  const title = `${store.name} | 焼肉平壌亭`;
  const description = `${store.name}の住所・電話番号・営業時間・アクセス・地図をご案内します。`;
  return {
    title,
    description,
    alternates: { canonical: `/store/${id}` },
    openGraph: { title, description, url: `/store/${id}` },
  };
}

export default async function StoreDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const store = await fetchStoreDetail(id);
  if (!store) notFound();
  return <StoreDetailClient store={store} />;
}
