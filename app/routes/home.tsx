import type { Route } from "./+types/home";
import { Welcome } from "../components/welcome/welcome";

export function meta({ }: Route.MetaArgs) {
  return [
    { title: "Tillgänglighetsverktyget" },
    { name: "description", content: "Hur tillgänglig är din webbplats?" },
  ];
}

export default function Home() {
  return <Welcome />;
}
