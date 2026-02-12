import {
  ErrorPageStatusCodes,
  LayoutBlockVariation,
  LinkButtonVariation,
  LoaderSkeletonVariation,
  NotificationAlertSize,
  NotificationAlertVariation,
} from '@designsystem-se/af';
import {
  DigiFormCheckbox,
  DigiLayoutBlock,
  DigiLayoutContainer,
  DigiLink,
  DigiLinkButton,
  DigiLoaderSkeleton,
  DigiNotificationAlert,
  DigiNotificationErrorPage,
} from '@designsystem-se/af-react';
import { DigiIconChevronRight } from '@designsystem-se/af-react';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';

import { ObjectType, type Requirement, Status, StatusText } from '~/data/types';
import { numberChecked, numberPerStatus, percentageChecked } from '~/helpers/helpers';
import { useRequirementCategories, useRequirements } from '~/hooks/useRequirementData';
import { useChecksForReview, useReviewById } from '~/hooks/useReviewData';

import { CardsOrTable } from './CardsOrTable';
import FilledFlag from './FilledFlag';
import PageTitle from './PageTitle';
import ProgressBar from './ProgressBar';
import { SortButton } from './SortButton';
import StatusBadge from './StatusBadge';

interface Props {
  reviewId: string;
}

export default function ReviewRequirements({ reviewId }: Props) {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
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
      return categoriesDoc;
    }
    return categoriesWeb;
  }, [review, categoriesWeb, categoriesDoc]);

  const loading =
    reviewLoading ||
    checksLoading ||
    requirementsAllLoading ||
    categoriesWebLoading ||
    categoriesDocLoading;

  const fetched =
    reviewFetched &&
    checksFetched &&
    requirementsAllFetched &&
    categoriesWebFetched &&
    categoriesDocFetched;

  const requirementsWithChecks = useMemo(() => {
    if (!requirements || !checks) return [];
    return requirements.map((req) => {
      const check = checks?.find((check) => String(check.requirement) === String(req.id));
      return { ...req, check };
    });
  }, [requirements, checks]);

  const firstUncheckedId = useMemo(() => {
    const categoriesInOrder = new Set<string>();
    for (const req of requirements) {
      categoriesInOrder.add(req.category);
    }
    for (const category of categoriesInOrder) {
      const reqInCategory = requirementsWithChecks.find(
        (req) =>
          req.category === category && (!req.check || req.check.status === Status.NOT_ASSESSED),
      );
      if (reqInCategory) {
        return reqInCategory.id;
      }
    }
    return null;
  }, [requirements, checks]);

  enum SortBy {
    REQUIREMENT = 0,
    CATEGORY = 2,
    STATUS = 3,
  }

  const [filterCategories, setFilterCategories] = useState<string[]>([]);
  const [filterStatus, setFilterStatus] = useState<Status[]>([]);
  const [filterFreeText, setFilterFreeText] = useState<string>('');
  const [filterFlagged, setFilterFlagged] = useState<boolean>(true);
  const [sortBy, setSortBy] = useState<SortBy | undefined>(undefined);
  const [sortDirection, setSortDirection] = useState<'stigande' | 'fallande'>('fallande');

  useEffect(() => {
    const categoriesSearchParam = searchParams.get('kategorier');
    const searchSearchParam = searchParams.get('sok');
    const statusSearchParam = searchParams.get('status');
    const sortParam = searchParams.get('sortering');
    const directionParam = searchParams.get('riktning');
    const flaggedParam = searchParams.get('flaggade');
    if (!categoriesSearchParam) {
      setFilterCategories([]);
    } else {
      setFilterCategories(categoriesSearchParam.split(','));
    }
    if (!searchSearchParam) {
      setFilterFreeText('');
    } else {
      setFilterFreeText(searchSearchParam);
    }
    if (!statusSearchParam) {
      setFilterStatus([]);
    } else {
      const statusArray = statusSearchParam.split(',').map((s) => Number(s) as Status);
      setFilterStatus(statusArray);
    }
    if (sortParam) {
      const sortByParam = sortParam;
      if (sortByParam) {
        setSortBy(parseInt(sortByParam));
      }
    }
    if (directionParam === 'stigande' || directionParam === 'fallande') {
      setSortDirection(directionParam);
    }
    if (flaggedParam === 'true') {
      setFilterFlagged(true);
    } else {
      setFilterFlagged(false);
    }
  }, [searchParams]);

  const setUrlParams = (
    search: string,
    categories: string[],
    statuses: Status[],
    sort: SortBy | undefined,
    direction: 'stigande' | 'fallande',
    flagged: boolean,
  ) => {
    const params: Record<string, string> = {};
    if (search) params.sok = search;
    if (categories.length > 0) params.kategorier = categories.join(',');
    if (statuses.length > 0) params.status = statuses.join(',');
    if (sort !== undefined) params.sortering = sort.toString();
    if (sort !== undefined && direction) params.riktning = direction;
    if (flagged) params.flaggade = 'true';
    window.history.replaceState(
      {},
      '',
      `${window.location.pathname}?${new URLSearchParams(params).toString()}`,
    );
  };

  const searchMatches = (requirement: Requirement, search: string) => {
    const nameMatch = requirement.name.toLowerCase().includes(search.toLowerCase());
    const wcagMatch =
      requirement.wcag?.match(/\d+\.\d+\.\d+/g)?.some((num) => num === search) ?? false;
    const enMatch = (requirement.en301549 ?? '')
      .split(',')
      .map((num) => num.trim())
      .some((num) => num === search);
    return nameMatch || wcagMatch || enMatch;
  };

  const filteredRequirements = useMemo(() => {
    let result = requirementsWithChecks || [];
    if (filterFlagged) {
      result = result.filter((req) => req.check?.flag === true);
    }
    if (filterCategories.length > 0) {
      result = result.filter((req) => filterCategories.includes(req.category));
    }
    if (filterStatus.length > 0) {
      result = result.filter((req) =>
        filterStatus.includes(req.check?.status ?? Status.NOT_ASSESSED),
      );
    }
    if (filterFreeText && filterFreeText.length > 0) {
      result = result.filter((req) => searchMatches(req, filterFreeText));
    }
    if (sortBy !== undefined) {
      result = [...result].sort((a, b) => {
        if (sortBy === SortBy.REQUIREMENT && sortDirection === 'stigande') {
          return a.name.localeCompare(b.name);
        } else if (sortBy === SortBy.REQUIREMENT && sortDirection === 'fallande') {
          return b.name.localeCompare(a.name);
        } else if (sortBy === SortBy.CATEGORY && sortDirection === 'stigande') {
          return a.category.localeCompare(b.category);
        } else if (sortBy === SortBy.CATEGORY && sortDirection === 'fallande') {
          return b.category.localeCompare(a.category);
        } else if (sortBy === SortBy.STATUS && sortDirection === 'stigande') {
          return (
            (a.check?.status ?? Status.NOT_ASSESSED) - (b.check?.status ?? Status.NOT_ASSESSED)
          );
        } else if (sortBy === SortBy.STATUS && sortDirection === 'fallande') {
          return (
            (b.check?.status ?? Status.NOT_ASSESSED) - (a.check?.status ?? Status.NOT_ASSESSED)
          );
        }
        return 0;
      });
    }
    return result;
  }, [
    requirementsWithChecks,
    filterCategories,
    filterStatus,
    filterFreeText,
    sortBy,
    sortDirection,
    filterFlagged,
  ]);

  const setSort = (field: SortBy | undefined) => {
    if (field === sortBy) {
      setSortDirection(sortDirection === 'stigande' ? 'fallande' : 'stigande');
    } else {
      setSortBy(field);
      setSortDirection('fallande');
    }
    setUrlParams(
      filterFreeText,
      filterCategories,
      filterStatus,
      field,
      field === sortBy ? (sortDirection === 'stigande' ? 'fallande' : 'stigande') : 'fallande',
      filterFlagged,
    );
  };

  const clearAll = () => {
    setFilterCategories([]);
    setFilterStatus([]);
    setFilterFreeText('');
    setSort(undefined);
    setFilterFlagged(false);
    window.history.replaceState({}, '', window.location.pathname);
  };

  return (
    <main>
      {loading && (
        <div>
          <DigiLayoutBlock afMarginTop={true} afMarginBottom={true} afVerticalPadding={true}>
            <DigiLoaderSkeleton
              afVariation={LoaderSkeletonVariation.SECTION}
              afCount={4}
            ></DigiLoaderSkeleton>
          </DigiLayoutBlock>
        </div>
      )}
      {fetched && review && (
        <>
          <PageTitle
            h1Text={t('ReviewRequirements.Title', { reviewTitle: review?.title || t('Review') })}
            preamble={t('ReviewRequirements.Preamble')}
            breadcrumbsCurrentPage={t('ReviewRequirements.Title', {
              reviewTitle: review?.title || t('Review'),
            })}
            breadcrumbsPages={[{ title: t('Home.Title'), href: '/' }]}
          />

          <div>
            {percentageChecked(requirementsWithChecks) === 100 && (
              <DigiLayoutBlock
                afVariation={LayoutBlockVariation.TRANSPARENT}
                afMarginTop={true}
                afMarginBottom={false}
              >
                <div role="alert" className="max-w-p-medium">
                  <DigiNotificationAlert
                    afSize={NotificationAlertSize.LARGE}
                    afVariation={NotificationAlertVariation.SUCCESS}
                    afHeading={t('ReviewRequirements.DoneHeading')}
                  >
                    <div className="mt-6 mb-4">
                      <DigiLinkButton
                        afHref={`/granskning/${review.id}/underkanda-krav`}
                        afVariation={LinkButtonVariation.PRIMARY}
                        afHideIcon={true}
                      >
                        {t('ReviewRequirements.GoToFailedSummary')}
                      </DigiLinkButton>
                    </div>
                  </DigiNotificationAlert>
                </div>
              </DigiLayoutBlock>
            )}
            <DigiLayoutContainer
              afVerticalPadding={false}
              afMarginTop={true}
              afMarginBottom={false}
            >
              <DigiLayoutBlock
                afVariation={LayoutBlockVariation.PRIMARY}
                afMarginBottom={false}
                afVerticalPadding={true}
              >
                <div className="flex flex-col sm:flex-row mb-6">
                  <div className="basis-1/4">
                    <div className="flex flex-col items-center">
                      <span className="sr-only">
                        {numberPerStatus(requirementsWithChecks).notAssessedCount}{' '}
                        {t('ReviewRequirements.StatusLabelNotAssessed')}
                      </span>
                      <p className="!text-2xl !mb-2" aria-hidden="true">
                        {numberPerStatus(requirementsWithChecks).notAssessedCount}
                      </p>
                      <div aria-hidden="true">
                        <StatusBadge status={Status.NOT_ASSESSED} plural noMinWidth />
                      </div>
                    </div>
                  </div>
                  <div className="basis-1/4">
                    <div className="flex flex-col items-center">
                      <span className="sr-only">
                        {numberPerStatus(requirementsWithChecks).passCount}{' '}
                        {t('ReviewRequirements.StatusLabelPass')}
                      </span>
                      <p className="!text-2xl !mb-2" aria-hidden="true">
                        {numberPerStatus(requirementsWithChecks).passCount}
                      </p>
                      <div aria-hidden="true">
                        <StatusBadge status={Status.PASS} plural noMinWidth />
                      </div>
                    </div>
                  </div>
                  <div className="basis-1/4">
                    <div className="flex flex-col items-center">
                      <span className="sr-only">
                        {numberPerStatus(requirementsWithChecks).failCount}{' '}
                        {t('ReviewRequirements.StatusLabelFail')}
                      </span>
                      <p className="!text-2xl !mb-2" aria-hidden="true">
                        {numberPerStatus(requirementsWithChecks).failCount}
                      </p>
                      <div aria-hidden="true">
                        <StatusBadge status={Status.FAIL} plural noMinWidth />
                      </div>
                    </div>
                  </div>
                  <div className="basis-1/4">
                    <div className="flex flex-col items-center">
                      <span className="sr-only">
                        {numberPerStatus(requirementsWithChecks).irrelevantCount}{' '}
                        {t('ReviewRequirements.StatusLabelIrrelevant')}
                      </span>
                      <p className="!text-2xl !mb-2" aria-hidden="true">
                        {numberPerStatus(requirementsWithChecks).irrelevantCount}
                      </p>
                      <div aria-hidden="true">
                        <StatusBadge status={Status.IRRELEVANT} plural noMinWidth />
                      </div>
                    </div>
                  </div>
                </div>
                <ProgressBar
                  progress={percentageChecked(requirementsWithChecks)}
                  text={t('ReviewRequirements.ProgressText', {
                    checked: numberChecked(requirementsWithChecks),
                    total: requirements?.length,
                  })}
                />
                <div className="flex flex-col md:flex-row gap-4 mt-10 mb-4">
                  {firstUncheckedId && (
                    <DigiLinkButton
                      afHref={`/granskning/${review.id}/${firstUncheckedId}`}
                      afVariation={LinkButtonVariation.PRIMARY}
                      afHideIcon={true}
                    >
                      {t('ReviewRequirements.ReviewAccessibilityButton')}
                    </DigiLinkButton>
                  )}
                  <DigiLinkButton
                    afHref={`/granskning/${review.id}/underkanda-krav`}
                    afVariation={LinkButtonVariation.SECONDARY}
                    afHideIcon={true}
                  >
                    {t('ReviewRequirements.GoToFailedSummary')}
                  </DigiLinkButton>
                </div>
              </DigiLayoutBlock>
            </DigiLayoutContainer>
            <DigiLayoutContainer afMarginTop={false} afVerticalPadding={true}>
              <DigiLayoutBlock afMarginTop={false} afVerticalPadding={true}>
                <div className="min-h-[40rem]">
                  <div>
                    {review && (
                      <div>
                        <CardsOrTable
                          headings={[
                            <SortButton
                              buttonText={t('ReviewRequirements.HeadingRequirement')}
                              sortBy={SortBy.REQUIREMENT}
                              active={sortBy === SortBy.REQUIREMENT}
                              sortDirection={sortDirection}
                              onSortChange={setSort}
                              key="Krav"
                            />,
                            '',
                            <SortButton
                              buttonText={t('ReviewRequirements.HeadingCategory')}
                              sortBy={SortBy.CATEGORY}
                              active={sortBy === SortBy.CATEGORY}
                              sortDirection={sortDirection}
                              onSortChange={setSort}
                              key="Kravkategori"
                            />,
                            <SortButton
                              buttonText={t('ReviewRequirements.HeadingStatus')}
                              sortBy={SortBy.STATUS}
                              active={sortBy === SortBy.STATUS}
                              sortDirection={sortDirection}
                              onSortChange={setSort}
                              key="Bedömningsstatus"
                            />,
                          ]}
                          sortedByThIndex={sortBy}
                          cardsHeadings={[
                            t('ReviewRequirements.HeadingRequirement'),
                            '',
                            t('ReviewRequirements.HeadingCategory'),
                            t('ReviewRequirements.HeadingStatus'),
                          ]}
                          rows={filteredRequirements.map((req) => {
                            return {
                              id: req.id,
                              posInSet: filteredRequirements.findIndex((r) => r.id === req.id) + 1,
                              content: [
                                <DigiLink
                                  key={req.id}
                                  afHref={'/granskning/' + review.id + '/' + req.id}
                                >
                                  <span className="inline lg:hidden">
                                    <DigiIconChevronRight />
                                  </span>{' '}
                                  {req.name}
                                </DigiLink>,
                                <span key={req.id + '-flag'}>
                                  {req.check?.flag ? (
                                    <span className="flag text-sapphire-500 flex items-center">
                                      <span className="basis-6 shrink-0">
                                        <FilledFlag />
                                      </span>
                                      <span className="font-semibold">
                                        {t('ReviewRequirements.Flagged')}
                                      </span>
                                    </span>
                                  ) : (
                                    ''
                                  )}
                                </span>,
                                <span key={req.id + '-category'} className="whitespace-nowrap">
                                  {req.category}
                                </span>,
                                <div className="mt-2 md:mt-0" key={req.id + '-status'}>
                                  <StatusBadge status={req.check?.status} />
                                </div>,
                              ],
                            };
                          })}
                          totalItems={requirements.length}
                          itemsName={t('ReviewRequirements.ItemsName')}
                          filters={[
                            {
                              type: 'freeText',
                              label: t('ReviewRequirements.SearchLabel'),
                              values: [filterFreeText],
                              onChange: (e) => {
                                setFilterFreeText(e.detail);
                                setUrlParams(
                                  e.detail,
                                  filterCategories,
                                  filterStatus,
                                  sortBy,
                                  sortDirection,
                                  filterFlagged,
                                );
                              },
                            },
                            {
                              type: 'select',
                              label: t('ReviewRequirements.FilterCategories'),
                              options:
                                categories?.map((cat: string) => ({
                                  id: cat,
                                  label: cat,
                                })) || [],
                              values: filterCategories,
                              onChange: (e) => {
                                setFilterCategories(e.detail.checked);
                                setUrlParams(
                                  filterFreeText,
                                  e.detail.checked,
                                  filterStatus,
                                  sortBy,
                                  sortDirection,
                                  filterFlagged,
                                );
                              },
                            },
                            {
                              type: 'select',
                              label: t('ReviewRequirements.FilterStatus'),
                              options: [
                                {
                                  label: StatusText.PASS,
                                  id: Status.PASS.toString(),
                                },
                                {
                                  label: StatusText.FAIL,
                                  id: Status.FAIL.toString(),
                                },
                                {
                                  label: StatusText.NOT_ASSESSED,
                                  id: Status.NOT_ASSESSED.toString(),
                                },
                                {
                                  label: StatusText.IRRELEVANT,
                                  id: Status.IRRELEVANT.toString(),
                                },
                              ],
                              values: filterStatus.map((status: Status) => status.toString()),
                              onChange: (e) => {
                                setFilterStatus(
                                  e.detail.checked.map((item: string) => Number(item) as Status),
                                );
                                setUrlParams(
                                  filterFreeText,
                                  filterCategories,
                                  e.detail.checked.map((item: string) => Number(item) as Status),
                                  sortBy,
                                  sortDirection,
                                  filterFlagged,
                                );
                              },
                            },
                          ]}
                          resetChoices={clearAll}
                          choicesMade={
                            filterCategories.length > 0 ||
                            filterStatus.length > 0 ||
                            filterFreeText.length > 0 ||
                            sortBy !== undefined ||
                            filterFlagged
                          }
                          slotBelow={
                            <DigiFormCheckbox
                              afLabel={t('ReviewRequirements.ShowFlaggedRequirements')}
                              afChecked={filterFlagged}
                              onAfOnChange={(e) => {
                                setFilterFlagged(e.detail.target.checked);
                                setUrlParams(
                                  filterFreeText,
                                  filterCategories,
                                  filterStatus,
                                  sortBy,
                                  sortDirection,
                                  e.detail.target.checked,
                                );
                              }}
                            ></DigiFormCheckbox>
                          }
                        />
                      </div>
                    )}
                  </div>
                </div>
              </DigiLayoutBlock>
            </DigiLayoutContainer>
          </div>
        </>
      )}
      {!loading && !review && (
        <div>
          <DigiNotificationErrorPage
            afCustomHeading={t('ReviewRequirements.NotFoundHeading')}
            afHttpStatusCode={ErrorPageStatusCodes.NOT_FOUND}
          >
            <p slot="bodytext">{t('ReviewRequirements.NotFoundText')}</p>
          </DigiNotificationErrorPage>
        </div>
      )}
    </main>
  );
}
