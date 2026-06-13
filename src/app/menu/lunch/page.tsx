import MenuLunchClient from "@/app/components/MenuLunchClient";
import { fetchLunchByStore } from "@/app/lib/menuDb";
import { fetchPublicStores } from "@/app/lib/storesDb";

export const revalidate = 60;

export const metadata = {
  title: "ランチメニュー | 焼肉平壌亭",
  description: "焼肉平壌亭のランチメニュー。特選焼肉ランチ・上焼肉重・石焼ピビンパなど、気軽に本格焼肉をお楽しみいただけます。",
};

export default async function MenuLunchPage() {
  const [lunchByStore, stores] = await Promise.all([fetchLunchByStore(), fetchPublicStores()]);
  return <MenuLunchClient lunchByStore={lunchByStore} stores={stores} />;
}
