import { DigiLayoutContainer, DigiTypography, DigiTypographyHeadingJumbo } from "@digi/arbetsformedlingen-react";
import type { Route } from "./+types/review";
import { ReviewForm } from "~/components/ReviewForm";
import { TypographyHeadingJumboLevel, TypographyHeadingJumboVariation } from "@digi/arbetsformedlingen";

export function meta({ }: Route.MetaArgs) {
    return [,
        { title: "Tillgänglighetsverktyget: Skapa ny granskning" },
        { name: "description", content: "Skapa ny granskning" }
    ];
}

export default function AddReview() {
    return <DigiLayoutContainer afVerticalPadding>
        <DigiTypography>
            <>
                <DigiTypographyHeadingJumbo
                    afText="Skapa ny granskning"
                    afLevel={TypographyHeadingJumboLevel.H1}
                    afVariation={TypographyHeadingJumboVariation.PRIMARY}
                ></DigiTypographyHeadingJumbo>
                <ReviewForm />
            </>
        </DigiTypography>
    </DigiLayoutContainer>;
}
