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
import { StyledLink } from '~/components/StyledLink';
import { ObjectType, type RequirementWithCheck, Status } from '~/data/types';
import { formatDate, formatPercentage } from '~/formattingHelpers';
import { numberChecked } from '~/helpers';
import { useRequirementCategories, useRequirements } from '~/hooks/useRequirementData';
import { useCheck, useChecksForReview, useReviewById } from '~/hooks/useReviewData';

import Breadcrumbs from './Breadcrumbs';
import CategoryOverview from './CategoryOverview';
import PrevNextRequirement from './PrevNextRequirement';
import RequirementDetails from './RequirementDetails';
import RequirementForm from './RequirementForm';
import StatusBadge from './StatusBadge';

interface Props {
  reviewId: string;
  requirementId: string;
}

export default function ReviewRequirement({ reviewId, requirementId }: Props) {
  const { review: review, isLoading: reviewLoading } = useReviewById(reviewId);
  const { checks, isLoading: checksLoading } = useChecksForReview(reviewId);
  const { check, isLoading: isCheckLoading } = useCheck(String(reviewId), String(requirementId));
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

  const requirementsWithChecks = useMemo(() => {
    if (!requirements || !checks) return [];
    return requirements.map((req) => {
      const check = checks?.find((check) => String(check.requirement) === String(req.id));
      return { ...req, check };
    });
  }, [requirements, checks]);

  const numberDone = useMemo(() => {
    if (!checks) return 0;
    return numberChecked(requirementsWithChecks);
  }, [checks]);

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

  const numberInCategory =
    categoriesWithRequirements
      .find((cat) => cat.category === requirement?.category)
      ?.requirements.findIndex((req) => String(req.id) === String(requirementId)) || 0 + 1;

  const totalInCategory =
    categoriesWithRequirements.find((cat) => cat.category === requirement?.category)?.requirements
      .length || 0;

  useEffect(() => {
    const requirement = requirements?.find((req) => String(req.id) === requirementId);
    setRequirement(requirement || null);
  }, [requirements, requirementId]);

  return (
    <div className="grid">
      {loading && (
        <DigiLoaderSkeleton
          className="m-5"
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
                  className="wrap-anywhere"
                  afText={review?.title || 'Granskning'}
                  afLevel={TypographyHeadingJumboLevel.H1}
                  afVariation={TypographyHeadingJumboVariation.PRIMARY}
                ></DigiTypographyHeadingJumbo>
                <strong>Granskning startades {formatDate(review?.created_at)}</strong>
              </div>
              <div className="hidden lg:block basis-[14rem] shrink-0 relative">
                {numberDone > 0 && (
                  <div className="absolute right-0 h-32 w-32 text-white font-bold bg-[var(--digi--leaf-500)] flex items-center justify-center rounded-full">
                    <div>
                      <span className="block text-center text-[2.5rem]">
                        {requirements && requirements.length
                          ? formatPercentage(numberDone / requirements.length)
                          : '0%'}
                      </span>
                      <span className="block text-center">K L A R T</span>
                    </div>
                  </div>
                )}
                <div className="absolute right-26 top-14 h-25 w-25 text-white font-bold bg-[var(--digi--stratos-500)] flex items-center justify-center rounded-full">
                  <div>
                    <span className="block text-center leading-none">BARA</span>
                    <span className="block text-center text-[2rem] leading-none">
                      {(requirements ? requirements.length - numberDone : 0) || 0}
                    </span>
                    <span className="block text-center leading-none">KVAR!</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DigiTypography>
      </div>
      {(() => {
        if (requirement && reviewId) {
          return (
            <div className="relative">
              <div
                className={`absolute z-1 inset-y-0 left-0 ${showCategoryNav ? 'w-screen' : 'w-[0]'} transition-[width] duration-300 sm:w-[17rem] overflow-y-auto bg-white`}
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
              <div className="sm:ml-[17rem]">
                <div className="content-container content-container--largest">
                  {review && (
                    <>
                      <CategoryOverview
                        category={categoriesWithRequirements.find(
                          (cat) => cat.category === requirement.category,
                        )}
                        onToggleCategoryNav={() => setShowCategoryNav(!showCategoryNav)}
                      />
                      <div className="content-container content-container--white content-container--largest">
                        <DigiTypography>
                          <div className="border-b-1 border-grayscale-400 pb-5">
                            <p className="text-grayscale-700">
                              Krav {numberInCategory} av {totalInCategory}
                            </p>
                            <div className="w-full flex flex-col sm:flex-row gap-4 justify-between">
                              <h3>{requirement.name}</h3>
                              <div>{!isCheckLoading && <StatusBadge status={check?.status} />}</div>
                            </div>
                            <h4 className="!mt-4">Lagkrav och riktlinjer</h4>
                            <div className="flex flex-wrap gap-2 mt-2 mb-4">
                              {requirement.en301549 &&
                                requirement.en301549.length > 0 &&
                                requirement.en301549.split(',').map((text, index) => (
                                  <div
                                    className="bg-grayscale-200 rounded-sm py-2 px-4"
                                    key={index}
                                  >
                                    {`EN ${text}`}
                                  </div>
                                ))}
                              {requirement.wcag &&
                                requirement.wcag.length > 0 &&
                                requirement.wcag.split(',').map((text, index) => (
                                  <div
                                    className="bg-grayscale-200 rounded-sm py-2 px-4"
                                    key={index}
                                  >
                                    {`WCAG ${text}`}
                                  </div>
                                ))}
                            </div>
                          </div>
                          <div className="flex flex-col md:flex-row my-5 gap-5">
                            <div className="flex-1">
                              <RequirementDetails requirement={requirement} />
                            </div>
                            <div className="flex-1">
                              <RequirementForm requirementId={requirement.id} reviewId={reviewId} />
                            </div>
                          </div>
                        </DigiTypography>
                      </div>
                      <PrevNextRequirement
                        reviewId={reviewId}
                        nextUnhandled={nextUnhandledRequirement(requirementId)}
                        previousUnhandled={previousUnhandledRequirement(requirementId)}
                      />
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        } else {
          return (
            <div className="content-container content-container--white content-container--largest p-5">
              <p>Krav med id {requirementId} hittades inte.</p>
              <StyledLink
                to={`/granskning/${reviewId}`}
                text="Tillbaka till granskningsöversikten"
              />
            </div>
          );
        }
      })()}
    </div>
  );
}
