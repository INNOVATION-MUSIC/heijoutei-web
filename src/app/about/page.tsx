import AboutClient from "@/app/components/AboutClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "平壌亭について | 焼肉平壌亭",
  description:
    "焼肉平壌亭のこだわり・歴史をご紹介します。目利きが選ぶ上質な和牛で、京都・亀岡から特別な焼肉体験をお届けします。",
  alternates: { canonical: "/about" },
  openGraph: {
    title: "平壌亭について | 焼肉平壌亭",
    description:
      "焼肉平壌亭のこだわり・歴史をご紹介します。目利きが選ぶ上質な和牛で、京都・亀岡から特別な焼肉体験をお届けします。",
    url: "/about",
  },
};

export default function AboutPage() {
  return <AboutClient />;
}
