import { notFound } from "next/navigation";
import StoreDetailClient from "@/app/components/StoreDetailClient";
import { fetchStoreDetail, fetchStoreParams } from "@/app/lib/storeDb";

export const revalidate = 60;

export async function generateStaticParams() {
  return fetchStoreParams();
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const store = await fetchStoreDetail(id);
  if (!store) return {};
  return {
    title: `${store.name} | 焼肉平壌亭`,
    description: `${store.name}の住所・電話番号・営業時間・アクセス・地図をご案内します。`,
  };
}

export default async function StoreDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const store = await fetchStoreDetail(id);
  if (!store) notFound();
  return <StoreDetailClient store={store} />;
}
