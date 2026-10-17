import { createFileRoute } from "@tanstack/react-router";
import { canonical } from "@/lib/site";
import { ArcadeAudioProvider } from "@/lib/arcade/use-arcade-audio";
import { ShipIt } from "@/components/sim/shipit/ShipIt";

const TITLE = "Ship It Inc. — Srinivas M";
const DESCRIPTION =
  "A 3D tycoon game in the browser: start a dev agency in a garage, carry client briefs from desk to desk, ship websites by rocket and spend the money on upgrades.";

export const Route = createFileRoute("/play/ship-it")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { name: "twitter:title", content: TITLE },
      { name: "twitter:description", content: DESCRIPTION },
    ],
    links: [
      canonical("/play/ship-it"),
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Fredoka:wght@500;600;700&display=swap",
      },
    ],
  }),
  component: ShipItPage,
});

function ShipItPage() {
  return (
    <ArcadeAudioProvider>
      <ShipIt />
    </ArcadeAudioProvider>
  );
}
