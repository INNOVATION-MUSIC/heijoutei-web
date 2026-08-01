import ContactClient from "@/app/components/ContactClient";
import { fetchPublicStores } from "@/app/lib/storesDb";
import type { Metadata } from "next";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "お問い合わせ | 焼肉平壌亭",
  description: "焼肉平壌亭（亀岡・園部・福知山・焼肉ゆらの）へのお問い合わせ。ご予約・メニュー・テイクアウト・採用などお気軽にお問い合わせください。",
  alternates: { canonical: "/contact" },
  openGraph: {
    title: "お問い合わせ | 焼肉平壌亭",
    description: "焼肉平壌亭（亀岡・園部・福知山・焼肉ゆらの）へのお問い合わせ。ご予約・メニュー・テイクアウト・採用などお気軽にお問い合わせください。",
    url: "/contact",
  },
};

export default async function ContactPage() {
  const stores = await fetchPublicStores();
  return <ContactClient stores={stores} />;
}
