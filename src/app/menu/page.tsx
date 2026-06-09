import MenuCategoryClient from "@/app/components/MenuCategoryClient";

export const metadata = {
  title: "お品書き（メニュー） | 焼肉平壌亭",
  description: "焼肉平壌亭のお品書き。名物・肉・ホルモン・セット・ご飯もの・デザートなど、カテゴリごとにメニューをご覧いただけます。",
};

export default function MenuPage() {
  return <MenuCategoryClient />;
}
