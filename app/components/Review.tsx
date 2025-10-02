import {
  LoaderSkeletonVariation,
  TypographyHeadingJumboLevel,
  TypographyHeadingJumboVariation,
} from '@digi/arbetsformedlingen';
import {
  DigiLoaderSkeleton,
  DigiTypography,
  DigiTypographyHeadingJumbo,
} from '@digi/arbetsformedlingen-react';
import { useEffect, useMemo, useState } from 'react';

import CategoryNav from '~/components/CategoryNav';
import ReviewRequirement from '~/components/ReviewRequirement';
import ReviewRequirements from '~/components/ReviewRequirements';
import { StyledLink } from '~/components/StyledLink';
import { ObjectType, type RequirementWithCheck, Status } from '~/data/types';
import { formatDateLong, formatPercentage } from '~/formattingHelper';
import { useRequirementCategories, useRequirements } from '~/hooks/useRequirementData';
import { useChecksForReview, useReviewById } from '~/hooks/useReviewData';

import Breadcrumbs from './Breadcrumbs';

interface Props {
  reviewId: string;
  requirementId?: string;
}

export default function Review({ reviewId, requirementId }: Props) {
  const { review: review, isLoading: reviewLoading } = useReviewById(reviewId);
  const { checks, isLoading: checksLoading } = useChecksForReview(reviewId);
  const { data: requirementsWeb, isLoading: requirementsWebLoading } = useRequirements(
    ObjectType.WEB,
  );
  const { data: categoriesWeb, isLoading: categoriesWebLoading } = useRequirementCategories(
    ObjectType.WEB,
  );

  const { data: requirementsDoc, isLoading: requirementsDocLoading } = useRequirements(
    ObjectType.DOCUMENT,
  );
  const { data: categoriesDoc, isLoading: categoriesDocLoading } = useRequirementCategories(
    ObjectType.DOCUMENT,
  );

  const requirements = useMemo(() => {
    if (review?.objectType === ObjectType.DOCUMENT) {
      return requirementsDoc;
    }
    return requirementsWeb;
  }, [review, requirementsWeb, requirementsDoc]);

  const categories = useMemo(() => {
    if (review?.objectType === ObjectType.DOCUMENT) {
      return categoriesDoc;
    }
    return categoriesWeb;
  }, [review, categoriesWeb, categoriesDoc]);

  const loading =
    reviewLoading ||
    checksLoading ||
    requirementsWebLoading ||
    categoriesWebLoading ||
    requirementsDocLoading ||
    categoriesDocLoading;

  const [showCategoryNav, setShowCategoryNav] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia('(min-width: 768px)').matches : false,
  );

  const categoriesWithRequirements = useMemo(() => {
    if (!categories || !requirements) return [];
    return categories.map((category) => ({
      category,
      requirements: requirements
        .filter((req) => req.category === category)
        .map((req) => {
          const check = checks?.find((check) => String(check.requirement) === String(req.id));
          return { ...req, check };
        }),
    }));
  }, [categories, requirements, checks]);

  const numberDone = useMemo(() => {
    if (!checks) return 0;
    return checks.filter((check) => check.status === Status.PASS || check.status === Status.FAIL)
      .length;
  }, [checks]);

  const numberIrrelevant = useMemo(() => {
    if (!checks) return 0;
    return checks.filter((check) => check.status === Status.IRRELEVANT).length;
  }, [checks]);

  const requirementsWithChecks = useMemo(() => {
    if (!requirements || !checks) return [];
    return requirements.map((req) => {
      const check = checks?.find((check) => String(check.requirement) === String(req.id));
      return { ...req, check };
    });
  }, [requirements, checks]);

  const nextUnhandledRequirement = (currentId: string) => {
    const currentRequirement = requirementsWithChecks.find((req) => String(req.id) === currentId);
    if (!currentRequirement || !currentRequirement.category) return undefined;
    const currentCategoryIndex = categoriesWithRequirements.findIndex(
      (cat) => cat.category === currentRequirement.category,
    );
    if (currentCategoryIndex < 0) return undefined;
    const currentCategory = categoriesWithRequirements[currentCategoryIndex];
    if (!currentCategory) return undefined;
    const currentRequirementIndex = currentCategory.requirements.findIndex(
      (req) => String(req.id) === currentId,
    );
    // First check current category for next unhandled
    for (let i = currentRequirementIndex + 1; i < currentCategory.requirements.length; i++) {
      if (
        !currentCategory.requirements[i].check ||
        currentCategory.requirements[i].check?.status === Status.NOT_ASSESSED
      ) {
        return currentCategory.requirements[i];
      }
    }
    // Next, check following categories for next unhandled
    if (currentCategoryIndex == categoriesWithRequirements.length - 1) return undefined;
    for (let i = currentCategoryIndex + 1; i < categoriesWithRequirements.length; i++) {
      const category = categoriesWithRequirements[i];
      for (const req of category.requirements) {
        if (!req.check || req.check?.status === Status.NOT_ASSESSED) {
          return req;
        }
      }
    }
  };

  const previousUnhandledRequirement = (currentId: string) => {
    const currentRequirement = requirementsWithChecks.find((req) => String(req.id) === currentId);
    if (!currentRequirement || !currentRequirement.category) return undefined;
    const currentCategoryIndex = categoriesWithRequirements.findIndex(
      (cat) => cat.category === currentRequirement.category,
    );
    if (currentCategoryIndex < 0) return undefined;
    const currentCategory = categoriesWithRequirements[currentCategoryIndex];
    if (!currentCategory) return undefined;
    const currentRequirementIndex = currentCategory.requirements.findIndex(
      (req) => String(req.id) === currentId,
    );
    // First check current category for previous unhandled
    for (let i = currentRequirementIndex - 1; i >= 0; i--) {
      if (
        !currentCategory.requirements[i].check ||
        currentCategory.requirements[i].check?.status === Status.NOT_ASSESSED
      ) {
        return currentCategory.requirements[i];
      }
    }
    if (currentCategoryIndex < 1) return undefined;
    // Next, check previous categories for previous unhandled
    for (let i = currentCategoryIndex - 1; i >= 0; i--) {
      const category = categoriesWithRequirements[i];
      for (let j = category.requirements.length - 1; j >= 0; j--) {
        const req = category.requirements[j];
        if (!req.check || req.check?.status === Status.NOT_ASSESSED) {
          return req;
        }
      }
    }
  };

  const [requirement, setRequirement] = useState<RequirementWithCheck | null>(null);

  useEffect(() => {
    const requirement = requirements?.find((req) => String(req.id) === requirementId);
    setRequirement(requirement || null);
  }, [requirements, requirementId]);

  return (
    <div className="grid">
      {loading && (
        <DigiLoaderSkeleton
          afVariation={LoaderSkeletonVariation.SECTION}
          afCount={4}
        ></DigiLoaderSkeleton>
      )}
      <div className="bg-white">
        <DigiTypography>
          {review && (
            <div className="lg:flex justify-between mb-4 bg-white p-5">
              <div>
                <Breadcrumbs
                  currentPage={
                    requirementId
                      ? requirements?.find((req) => String(req.id) === String(requirementId))
                          ?.name || 'Krav'
                      : review.title || 'Granskning'
                  }
                  pages={
                    requirementId
                      ? [
                          { title: 'Granskningar', href: '/' },
                          {
                            title: review?.title || 'Granskning',
                            href: `/granskning/${review?.id}`,
                          },
                        ]
                      : [{ title: 'Granskningar', href: '/' }]
                  }
                />
                <DigiTypographyHeadingJumbo
                  afText={review?.title || 'Granskning'}
                  afLevel={TypographyHeadingJumboLevel.H1}
                  afVariation={TypographyHeadingJumboVariation.PRIMARY}
                ></DigiTypographyHeadingJumbo>
                <p>
                  <b>Granskningsobjekt:</b> {review?.application.name}
                  <br />
                  <b>Granskning startad:</b> {formatDateLong(review?.created_at)}
                  <br />
                </p>

                <div className="flex flex-col md:flex-row gap-4 my-4">
                  <StyledLink
                    to={`/granskning/${review.id}/export/redogorelse`}
                    text="Sammanställ brister"
                    isButton={true}
                  />
                  <StyledLink
                    to={`/granskning/${review.id}/export/uppgifter`}
                    text="Exportera uppgifter (.csv)"
                    isButton={true}
                  />
                </div>
              </div>
              <div>
                {numberDone > 0 && (
                  <div className="h-32 w-32 text-white font-bold bg-[var(--digi--leaf-500)] flex items-center justify-center rounded-full">
                    <div>
                      <span className="block text-center text-[2.5rem]">
                        {requirements && requirements.length
                          ? formatPercentage((numberDone + numberIrrelevant) / requirements.length)
                          : '0%'}
                      </span>
                      <span className="block text-center">K L A R T</span>
                    </div>
                  </div>
                )}
                <div className="h-25 w-25 text-white font-bold bg-[var(--digi--stratos-500)] flex items-center justify-center rounded-full">
                  <div>
                    <span className="block text-center leading-none">BARA</span>
                    <span className="block text-center text-[2rem] leading-none">
                      {(requirements ? requirements.length - numberIrrelevant - numberDone : 0) ||
                        0}
                    </span>
                    <span className="block text-center leading-none">KVAR!</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DigiTypography>
      </div>
      {requirementId &&
        (() => {
          if (requirement && reviewId) {
            return (
              <div className="relative">
                <div
                  className={`absolute z-1 inset-y-0 left-0 ${showCategoryNav ? 'w-screen sm:w-[17rem]' : 'w-[4rem]'} overflow-y-auto bg-white`}
                >
                  <CategoryNav
                    reviewId={reviewId}
                    categories={categoriesWithRequirements}
                    selectedCategory={requirement.category}
                    selectedRequirement={requirementId}
                    showCategoryNav={showCategoryNav}
                    onToggleNav={() => setShowCategoryNav(!showCategoryNav)}
                  />
                </div>
                <div className={`${showCategoryNav ? 'ml-[17rem]' : 'ml-[4rem]'}`}>
                  <div className="content-container content-container--largest">
                    {review && (
                      <ReviewRequirement
                        key={requirement.id}
                        requirement={requirement}
                        reviewId={reviewId}
                        nextUnhandled={nextUnhandledRequirement(requirementId)}
                        previousUnhandled={previousUnhandledRequirement(requirementId)}
                      />
                    )}
                    <StyledLink
                      to={`/granskning/${reviewId}`}
                      text="Tillbaka till granskningsöversikten"
                    />
                  </div>
                </div>
              </div>
            );
          } else {
            return (
              <div>
                <p>Krav-ID: {requirementId} hittades inte.</p>
                <StyledLink
                  to={`/granskning/${reviewId}`}
                  text="Tillbaka till granskningsöversikten"
                />
              </div>
            );
          }
        })()}
      {/* Visa kravlista om det inte finns något valt krav */}
      {review && !requirementId && (
        <div className="content-container content-container--largest">
          <div className="content-container content-container--white content-container--largest">
            <ReviewRequirements
              requirements={requirementsWithChecks}
              review={review}
              categories={categories}
            />
          </div>
        </div>
      )}
    </div>
  );
}
