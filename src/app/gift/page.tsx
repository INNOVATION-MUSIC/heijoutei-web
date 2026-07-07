import GiftClient from "@/app/components/GiftClient";
import { fetchGiftProducts } from "@/app/lib/giftDb";
import type { Metadata } from "next";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "ご進物・ギフト | 焼肉平壌亭",
  description:
    "焼肉平壌亭のギフト・ご進物のご案内。特選焼肉食べ比べセットや和牛焼肉セット、すき焼き・しゃぶしゃぶ用、お食事券など、大切な方への贈り物におすすめの逸品をお届けします。",
  alternates: { canonical: "/gift" },
};

export default async function GiftPage() {
  const products = await fetchGiftProducts();
  return <GiftClient products={products} />;
}
