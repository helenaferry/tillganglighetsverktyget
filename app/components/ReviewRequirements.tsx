import {
  ErrorPageStatusCodes,
  LayoutBlockVariation,
  LoaderSkeletonVariation,
  NotificationAlertSize,
  NotificationAlertVariation,
} from '@designsystem-se/af';
import {
  DigiLayoutBlock,
  DigiLayoutContainer,
  DigiLoaderSkeleton,
  DigiNotificationAlert,
  DigiNotificationErrorPage,
} from '@designsystem-se/af-react';
import { DigiIconChevronRight } from '@designsystem-se/af-react';
import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import { StyledLink } from '~/components/StyledLink';
import { ObjectType, Status, StatusText } from '~/data/types';
import { numberChecked, numberPerStatus, percentageChecked } from '~/helpers';
import { useRequirementCategories, useRequirements } from '~/hooks/useRequirementData';
import { useChecksForReview, useReviewById } from '~/hooks/useReviewData';

import { CardsOrTable } from './CardsOrTable';
import PageTitle from './PageTitle';
import ProgressBar from './ProgressBar';
import { SortButton } from './SortButton';
import StatusBadge from './StatusBadge';

interface Props {
  reviewId: string;
}

export default function ReviewRequirements({ reviewId }: Props) {
  const [searchParams, setSearchParams] = useSearchParams();
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
    CATEGORY = 1,
    STATUS = 2,
  }

  const [filterCategories, setFilterCategories] = useState<string[]>([]);
  const [filterStatus, setFilterStatus] = useState<Status[]>([]);
  const [filterFreeText, setFilterFreeText] = useState<string>('');
  const [sortBy, setSortBy] = useState<SortBy | undefined>(undefined);
  const [sortDirection, setSortDirection] = useState<'stigande' | 'fallande'>('fallande');

  useEffect(() => {
    const categoriesSearchParam = searchParams.get('kategorier');
    const searchSearchParam = searchParams.get('sok');
    const statusSearchParam = searchParams.get('status');
    const sortParam = searchParams.get('sortering');
    const directionParam = searchParams.get('riktning');
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
  }, [searchParams]);

  const setUrlParams = (
    search: string,
    categories: string[],
    statuses: Status[],
    sort: SortBy | undefined,
    direction: 'stigande' | 'fallande',
  ) => {
    const params: Record<string, string> = {};
    if (search) params.sok = search;
    if (categories.length > 0) params.kategorier = categories.join(',');
    if (statuses.length > 0) params.status = statuses.join(',');
    if (sort !== undefined) params.sortering = sort.toString();
    if (sort !== undefined && direction) params.riktning = direction;
    window.history.replaceState(
      {},
      '',
      `${window.location.pathname}?${new URLSearchParams(params).toString()}`,
    );
  };

  const filteredRequirements = useMemo(() => {
    let result = requirementsWithChecks || [];
    if (filterCategories.length > 0) {
      result = result.filter((req) => filterCategories.includes(req.category));
    }
    if (filterStatus.length > 0) {
      result = result.filter((req) =>
        filterStatus.includes(req.check?.status ?? Status.NOT_ASSESSED),
      );
    }
    if (filterFreeText && filterFreeText.length > 0) {
      result = result.filter((req) =>
        req.name.toLowerCase().includes(filterFreeText.toLowerCase()),
      );
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
    );
  };

  const clearAll = () => {
    setFilterCategories([]);
    setFilterStatus([]);
    setFilterFreeText('');
    setSort(undefined);
    setSearchParams({});
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
            h1Text={`Kravöversikt: ${review?.title || 'Granskning'}`}
            preamble="Här får du en översikt över alla krav i granskningen. Du kan söka eller filtrera fram specifika krav, samt se aktuell status för granskningen."
            breadcrumbsCurrentPage={`Kravöversikt: ${review?.title || 'Granskning'}`}
            breadcrumbsPages={[{ title: 'Granskningar', href: '/' }]}
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
                    afHeading="Hurra, granskningen är klar!"
                  >
                    <div className="mt-6 mb-4">
                      <StyledLink
                        to={`/granskning/${review.id}/underkanda-krav`}
                        styleVariant="link-button"
                        hideIcon
                      >
                        Sammanställ underkända krav
                      </StyledLink>
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
                  <div
                    className="basis-1/4"
                    aria-label={`${numberPerStatus(requirementsWithChecks).notAssessedCount} ej granskade`}
                  >
                    <div className="flex flex-col items-center" aria-hidden="true">
                      <p className="!text-2xl !mb-2">
                        {numberPerStatus(requirementsWithChecks).notAssessedCount}
                      </p>
                      <StatusBadge status={Status.NOT_ASSESSED} plural noMinWidth />
                    </div>
                  </div>
                  <div
                    className="basis-1/4"
                    aria-label={`${numberPerStatus(requirementsWithChecks).passCount} godkända`}
                  >
                    <div className="flex flex-col items-center" aria-hidden="true">
                      <p className="!text-2xl !mb-2">
                        {numberPerStatus(requirementsWithChecks).passCount}
                      </p>
                      <StatusBadge status={Status.PASS} plural noMinWidth />
                    </div>
                  </div>
                  <div
                    className="basis-1/4"
                    aria-label={`${numberPerStatus(requirementsWithChecks).failCount} underkända`}
                  >
                    <div className="flex flex-col items-center" aria-hidden="true">
                      <p className="!text-2xl !mb-2">
                        {numberPerStatus(requirementsWithChecks).failCount}
                      </p>
                      <StatusBadge status={Status.FAIL} plural noMinWidth />
                    </div>
                  </div>
                  <div
                    className="basis-1/4"
                    aria-label={`${numberPerStatus(requirementsWithChecks).irrelevantCount} irrelevanta`}
                  >
                    <div className="flex flex-col items-center" aria-hidden="true">
                      <p className="!text-2xl !mb-2">
                        {numberPerStatus(requirementsWithChecks).irrelevantCount}
                      </p>
                      <StatusBadge status={Status.IRRELEVANT} plural noMinWidth />
                    </div>
                  </div>
                </div>
                <ProgressBar
                  progress={percentageChecked(requirementsWithChecks)}
                  text={`${numberChecked(requirementsWithChecks)} av ${requirementsWithChecks.length} krav granskade`}
                />
                <div className="flex flex-col md:flex-row gap-4 mt-10 mb-4">
                  {firstUncheckedId && (
                    <StyledLink
                      to={`/granskning/${review.id}/${firstUncheckedId}`}
                      styleVariant="link-button"
                      hideIcon
                    >
                      Granska tillgänglighet
                    </StyledLink>
                  )}
                  <StyledLink
                    to={`/granskning/${review.id}/underkanda-krav`}
                    styleVariant="link-button-secondary"
                    hideIcon
                  >
                    Sammanställ underkända krav
                  </StyledLink>
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
                              buttonText="Krav"
                              sortBy={SortBy.REQUIREMENT}
                              active={sortBy === SortBy.REQUIREMENT}
                              sortDirection={sortDirection}
                              onSortChange={setSort}
                              key="Krav"
                            />,
                            <SortButton
                              buttonText="Kravkategori"
                              sortBy={SortBy.CATEGORY}
                              active={sortBy === SortBy.CATEGORY}
                              sortDirection={sortDirection}
                              onSortChange={setSort}
                              key="Kravkategori"
                            />,
                            <SortButton
                              buttonText="Bedömningsstatus"
                              sortBy={SortBy.STATUS}
                              active={sortBy === SortBy.STATUS}
                              sortDirection={sortDirection}
                              onSortChange={setSort}
                              key="Bedömningsstatus"
                            />,
                          ]}
                          cardsHeadings={['Krav', 'Kravkategori', 'Bedömningsstatus']}
                          rows={filteredRequirements.map((req) => {
                            return {
                              id: req.id,
                              posInSet: filteredRequirements.findIndex((r) => r.id === req.id) + 1,
                              content: [
                                <StyledLink
                                  key={req.id}
                                  to={'/granskning/' + review.id + '/' + req.id}
                                >
                                  <span className="inline lg:hidden">
                                    <DigiIconChevronRight />
                                  </span>{' '}
                                  {req.name}
                                </StyledLink>,
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
                          itemsName="krav"
                          filters={[
                            {
                              type: 'freeText',
                              label: 'Sök på krav',
                              values: [filterFreeText],
                              onChange: (e) => {
                                setFilterFreeText(e.detail);
                                setUrlParams(
                                  e.detail,
                                  filterCategories,
                                  filterStatus,
                                  sortBy,
                                  sortDirection,
                                );
                              },
                            },
                            {
                              type: 'select',
                              label: 'Kravkategorier',
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
                                );
                              },
                            },
                            {
                              type: 'select',
                              label: 'Bedömningsstatus',
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
                                );
                              },
                            },
                          ]}
                          resetChoices={clearAll}
                          choicesMade={
                            filterCategories.length > 0 ||
                            filterStatus.length > 0 ||
                            filterFreeText.length > 0 ||
                            sortBy !== undefined
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
            afCustomHeading="Granskningen hittades inte"
            afHttpStatusCode={ErrorPageStatusCodes.NOT_FOUND}
          >
            <p slot="bodytext">Den kan ha tagits bort, eller så har ett fel uppstått.</p>
          </DigiNotificationErrorPage>
        </div>
      )}
    </main>
  );
}
