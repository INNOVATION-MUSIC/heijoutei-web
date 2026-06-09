import { notFound } from "next/navigation";
import StoreDetailClient from "@/app/components/StoreDetailClient";
import { STORE_DETAILS, getStoreDetail } from "@/app/lib/storeDetailData";

export function generateStaticParams() {
  return STORE_DETAILS.map((s) => ({ id: s.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const store = getStoreDetail(id);
  if (!store) return {};
  return {
    title: `${store.name} | 焼肉平壌亭`,
    description: `${store.name}の住所・電話番号・営業時間・アクセス・地図をご案内します。`,
  };
}

export default async function StoreDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const store = getStoreDetail(id);
  if (!store) notFound();
  return <StoreDetailClient store={store} />;
}
