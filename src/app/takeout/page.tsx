import TakeoutClient from "@/app/components/takeout/TakeoutClient";
import { fetchTakeoutStores, fetchTakeoutMenuByStore, fetchTakeoutSlots } from "@/app/lib/takeoutOrderDb";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "テイクアウトご注文 | 焼肉平壌亭",
  description:
    "焼肉平壌亭のテイクアウトをオンラインでご注文いただけます。受取日時とメニューを選んで、ご自宅で本格焼肉をお楽しみください。",
  alternates: { canonical: "/takeout" },
};

export const revalidate = 60;

export default async function TakeoutPage() {
  const [stores, menuByStore, slotsByStore] = await Promise.all([
    fetchTakeoutStores(),
    fetchTakeoutMenuByStore(),
    fetchTakeoutSlots(),
  ]);
  return <TakeoutClient stores={stores} menuByStore={menuByStore} slotsByStore={slotsByStore} />;
}
