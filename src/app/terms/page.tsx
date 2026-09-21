import TermsClient from "@/app/components/TermsClient";
import type { Metadata } from "next";

const DESC = "焼肉平壌亭のウェブサイト上のサービス（テイクアウト注文・予約、お問い合わせ等）の利用規約です。";

export const metadata: Metadata = {
  title: "利用規約 | 焼肉平壌亭",
  description: DESC,
  alternates: { canonical: "/terms" },
  openGraph: { title: "利用規約 | 焼肉平壌亭", description: DESC, url: "/terms" },
};

export default function TermsPage() {
  return <TermsClient />;
}
