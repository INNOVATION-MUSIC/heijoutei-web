import MenuTakeoutClient from "@/app/components/MenuTakeoutClient";
import { fetchTakeoutTabsByStore } from "@/app/lib/menuTakeoutDb";
import { fetchPublicStores } from "@/app/lib/storesDb";

export const revalidate = 60;

export const metadata = {
  title: "テイクアウトメニュー | 焼肉平壌亭",
  description: "焼肉平壌亭のテイクアウトメニュー。焼肉弁当・お惣菜・お家で焼肉セット・BBQセットなど、ご自宅で本格焼肉をお楽しみいただけます。",
};

export default async function MenuTakeoutPage() {
  const [tabsByStore, stores] = await Promise.all([fetchTakeoutTabsByStore(), fetchPublicStores()]);
  return <MenuTakeoutClient tabsByStore={tabsByStore} stores={stores} />;
}
