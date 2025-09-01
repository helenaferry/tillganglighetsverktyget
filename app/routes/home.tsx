import type { Route } from "./+types/home";
import { ReviewSummary } from "~/components/ReviewSummary";

export function meta({ }: Route.MetaArgs) {
  return [
    { title: "Tillgänglighetsverktyget" },
    { name: "description", content: "Hur tillgänglig är din webbplats?" },
  ];
}

export default function Home() {
  return <ReviewSummary />;
}
