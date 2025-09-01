import type { Route } from "./+types/review";
import { useParams } from "react-router-dom";
import { useFullReview, useUpsertCheck } from '~/hooks/useReviewData'
import { DigiLayoutContainer, DigiTypography, DigiTable, DigiLoaderSkeleton, DigiFormSelect, DigiFormInput } from "@digi/arbetsformedlingen-react";
import { LoaderSkeletonVariation } from "@digi/arbetsformedlingen";
import type { UpsertCheckInput } from "~/data/types";
import { useMemo } from "react";
import { formatDate, formatPercentage } from "~/formattingHelper";

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
    const statusCounts = useMemo(() => {
        if (!review?.requirements) return {};
        return review.requirements.reduce((acc, req) => {
            const status = req.check?.status || 'Ej granskad';
            acc[status] = (acc[status] || 0) + 1;
            // Count relevant requirements (not 'irrelevant')
            if (status !== 'irrelevant') {
                acc.totalRelevant = (acc.totalRelevant || 0) + 1;
            }
            // Count done requirements (status 'pass' or 'fail')
            if (status === 'pass' || status === 'fail') {
                acc.done = (acc.done || 0) + 1;
            }
            return acc;
        }, {} as Record<string, number>);
    }, [review]);

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
                        <p>
                            <b>Applikation:</b> {review?.application?.name}<br />
                            <b>Granskning startad:</b> {formatDate(review?.created_at)}
                        </p>
                        <p><b>Relevanta krav:</b> {statusCounts['totalRelevant'] || 0} / 96, {formatPercentage((statusCounts['totalRelevant'] || 0) / 96)}<br />
                            <b>Klara:</b> {statusCounts['done'] || 0} ({statusCounts['pass'] || 0} godkända, {statusCounts['fail'] || 0} underkända), {formatPercentage(statusCounts['done'] || 0 / statusCounts['totalRelevant'])}<br />
                            <b>Kvar att granska:</b> {statusCounts['Ej granskad'] || 0}
                        </p>
                        <DigiTable>
                            <table>
                                <thead>
                                    <tr>
                                        <th scope="col">Krav</th>
                                        <th scope="col">Status</th>
                                        <th scope="col">
                                            Kommentar
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {review?.requirements?.map(req =>
                                        <tr key={req.id}>
                                            <td>
                                                <b>{req.topic}</b><br />
                                                {req.criteria} ({req.level})<br />
                                                {req.category}
                                            </td>
                                            <td className={styleFromStatus(req.check?.status ?? undefined)}>
                                                <DigiFormSelect
                                                    afLabel=" "
                                                    afAriaLabel={`Status för krav: ${req.topic}`}
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
                                            <td>{req.check?.status &&
                                                <DigiFormInput
                                                    afValue={req.check?.comment ?? ""}
                                                    afLabel={`Kommentar för krav: ${req.topic}`}
                                                    onChange={(event) => {
                                                        const input: UpsertCheckInput = {
                                                            reviewId: review.id,
                                                            requirement: req.id,
                                                            status: (req.check?.status === 'pass' || req.check?.status === 'fail' || req.check?.status === 'irrelevant')
                                                                ? req.check?.status
                                                                : undefined,
                                                            comment: (event.target as HTMLInputElement).value,
                                                        };
                                                        upsertCheck.mutate(input, {
                                                            onError: (err) => {
                                                                console.error("Could not save check:", err);
                                                            },
                                                        });
                                                    }} />}
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </DigiTable>
                    </>}
                </main>
            </DigiTypography>
        </DigiLayoutContainer >
    );
}
