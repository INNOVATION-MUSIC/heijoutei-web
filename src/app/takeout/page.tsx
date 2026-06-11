import TakeoutClient from "@/app/components/takeout/TakeoutClient";
import { fetchTakeoutStores, fetchTakeoutMenuByStore, fetchTakeoutSlots } from "@/app/lib/takeoutOrderDb";

export const revalidate = 60;

export default async function TakeoutPage() {
  const [stores, menuByStore, slotsByStore] = await Promise.all([
    fetchTakeoutStores(),
    fetchTakeoutMenuByStore(),
    fetchTakeoutSlots(),
  ]);
  return <TakeoutClient stores={stores} menuByStore={menuByStore} slotsByStore={slotsByStore} />;
}
