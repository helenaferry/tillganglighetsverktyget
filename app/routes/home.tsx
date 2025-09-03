import { DigiLayoutContainer, DigiTypography } from "@digi/arbetsformedlingen-react";
import type { Route } from "./+types/home";
import { ReviewsList } from "~/components/ReviewsList";
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
        <ReviewsList />
      </main>
    </DigiTypography>
  </DigiLayoutContainer>;
}
