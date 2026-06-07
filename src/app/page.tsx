import ClientSplash from "./components/ClientSplash";
import ResponsivePage from "./components/ResponsivePage";
import StickyButton from "./components/StickyButton";

export default function Home() {
  return (
    <ClientSplash>
      <ResponsivePage />
      <StickyButton />
    </ClientSplash>
  );
}
