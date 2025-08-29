import type { Route } from "./+types/review";
import { useParams } from "react-router-dom";
import { useFullReview, useUpsertCheck } from '~/hooks/useReviewData'
import { DigiLayoutContainer, DigiTypography, DigiTable, DigiLoaderSkeleton, DigiFormSelect } from "@digi/arbetsformedlingen-react";
import { LoaderSkeletonVariation } from "@digi/arbetsformedlingen";
import type { UpsertCheckInput } from "~/data/types";

export function meta({ }: Route.MetaArgs) {
    return [,
        { title: "Tillgänglighetsverktyget: Granskning" },
        { name: "description", content: "Granskning" }
    ];
}

export default function RequirementsList() {
    const { id } = useParams<{ id: string }>();
    const { review: review, isLoading: fullReviewLoading } = useFullReview(id ?? '');
    const upsertCheck = useUpsertCheck();
    const styleFromStatus = (status: string | undefined) => {
        switch (status) {
            case 'pass':
                return "bg-[var(--digi--leaf-100)]";
            case 'fail':
                return "bg-[var(--digi--rose-50)]";
            case 'irrelevant':
                return 'bg-[var(--digi--grayscale-200)]';
            default:
                return '';
        }
    };
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
                                            <td className={styleFromStatus(req.check?.status ?? undefined)}>
                                                <DigiFormSelect
                                                    afLabel=" "
                                                    afValue={req.check?.status ?? undefined}
                                                    onAfOnSelect={(value) => {
                                                        const input: UpsertCheckInput = {
                                                            reviewId: review.id,
                                                            requirement: req.id,
                                                            status: value.detail.target.value,
                                                            comment: "",
                                                        };
                                                        upsertCheck.mutate(input, {
                                                            onError: (err) => {
                                                                console.error("Could not save check:", err);
                                                            },
                                                        });
                                                    }}
                                                >
                                                    <option>Ej granskad</option>
                                                    <option value="pass">Godkänd</option>
                                                    <option value="fail">Underkänd</option>
                                                    <option value="irrelevant">Irrelevant</option>
                                                </DigiFormSelect>
                                                {upsertCheck.isError ? "Fel vid sparande" : ""}
                                            </td>
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
