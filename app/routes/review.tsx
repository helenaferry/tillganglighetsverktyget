import type { Route } from "./+types/review";
import { useParams } from "react-router-dom";
import { useFullReview, useRequirementCategories, useCategoriesWithRequirements } from '~/hooks/useReviewData'
import { DigiLayoutContainer, DigiTypography, DigiLoaderSkeleton, DigiFormCheckbox } from "@digi/arbetsformedlingen-react";
import { FormCheckboxVariation, LoaderSkeletonVariation } from "@digi/arbetsformedlingen";
import Review from "~/components/Review";
import { StyledLink } from "~/components/StyledLink";
import ReviewRequirement from "~/components/ReviewRequirement";
import { formatDate, formatPercentage } from "~/formattingHelper";
import { useMemo, useState } from "react";
import CategoryNav from "~/components/CategoryNav";
import { Status } from "~/data/types";

export function meta({ }: Route.MetaArgs) {
    return [,
        { title: "Tillgänglighetsverktyget: Granskning" },
        { name: "description", content: "Granskning" }
    ];
}

export default function ReviewPage() {
    const { id, reqId } = useParams<{ id: string, reqId?: string }>();
    const { review: review, isLoading: fullReviewLoading } = useFullReview(id ?? '');
    const [hideIrrelevant, setHideIrrelevant] = useState(true);

    const { data: categories } = useRequirementCategories();
    const categoriesWithRequirements = useCategoriesWithRequirements(categories, review?.requirements);

    const statusCounts = useMemo(() => {
        if (!review?.requirements) return {};
        return review.requirements.reduce((acc, req) => {
            const status = req.check?.status || 'Ej granskad';
            acc[status] = (acc[status] || 0) + 1;
            // Count relevant requirements
            if (status !== Status.IRRELEVANT) {
                acc.totalRelevant = (acc.totalRelevant || 0) + 1;
            }
            // Count done requirements
            if (status === Status.PASS || status === Status.FAIL) {
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
                            if (requirement && id) {
                                return (
                                    <div className="flex gap-4">
                                        <div className="w-1/4">
                                            <DigiFormCheckbox
                                                afLabel="Dölj irrelevanta krav"
                                                afChecked={hideIrrelevant}
                                                onAfOnChange={(e) => {
                                                    setHideIrrelevant(e.detail.target.checked)
                                                }}
                                                afVariation={FormCheckboxVariation.PRIMARY}
                                            />
                                            <br />
                                            <CategoryNav
                                                reviewId={id}
                                                categories={categoriesWithRequirements}
                                                selectedCategory={requirement.category}
                                                selectedRequirement={reqId}
                                                hideIrrelevant={hideIrrelevant}
                                            />
                                        </div>
                                        <div className="flex-1">
                                            {review &&
                                                <div className="content-container">
                                                    <ReviewRequirement
                                                        key={requirement.id}
                                                        requirement={requirement}
                                                        review={review}
                                                        hideIrrelevant={hideIrrelevant}
                                                    />
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
                    {/* Visa granskningsöversikt om det inte finns något valt krav */}
                    {review && !reqId && <Review review={review} />}
                </div>
            </DigiTypography>
        </DigiLayoutContainer >
    );
}
