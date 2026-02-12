import {
  ButtonVariation,
  ErrorPageStatusCodes,
  FormValidationMessageVariation,
  LayoutContainerVariation,
  LinkButtonVariation,
  LoaderSkeletonVariation,
  NotificationAlertSize,
  NotificationAlertVariation,
  TypographyHeadingJumboLevel,
  TypographyHeadingJumboVariation,
} from '@designsystem-se/af';
import {
  DigiButton,
  DigiFormValidationMessage,
  DigiIconComunicationFlag,
  DigiLayoutBlock,
  DigiLayoutContainer,
  DigiLinkButton,
  DigiLoaderSkeleton,
  DigiNotificationAlert,
  DigiNotificationErrorPage,
  DigiTypography,
  DigiTypographyHeadingJumbo,
  DigiTypographyPreamble,
} from '@designsystem-se/af-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';

import CategoryNav from '~/components/CategoryNav';
import { ObjectType, type RequirementWithCheck, Status } from '~/data/types';
import { formatDate, formatPercentage } from '~/helpers/formattingHelpers';
import { numberChecked, numberRemaining, percentageChecked } from '~/helpers/helpers';
import { useRequirementCategories, useRequirements } from '~/hooks/useRequirementData';
import {
  useCheck,
  useChecksForReview,
  useReviewById,
  useToggleCheckFlag,
} from '~/hooks/useReviewData';

import Breadcrumbs from './Breadcrumbs';
import CategoryOverview from './CategoryOverview';
import FilledFlag from './FilledFlag';
import PrevNextRequirement from './PrevNextRequirement';
import RequirementDetails from './RequirementDetails';
import RequirementForm from './RequirementForm';
import RequirementLegal from './RequirementLegal';
import ScreenReaderAlert from './ScreenReaderAlert';
import StatusBadge from './StatusBadge';

interface Props {
  reviewId: string;
  requirementId: string;
}

