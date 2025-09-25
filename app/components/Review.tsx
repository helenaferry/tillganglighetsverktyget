import { useReviewById, useChecksForReview } from '~/hooks/useReviewData';
import { useRequirements, useRequirementCategories } from '~/hooks/useRequirementData';
import {
  DigiLoaderSkeleton,
  DigiFormCheckbox,
  DigiTypographyHeadingJumbo,
  DigiTypography,
} from '@digi/arbetsformedlingen-react';
import {
  FormCheckboxVariation,
  LoaderSkeletonVariation,
  TypographyHeadingJumboLevel,
  TypographyHeadingJumboVariation,
} from '@digi/arbetsformedlingen';
import { StyledLink } from '~/components/StyledLink';
import ReviewRequirement from '~/components/ReviewRequirement';
import { formatDateLong, formatPercentage } from '~/formattingHelper';
import { useEffect, useMemo, useRef, useState } from 'react';
import CategoryNav from '~/components/CategoryNav';
import { Status, type RequirementWithCheck, ObjectType } from '~/data/types';
import ReviewRequirements from '~/components/ReviewRequirements';
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
  /* TEMP hårdkoda in en kategori för dokumentkrav eftersom datat saknas i nuläget
  const { data: categoriesDoc, isLoading: categoriesDocLoading } = useRequirementCategories(
    ObjectType.DOCUMENT,
  );*/
  const categoriesDoc = ['Dokumentkrav'];
  const categoriesDocLoading = false;

  const requirements = useMemo(() => {
    if (review?.objectType === ObjectType.DOCUMENT) {
      requirementsDoc?.map((req) => {
        req.category = 'Dokumentkrav';
        return req;
      });
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

  const relevantRequirementsWithChecks = useMemo(() => {
    if (!requirements || !checks) return [];
    return requirements.map((req) => {
      const check = checks?.find((check) => String(check.requirement) === String(req.id));
      return { ...req, check };
    });
  }, [requirements, checks]);

  const allRequirementsWithChecks = useMemo(() => {
    if (!requirements || !checks) return [];
    return requirements.map((req) => {
      const check = checks?.find((check) => String(check.requirement) === String(req.id));
      return { ...req, check };
    });
  }, [requirements, checks]);

  const nextRequirementId = (currentId: string) => {
    const currentIndex = relevantRequirementsWithChecks.findIndex(
      (req: RequirementWithCheck) => String(req.id) === String(currentId),
    );
    if (currentIndex === -1) return null;
    return relevantRequirementsWithChecks[currentIndex + 1]?.id || null;
  };

  const previousRequirementId = (currentId: string) => {
    const currentIndex = relevantRequirementsWithChecks.findIndex(
      (req: RequirementWithCheck) => String(req.id) === String(currentId),
    );
    if (currentIndex === -1) return null;
    return relevantRequirementsWithChecks[currentIndex - 1]?.id || null;
  };

  const scrollPosRef = useRef<number>(0);
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
              <div className={`${showCategoryNav ? 'sm:flex sm:gap-5' : ''}`}>
                <CategoryNav
                  reviewId={reviewId}
                  categories={categoriesWithRequirements}
                  selectedCategory={requirement.category}
                  selectedRequirement={requirementId}
                  showCategoryNav={showCategoryNav}
                  onToggleNav={() => setShowCategoryNav(!showCategoryNav)}
                  onSelectCategory={() => {
                    scrollPosRef.current = window.scrollY;
                  }}
                />
                <div
                  className="content-container content-container--largest"
                  style={{ width: !showCategoryNav ? 'calc(100% - 4rem)' : '100%' }}
                >
                  {review && (
                    <ReviewRequirement
                      key={requirement.id}
                      requirement={requirement}
                      reviewId={reviewId}
                      nextRequirementId={nextRequirementId(requirementId)}
                      previousRequirementId={previousRequirementId(requirementId)}
                    />
                  )}
                  <StyledLink
                    to={`/granskning/${reviewId}`}
                    text="Tillbaka till granskningsöversikten"
                  />
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
              requirements={allRequirementsWithChecks}
              review={review}
              categories={categories}
            />
          </div>
        </div>
      )}
    </div>
  );
}
