import LegalClient from "@/app/components/LegalClient";
import { PRIVACY_DOC } from "@/app/lib/privacyData";
import type { Metadata } from "next";

const DESC = "平壌亭のウェブサイトにおける個人情報の取扱い（プライバシーポリシー）についてご案内します。";

export const metadata: Metadata = {
  title: "プライバシーポリシー | 平壌亭",
  description: DESC,
  alternates: { canonical: "/privacy" },
  openGraph: { title: "プライバシーポリシー | 平壌亭", description: DESC, url: "/privacy" },
};

export default function PrivacyPage() {
  return <LegalClient doc={PRIVACY_DOC} />;
}
