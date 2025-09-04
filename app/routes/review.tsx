import type { Route } from "./+types/review";
import { useParams } from "react-router-dom";
import { useFullReview, useRequirementCategories, useCategoriesWithRequirements } from '~/hooks/useReviewData'
import { DigiLayoutContainer, DigiTypography, DigiLoaderSkeleton, DigiExpandableAccordion } from "@digi/arbetsformedlingen-react";
import { LoaderSkeletonVariation } from "@digi/arbetsformedlingen";
import Review from "~/components/Review";
import { StyledLink } from "~/components/StyledLink";
import ReviewRequirement from "~/components/ReviewRequirement";
import { formatDate, formatPercentage } from "~/formattingHelper";
import { useMemo } from "react";

export function meta({ }: Route.MetaArgs) {
    return [,
        { title: "Tillgänglighetsverktyget: Granskning" },
        { name: "description", content: "Granskning" }
    ];
}

export default function ReviewPage() {
    const { id, reqId } = useParams<{ id: string, reqId?: string }>();
    const { review: review, isLoading: fullReviewLoading } = useFullReview(id ?? '');

    const { data: categories } = useRequirementCategories();
    const categoriesWithRequirements = useCategoriesWithRequirements(categories, review?.requirements);

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
            // Count all checks
            if (req.check) {
                acc.totalChecks = (acc.totalChecks || 0) + 1;
            }
            return acc;
        }, {} as Record<string, number>);
    }, [review]);

    return (
        <DigiLayoutContainer afVerticalPadding>
            <DigiTypography>
                <div>
                    {fullReviewLoading &&
                        <DigiLoaderSkeleton
                            afVariation={LoaderSkeletonVariation.SECTION}
                            afCount={4}
                        >
                        </DigiLoaderSkeleton>}
                    {review && <div className="md:flex justify-between">
                        <div>
                            <h1>{review?.title}</h1>
                            <p>
                                <b>Applikation:</b> {review?.application?.name}<br />
                                <b>Granskning startad:</b> {formatDate(review?.created_at)}<br />
                                <b>Relevanta krav:</b> {statusCounts['totalRelevant'] || 0} / 96, {formatPercentage((statusCounts['totalRelevant'] || 0) / 96)}<br />
                            </p>
                        </div>
                        <div>
                            {statusCounts['done'] > 0 && <div className="h-32 w-32 text-white font-bold bg-[var(--digi--leaf-500)] flex items-center justify-center rounded-full">
                                <div>
                                    <span className="block text-center text-[2.5rem]">{formatPercentage(statusCounts['done'] / statusCounts['totalRelevant']) || "0%"}</span>
                                    <span className="block text-center">K L A R T</span>
                                </div>
                            </div>}
                            <div className="h-25 w-25 text-white font-bold bg-[var(--digi--stratos-500)] flex items-center justify-center rounded-full">
                                <div>
                                    <span className="block text-center leading-none">BARA</span>
                                    <span className="block text-center text-[2rem] leading-none">{statusCounts['Ej granskad'] || 0}</span>
                                    <span className="block text-center leading-none">KVAR!</span></div>
                            </div>
                        </div>
                    </div>}
                    {reqId && (
                        (() => {
                            const requirement = review?.requirements.find(req => String(req.id) === String(reqId));
                            if (requirement) {
                                return (
                                    <div className="flex gap-4">
                                        <div className="w-1/4">
                                            {categoriesWithRequirements.map(category =>
                                                <DigiExpandableAccordion
                                                    afHeading={category.category}
                                                    afExpanded={requirement.category === category.category}
                                                >
                                                    <ul>
                                                        {category.requirements.map(catReq => (
                                                            <li key={catReq.id} className="flex gap-2">
                                                                <div className="w-[1rem]">{reqId == catReq.id && <span>&raquo;</span>}</div>
                                                                <StyledLink text={catReq.topic} to={`/review/${id}/${catReq.id}`} />
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </DigiExpandableAccordion>
                                            )}
                                        </div>
                                        <div>
                                            {review &&
                                                <div className="content-container">
                                                    <ReviewRequirement requirement={requirement} review={review} />
                                                </div>}
                                            <StyledLink to={`/review/${id}`} text="Tillbaka till granskningsöversikten" />
                                        </div>
                                    </div>
                                );
                            } else {
                                return (
                                    <div>
                                        <p>Krav-ID: {reqId} hittades inte.</p>
                                        <StyledLink to={`/review/${id}`} text="Tillbaka till granskningsöversikten" />
                                    </div>
                                );
                            }
                        })()
                    )}
                    {/* Visa granskningsöversikt */}
                    {review && !reqId && <Review review={review} />}
                </div>
            </DigiTypography>
        </DigiLayoutContainer >
    );
}
