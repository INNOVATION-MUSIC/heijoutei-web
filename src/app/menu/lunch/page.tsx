import MenuLunchClient from "@/app/components/MenuLunchClient";
import { fetchLunchByStore, fetchLunchGroupsByStore } from "@/app/lib/menuDb";
import { fetchPublicStores } from "@/app/lib/storesDb";

export const revalidate = 60;

export const metadata = {
  title: "ランチメニュー | 焼肉平壌亭",
  description: "焼肉平壌亭のランチメニュー。特選焼肉ランチ・上焼肉重・石焼ピビンパなど、気軽に本格焼肉をお楽しみいただけます。",
};

export default async function MenuLunchPage() {
  const [lunchByStore, lunchGroupsByStore, stores] = await Promise.all([
    fetchLunchByStore(),
    fetchLunchGroupsByStore(),
    fetchPublicStores(),
  ]);
  return <MenuLunchClient lunchByStore={lunchByStore} lunchGroupsByStore={lunchGroupsByStore} stores={stores} />;
}
