import type { Route } from "./+types/review";
import { useParams } from "react-router-dom";
import { useReviewById, useChecksForReview } from '~/hooks/useReviewData';
import { useRequirements, useRequirementCategories } from '~/hooks/useRequirementData';
import { DigiLayoutContainer, DigiTypography, DigiLoaderSkeleton, DigiFormCheckbox, DigiTypographyHeadingJumbo } from "@digi/arbetsformedlingen-react";
import { FormCheckboxVariation, LoaderSkeletonVariation, TypographyHeadingJumboLevel, TypographyHeadingJumboVariation } from "@digi/arbetsformedlingen";
import Review from "~/components/Review";
import { StyledLink } from "~/components/StyledLink";
import ReviewRequirement from "~/components/ReviewRequirement";
import { formatDateLong, formatPercentage } from "~/formattingHelper";
import { useMemo, useState } from "react";
import CategoryNav from "~/components/CategoryNav";
import { Status, type RequirementWithCheck } from "~/data/types";

export function meta({ }: Route.MetaArgs) {
    return [,
        { title: "Tillgänglighetsverktyget: Granskning" },
        { name: "description", content: "Granskning" }
    ];
}

export default function ReviewPage() {
    const { id, reqId } = useParams<{ id: string, reqId?: string }>();

    const { review: review, isLoading: reviewLoading } = useReviewById(id ?? '');
    const { checks, isLoading: checksLoading } = useChecksForReview(String(id) ?? '');
    const { data: requirements, isLoading: requirementsLoading } = useRequirements();
    const { data: categories, isLoading: categoriesLoading } = useRequirementCategories();
    const loading = reviewLoading || checksLoading || requirementsLoading || categoriesLoading;

    const [hideIrrelevant, setHideIrrelevant] = useState(true);

    const categoriesWithRequirements = useMemo(() => {
        if (!categories || !requirements) return [];
        return categories.map(category => ({
            category,
            requirements: requirements.filter(req => req.category === category).map(req => {
                const check = checks?.find(check => String(check.requirement) === String(req.id));
                return { ...req, check };
            })
        }));
    }, [categories, requirements, checks]);

    const numberDone = useMemo(() => {
        if (!checks) return 0;
        return checks.filter(check => (check.status === Status.PASS || check.status === Status.FAIL)).length;
    }, [checks]);

    const relevantRequirementsWithChecks = useMemo(() => {
        if (!requirements || !checks) return [];
        return requirements.map(req => {
            const check = checks?.find(check => String(check.requirement) === String(req.id));
            return { ...req, check };
        }).filter((req: RequirementWithCheck) => {
            if (!hideIrrelevant) return true;
            return !req.check || req.check.status !== Status.IRRELEVANT;
        });
    }, [requirements, checks, hideIrrelevant]);

    const allRequirementsWithChecks = useMemo(() => {
        if (!requirements || !checks) return [];
        return requirements.map(req => {
            const check = checks?.find(check => String(check.requirement) === String(req.id));
            return { ...req, check };
        });
    }, [requirements, checks]);

    const nextRequirementId = (currentId: string) => {
        const currentIndex = relevantRequirementsWithChecks.findIndex((req: RequirementWithCheck) => String(req.id) === String(currentId));
        return relevantRequirementsWithChecks[currentIndex + 1]?.id || null;
    }

    const previousRequirementId = (currentId: string) => {
        const currentIndex = relevantRequirementsWithChecks.findIndex((req: RequirementWithCheck) => String(req.id) === String(currentId));
        return relevantRequirementsWithChecks[currentIndex - 1]?.id || null;
    }

    return (
        <DigiLayoutContainer afVerticalPadding>
            <DigiTypography>
                <div>
                    {loading &&
                        <DigiLoaderSkeleton
                            afVariation={LoaderSkeletonVariation.SECTION}
                            afCount={4}
                        >
                        </DigiLoaderSkeleton>}
                    {review && <div className="md:flex justify-between mb-4">
                        <div>
                            <DigiTypographyHeadingJumbo
                                afText={review?.title || "Granskning"}
                                afLevel={TypographyHeadingJumboLevel.H1}
                                afVariation={TypographyHeadingJumboVariation.PRIMARY}
                            >
                            </DigiTypographyHeadingJumbo>
                            <p>
                                <b>Applikation:</b> {review?.application.name}<br />
                                <b>Granskning startad:</b> {formatDateLong(review?.created_at)}<br />
                            </p>
                        </div>
                        <div>
                            {numberDone > 0 && <div className="h-32 w-32 text-white font-bold bg-[var(--digi--leaf-500)] flex items-center justify-center rounded-full">
                                <div>
                                    <span className="block text-center text-[2.5rem]">{formatPercentage(numberDone / relevantRequirementsWithChecks.length) || "0%"}</span>
                                    <span className="block text-center">K L A R T</span>
                                </div>
                            </div>}
                            <div className="h-25 w-25 text-white font-bold bg-[var(--digi--stratos-500)] flex items-center justify-center rounded-full">
                                <div>
                                    <span className="block text-center leading-none">BARA</span>
                                    <span className="block text-center text-[2rem] leading-none">{relevantRequirementsWithChecks.length - numberDone || 0}</span>
                                    <span className="block text-center leading-none">KVAR!</span></div>
                            </div>
                        </div>
                    </div>}
                    {reqId && (
                        (() => {
                            const requirement = requirements?.find(req => String(req.id) === String(reqId));
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
                                                        reviewId={id}
                                                        nextRequirementId={nextRequirementId(reqId)}
                                                        previousRequirementId={previousRequirementId(reqId)}
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
                    {review && !reqId && <Review requirements={allRequirementsWithChecks} review={review} />}
                </div>
            </DigiTypography>
        </DigiLayoutContainer >
    );
}
