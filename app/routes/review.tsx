import type { Route } from "./+types/review";
import { useParams } from "react-router-dom";
import { useFullReview } from '~/hooks/useReviewData'
import { DigiLayoutContainer, DigiTypography, DigiTable, DigiLoaderSkeleton } from "@digi/arbetsformedlingen-react";
import { LoaderSkeletonVariation } from "@digi/arbetsformedlingen";

export function meta({ }: Route.MetaArgs) {
    return [,
        { title: "Tillgänglighetsverktyget: Granskning" },
        { name: "description", content: "Granskning" }
    ];
}

export default function RequirementsList() {
    const { id } = useParams<{ id: string }>();
    const { review: review, isLoading: fullReviewLoading } = useFullReview(id ?? '');
    return (
        <DigiLayoutContainer afVerticalPadding>
            <DigiTypography>
                <main>
                    {fullReviewLoading &&
                        <DigiLoaderSkeleton
                            afVariation={LoaderSkeletonVariation.SECTION}
                            afCount={4}
                        >
                        </DigiLoaderSkeleton>}
                    {review && <>
                        <h1>{review?.title}</h1>
                        <DigiTable>
                            <table>
                                <thead>
                                    <tr>
                                        <th scope="col">Krav</th>
                                        <th scope="col">Kommentar</th>
                                        <th scope="col">
                                            Status
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {review?.requirements?.map(req =>
                                        <tr key={req.id}>
                                            <td>
                                                {req.topic}
                                            </td>
                                            <td>{req.check?.comment}</td>
                                            <td>{req.check?.status || "Ej granskad"}</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </DigiTable>
                    </>}
                </main>
            </DigiTypography>
        </DigiLayoutContainer>
    );
}
