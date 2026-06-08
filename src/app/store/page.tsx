import StoreListClient from "@/app/components/StoreListClient";

export const metadata = {
  title: "店舗一覧 | 焼肉平壌亭",
  description: "焼肉平壌亭（亀岡・園部・福知山・焼肉ゆらの）の店舗一覧。各店舗の住所・電話番号・営業時間・アクセスをご案内します。",
};

export default function StorePage() {
  return <StoreListClient />;
}
