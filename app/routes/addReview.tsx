import { DigiLayoutContainer, DigiTypography } from "@digi/arbetsformedlingen-react";
import type { Route } from "./+types/review";
import { ReviewForm } from "~/components/ReviewForm";

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
                <h1>Skapa ny granskning</h1>
                <ReviewForm />
            </>
        </DigiTypography>
    </DigiLayoutContainer>;
}