export default function ReviewRequirement({ reviewId, requirementId }: Props) {
  const { t } = useTranslation();
  const toggleCheckFlag = useToggleCheckFlag();

  const {
    review: review,
    isLoading: reviewLoading,
    isFetched: reviewFetched,
  } = useReviewById(reviewId);
  const {
    checks,
    isLoading: checksLoading,
    isFetched: checksFetched,
  } = useChecksForReview(reviewId);
  const {
    check,
    isLoading: isCheckLoading,
    isFetched: checkFetched,
  } = useCheck(String(reviewId), String(requirementId));
  const {
    data: requirementsAll,
    isLoading: requirementsAllLoading,
    isFetched: requirementsAllFetched,
  } = useRequirements(review?.regulatoryFramework || '');
  const {
    data: categoriesWeb,
    isLoading: categoriesWebLoading,
    isFetched: categoriesWebFetched,
  } = useRequirementCategories(ObjectType.WEB);
  const {
    data: categoriesDoc,
    isLoading: categoriesDocLoading,
    isFetched: categoriesDocFetched,
  } = useRequirementCategories(ObjectType.DOCUMENT);

  const requirements = useMemo(() => {
    const reqs = requirementsAll ?? [];
    if (review?.objectType === ObjectType.DOCUMENT) {
      return reqs.filter((req) => req.objectType === ObjectType.DOCUMENT);
    }
    return reqs.filter((req) => req.objectType === ObjectType.WEB);
  }, [review, requirementsAll]);

  const categories = useMemo(() => {
    if (review?.objectType === ObjectType.DOCUMENT) {
      return categoriesDoc ?? [];
    }
    return categoriesWeb ?? [];
  }, [review, categoriesWeb, categoriesDoc]);

  const loading =
    reviewLoading ||
    checksLoading ||
    requirementsAllLoading ||
    categoriesWebLoading ||
    categoriesDocLoading ||
    !reviewFetched ||
    !requirementsAllFetched;

  const fetched =
    reviewFetched &&
    checkFetched &&
    checksFetched &&
    requirementsAllFetched &&
    categoriesWebFetched &&
    categoriesDocFetched;

  const [showCategoryNav, setShowCategoryNav] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia('(min-width: 768px)').matches : false,
  );

  const categoriesWithRequirements = useMemo(() => {
    if (!categories.length || !requirements.length) return [];
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
    if (!requirements.length || !checks) return [];
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
  const [flagMessage, setFlagMessage] = useState<string>('');
  const [flagErrorMessage, setFlagErrorMessage] = useState<string>('');

  const numberInCategory =
    (categoriesWithRequirements
      .find((cat) => cat.category === requirement?.category)
      ?.requirements.findIndex((req) => String(req.id) === String(requirementId)) ?? -1) + 1;

  const totalInCategory =
    categoriesWithRequirements.find((cat) => cat.category === requirement?.category)?.requirements
      .length ?? 0;

  useEffect(() => {
    const requirement = requirements?.find((req) => String(req.id) === requirementId);
    setRequirement(requirement || null);
  }, [requirements, requirementId]);

  const mainRef = useRef<HTMLElement>(null);

  const location = useLocation();

  useEffect(() => {
    if (!location.hash) return;
    let frame = 0;
    let attempts = 0;
    const tryScroll = () => {
      const el = document.querySelector(location.hash);
      if (el) {
        el.scrollIntoView({ behavior: 'auto' });
        return;
      }
      if (attempts < 10) {
        attempts += 1;
        frame = requestAnimationFrame(tryScroll);
      }
    };
    tryScroll();
    return () => cancelAnimationFrame(frame);
  }, [requirement, location.hash]);

  const flagRequirement = (flag: boolean) => {
    setFlagErrorMessage('');
    setFlagMessage('');
    toggleCheckFlag.mutate(
      { reviewId: Number(reviewId), requirementId, flag },
      {
        onSuccess: () => {
          setFlagMessage(
            flag ? t('ReviewRequirement.FlagSet') : t('ReviewRequirement.FlagRemoved'),
          );
        },
        onError: () => {
          setFlagErrorMessage(t('ReviewRequirement.FlagError'));
        },
      },
    );
  };

  return (
    <div className="">
      {loading && (
        <div>
          <DigiLayoutBlock afMarginTop={true} afMarginBottom={true} afVerticalPadding={true}>
            <DigiLoaderSkeleton afVariation={LoaderSkeletonVariation.SECTION} afCount={4} />
          </DigiLayoutBlock>
        </div>
      )}
      {fetched && review && requirement && (
        <>
          {/* Custom PageTitle due to extra content ("balls") */}
          <DigiLayoutContainer afVariation={LayoutContainerVariation.FLUID} afNoGutter={true}>
            <DigiLayoutBlock afVerticalPadding={true}>
              <DigiTypography>
                <div className="flex flex-col md:flex-row gap-4 justify-between">
                  <div>
                    <Breadcrumbs
                      currentPage={`${t('ReviewRequirement.Review')}: ${
                        requirements?.find((req) => String(req.id) === String(requirementId))?.name
                      }`}
                      pages={[
                        { title: t('Home.Title'), href: '/' },
                        {
                          title: t('ReviewRequirements.Title', {
                            reviewTitle: review?.title || '',
                          }),
                          href: `/granskning/${review?.id}`,
                        },
                      ]}
                    />
                    <DigiTypographyHeadingJumbo
                      id="h1"
                      className="wrap-anywhere"
                      afText={t('ReviewRequirement.Title', { title: review?.title || '' })}
                      afLevel={TypographyHeadingJumboLevel.H1}
                      afVariation={TypographyHeadingJumboVariation.PRIMARY}
                    />
                    <div className="mt-5">
                      <DigiTypographyPreamble>
                        {t('ReviewRequirement.ReviewStarted')} {formatDate(review?.created_at)}
                      </DigiTypographyPreamble>
                    </div>
                  </div>
                  <div className="md:basis-[14rem] md:shrink-0 relative flex gap-1 md:block">
                    {requirements &&
                      requirements.length &&
                      numberChecked(requirementsWithChecks) > 0 && (
                        <div
                          className="md:absolute md:right-0 h-24 w-24 md:h-32 md:w-32 mt-3 md:mt-0 text-white font-bold bg-granskott-700 flex flex-col md:flex-row items-center justify-center rounded-full"
                          aria-label={t('ReviewRequirement.PercentDone', {
                            percent: formatPercentage(
                              numberChecked(requirementsWithChecks) / requirements.length,
                            ),
                          })}
                        >
                          <div aria-hidden="true">
                            <span className="block text-center text-2xl md:text-[2.5rem]">
                              {formatPercentage(
                                numberChecked(requirementsWithChecks) / requirements.length,
                              )}
                            </span>
                            <span className="block text-center">{t('ReviewRequirement.Done')}</span>
                          </div>
                        </div>
                      )}
                    {numberRemaining(requirementsWithChecks) > 0 &&
                      numberChecked(requirementsWithChecks) > 0 && (
                        <div
                          className="md:absolute md:right-26 md:top-14 h-20 w-20 md:h-25 md:w-25 text-white font-bold bg-natthimmel-800 flex items-center justify-center rounded-full"
                          aria-label={`${t('ReviewRequirement.Only')} ${numberRemaining(requirementsWithChecks)} ${t('ReviewRequirement.Remaining')}`}
                        >
                          <div aria-hidden="true">
                            <span className="block text-center leading-none">
                              {t('ReviewRequirement.Only')}
                            </span>
                            <span className="block text-center text-xl md:text-[2rem] leading-none">
                              {numberRemaining(requirementsWithChecks) || 0}
                            </span>
                            <span className="block text-center leading-none">
                              {' '}
                              {t('ReviewRequirement.Remaining')}
                            </span>
                          </div>
                        </div>
                      )}
                  </div>
                </div>
              </DigiTypography>
            </DigiLayoutBlock>
          </DigiLayoutContainer>
          <div className="">
            <DigiLayoutContainer afVerticalPadding={true}>
              <div className="relative">
                <div
                  className={`absolute z-10 inset-y-0 left-0 ${showCategoryNav ? 'w-full' : 'w-[0]'} transition-[width] duration-300 md:w-[20rem] overflow-y-auto bg-white`}
                >
                  <CategoryNav
                    reviewId={reviewId}
                    categories={categoriesWithRequirements ?? []}
                    selectedCategory={requirement?.category ?? ''}
                    selectedRequirement={requirementId}
                    showCategoryNav={showCategoryNav}
                    onToggleNav={() => {
                      setShowCategoryNav(!showCategoryNav);
                      if (showCategoryNav) {
                        document.getElementById('toggle-category-nav')?.focus();
                      }
                    }}
                    focusTrap={showCategoryNav}
                  />
                </div>
                <main className="md:ml-[21.5rem]" ref={mainRef} tabIndex={-1}>
                  <article>
                    <div>
                      {percentageChecked(requirementsWithChecks) === 100 && (
                        <div className="mb-5" role="alert">
                          <DigiNotificationAlert
                            afSize={NotificationAlertSize.LARGE}
                            afVariation={NotificationAlertVariation.SUCCESS}
                            afHeading={t('ReviewRequirements.DoneHeading')}
                          >
                            <div className="mt-6 mb-4">
                              <DigiLinkButton
                                afHref={`/granskning/${reviewId}/underkanda-krav`}
                                afHideIcon={true}
                                afVariation={LinkButtonVariation.PRIMARY}
                              >
                                {t('ReviewRequirements.GoToFailedSummary')}
                              </DigiLinkButton>
                            </div>
                          </DigiNotificationAlert>
                        </div>
                      )}
                      <CategoryOverview
                        category={
                          categoriesWithRequirements.find(
                            (cat) => cat.category === requirement?.category,
                          ) ?? { category: requirement?.category ?? '', requirements: [] }
                        }
                        onToggleCategoryNav={() => {
                          setShowCategoryNav(!showCategoryNav);
                          const closeNav = document.getElementById('close-category-nav');
                          closeNav?.focus();
                          const nav = document.getElementById('category-nav');
                          closeNav?.addEventListener('keydown', (e) => {
                            if (e.key === 'Tab' && e.shiftKey) {
                              document.getElementById('last-focusable')?.focus();
                            }
                          });
                          nav?.addEventListener('keydown', (e) => {
                            if (e.key === 'Tab' && !e.shiftKey) {
                              if (e.target && (e.target as HTMLElement).id === 'last-focusable') {
                                closeNav?.focus();
                              }
                            }
                          });
                        }}
                        isCategoryNavOpen={showCategoryNav}
                      />
                      <DigiLayoutContainer
                        afNoGutter={true}
                        afMarginTop={true}
                        afMarginBottom={true}
                      >
                        <DigiLayoutBlock afVerticalPadding={true}>
                          <DigiTypography>
                            <div className="border-b-1 border-grayscale-400 pb-5">
                              <p className="text-grayscale-700 !mb-0">
                                {t('ReviewRequirement.Showing', {
                                  number: numberInCategory,
                                  total: totalInCategory,
                                })}
                              </p>
                              <h2
                                className="skip-target flex flex-col md:flex-row md:gap-4 md:items-baseline !mb-0"
                                id={requirement.id}
                                data-skip-link-text={t('ReviewRequirement.Skip', {
                                  requirementName: requirement.name,
                                })}
                              >
                                <span>{requirement.name}</span>
                                {!isCheckLoading && (
                                  <span className="md:self-start inline-flex align-top leading-none">
                                    <StatusBadge status={check?.status} />
                                  </span>
                                )}
                              </h2>
                              <div className="flex flex-col lg:flex-row justify-between gap-5">
                                <div>
                                  <RequirementLegal headingLevel="h3" requirement={requirement} />
                                </div>
                                <div className="lg:text-right lg:basis-[20rem] lg:shrink-0 flex flex-col lg:items-end lg:pt-3">
                                  <span className="hidden lg:inline-block">
                                    <DigiButton
                                      afVariation={ButtonVariation.FUNCTION}
                                      onAfOnClick={() => flagRequirement(!check?.flag)}
                                      afAriaPressed={check?.flag || false}
                                    >
                                      <span
                                        slot="icon"
                                        style={{ display: check?.flag ? 'inline' : 'none' }}
                                      >
                                        <FilledFlag />
                                      </span>
                                      <DigiIconComunicationFlag
                                        slot="icon"
                                        style={{ display: !check?.flag ? 'inline' : 'none' }}
                                      />
                                      <span style={{ display: check?.flag ? 'inline' : 'none' }}>
                                        {t('ReviewRequirement.Flagged')}
                                      </span>
                                      <span style={{ display: !check?.flag ? 'inline' : 'none' }}>
                                        {t('ReviewRequirement.Flag')}
                                      </span>
                                    </DigiButton>
                                  </span>
                                  <span className="lg:hidden mb-3">
                                    <DigiButton
                                      afVariation={ButtonVariation.SECONDARY}
                                      onAfOnClick={() => flagRequirement(!check?.flag)}
                                      afAriaPressed={check?.flag || false}
                                    >
                                      <span
                                        slot="icon"
                                        style={{ display: check?.flag ? 'inline' : 'none' }}
                                      >
                                        <FilledFlag />
                                      </span>
                                      <DigiIconComunicationFlag
                                        slot="icon"
                                        style={{ display: !check?.flag ? 'inline' : 'none' }}
                                      />
                                      <span style={{ display: check?.flag ? 'inline' : 'none' }}>
                                        {t('ReviewRequirement.Flagged')}
                                      </span>
                                      <span style={{ display: !check?.flag ? 'inline' : 'none' }}>
                                        {t('ReviewRequirement.Flag')}
                                      </span>
                                    </DigiButton>
                                  </span>

                                  <ScreenReaderAlert
                                    updateOnChange={flagErrorMessage + flagMessage}
                                  >
                                    <div className="lg:min-h-[2rem]">
                                      {flagMessage && (
                                        <DigiFormValidationMessage
                                          afVariation={FormValidationMessageVariation.SUCCESS}
                                        >
                                          {flagMessage}
                                        </DigiFormValidationMessage>
                                      )}
                                      {flagErrorMessage && (
                                        <DigiFormValidationMessage
                                          afVariation={FormValidationMessageVariation.ERROR}
                                        >
                                          {flagErrorMessage}
                                        </DigiFormValidationMessage>
                                      )}
                                    </div>
                                  </ScreenReaderAlert>
                                </div>
                              </div>
                            </div>
                            <RequirementDetails requirement={requirement} headingLevel="h3" />
                            <RequirementForm
                              requirementId={requirement.id}
                              reviewId={reviewId}
                              textSuggestions={requirement.textSuggestions || []}
                            />
                          </DigiTypography>
                        </DigiLayoutBlock>
                      </DigiLayoutContainer>
                      <PrevNextRequirement
                        reviewId={reviewId}
                        nextUnhandled={nextUnhandledRequirement(requirementId)}
                        previousUnhandled={previousUnhandledRequirement(requirementId)}
                      />
                    </div>
                  </article>
                </main>
              </div>
            </DigiLayoutContainer>
          </div>
        </>
      )}
      {fetched && (!review || !requirement) && (
        <div className="">
          <DigiNotificationErrorPage
            afCustomHeading={t('ReviewRequirements.NotFoundHeading')}
            afHttpStatusCode={ErrorPageStatusCodes.NOT_FOUND}
          >
            <p slot="bodytext">{t('ReviewRequirements.NotFoundText')}</p>
          </DigiNotificationErrorPage>
        </div>
      )}
    </div>
  );
}
