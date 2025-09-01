import { DigiLayoutContainer, DigiTypography } from "@digi/arbetsformedlingen-react";
import type { Route } from "./+types/home";
import { ReviewSummary } from "~/components/ReviewSummary";
import { StyledLink } from "~/components/StyledLink";

export function meta({ }: Route.MetaArgs) {
  return [
    { title: "Tillgänglighetsverktyget" },
    { name: "description", content: "Hur tillgänglig är din webbplats?" },
  ];
}

export default function Home() {
  return <DigiLayoutContainer afVerticalPadding>
    <DigiTypography>
      <main>
        <h1>Granskningar</h1>
        <StyledLink to="/add" text="Skapa ny granskning" isButton={true} />
        <ReviewSummary />
      </main>
    </DigiTypography>
  </DigiLayoutContainer>;
}
