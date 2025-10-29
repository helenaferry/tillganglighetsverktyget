import {
  LoaderSkeletonVariation,
  NotificationAlertSize,
  NotificationAlertVariation,
  TypographyHeadingJumboLevel,
  TypographyHeadingJumboVariation,
} from '@designsystem-se/af';
import {
  DigiLoaderSkeleton,
  DigiNotificationAlert,
  DigiTypography,
  DigiTypographyHeadingJumbo,
} from '@designsystem-se/af-react';
import { useMemo, useState } from 'react';

import { StyledLink } from '~/components/StyledLink';
import { ObjectType, Status, StatusText } from '~/data/types';
import { formatDate } from '~/formattingHelpers';
import { useRequirementCategories, useRequirements } from '~/hooks/useRequirementData';
import { useChecksForReview, useReviewById } from '~/hooks/useReviewData';

import Breadcrumbs from './Breadcrumbs';
import { CardsOrTable } from './CardsOrTable';
import { SortButton } from './SortButton';
import StatusBadge from './StatusBadge';
import { numberChecked, percentageChecked, numberPerStatus } from '~/helpers';
import ProgressBar from './ProgressBar';

interface Props {
  reviewId: string;
}

export default function ReviewRequirements({ reviewId }: Props) {
  const { review: review, isLoading: reviewLoading } = useReviewById(reviewId);
  const { checks, isLoading: checksLoading } = useChecksForReview(reviewId);
  const { data: requirementsAll, isLoading: requirementsAllLoading } = useRequirements();

  const { data: categoriesWeb, isLoading: categoriesWebLoading } = useRequirementCategories(
    ObjectType.WEB,
  );
  const { data: categoriesDoc, isLoading: categoriesDocLoading } = useRequirementCategories(
    ObjectType.DOCUMENT,
  );

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
  const [sortDirection, setSortDirection] = useState<'ascending' | 'descending'>('descending');

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
        if (sortBy === SortBy.REQUIREMENT && sortDirection === 'ascending') {
          return a.name.localeCompare(b.name);
        } else if (sortBy === SortBy.REQUIREMENT && sortDirection === 'descending') {
          return b.name.localeCompare(a.name);
        } else if (sortBy === SortBy.CATEGORY && sortDirection === 'ascending') {
          return a.category.localeCompare(b.category);
        } else if (sortBy === SortBy.CATEGORY && sortDirection === 'descending') {
          return b.category.localeCompare(a.category);
        } else if (sortBy === SortBy.STATUS && sortDirection === 'ascending') {
          return (
            (a.check?.status ?? Status.NOT_ASSESSED) - (b.check?.status ?? Status.NOT_ASSESSED)
          );
        } else if (sortBy === SortBy.STATUS && sortDirection === 'descending') {
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
      setSortDirection(sortDirection === 'ascending' ? 'descending' : 'ascending');
    } else {
      setSortBy(field);
      setSortDirection('descending');
    }
  };

  const clearAll = () => {
    setFilterCategories([]);
    setFilterStatus([]);
    setFilterFreeText('');
    setSort(undefined);
  };

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
                  currentPage={review.title || 'Granskning'}
                  pages={[{ title: 'Granskningar', href: '/' }]}
                />
                <DigiTypographyHeadingJumbo
                  className="wrap-anywhere"
                  afText={review?.title || 'Granskning'}
                  afLevel={TypographyHeadingJumboLevel.H1}
                  afVariation={TypographyHeadingJumboVariation.PRIMARY}
                ></DigiTypographyHeadingJumbo>
                <strong>Granskning startades {formatDate(review?.created_at)}</strong>
              </div>
            </div>
          )}
        </DigiTypography>
      </div>
      {review && (
        <div className="content-container content-container--largest">
          {percentageChecked(requirementsWithChecks) === 100 && (
            <div className="mb-5" role="alert">
              <DigiNotificationAlert
                afSize={NotificationAlertSize.LARGE}
                afVariation={NotificationAlertVariation.SUCCESS}
                afHeading="Hurra, granskningen är klar!"
              >
                <div className="mt-6 mb-4">
                  <StyledLink
                    to={`/granskning/${review.id}/export/redogorelse`}
                    text="Sammanställ underkända krav"
                    styleVariant="link-button-secondary"
                    hideIcon
                  />
                </div>
              </DigiNotificationAlert>
            </div>
          )}
          <div className="content-container content-container--white content-container--largest content-container--nomargin mb-5">
            <div className="flex flex-col sm:flex-row mb-6">
              <div className="flex flex-col items-center basis-1/4">
                <p className="text-2xl">
                  {numberPerStatus(requirementsWithChecks).notAssessedCount}
                </p>
                <StatusBadge status={Status.NOT_ASSESSED} plural noMinWidth />
              </div>
              <div className="flex flex-col items-center basis-1/4">
                <p className="text-2xl">{numberPerStatus(requirementsWithChecks).passCount}</p>
                <StatusBadge status={Status.PASS} plural noMinWidth />
              </div>
              <div className="flex flex-col items-center basis-1/4">
                <p className="text-2xl">{numberPerStatus(requirementsWithChecks).failCount}</p>
                <StatusBadge status={Status.FAIL} plural noMinWidth />
              </div>
              <div className="flex flex-col items-center basis-1/4">
                <p className="text-2xl">
                  {numberPerStatus(requirementsWithChecks).irrelevantCount}
                </p>
                <StatusBadge status={Status.IRRELEVANT} plural noMinWidth />
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
                  text="Granska tillgänglighet"
                  styleVariant="link-button"
                  hideIcon
                />
              )}
              <StyledLink
                to={`/granskning/${review.id}/export/redogorelse`}
                text="Sammanställ underkända krav"
                styleVariant="link-button-secondary"
                hideIcon
              />
            </div>
          </div>
          <div className="content-container content-container--white content-container--largest min-h-[40rem]">
            <div>
              {review && (
                <div className="container">
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
                            text={req.name}
                          />,
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
                        onChange: (e) => {
                          setFilterFreeText(e.detail);
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
                        onChange: (e) => {
                          setFilterCategories(e.detail.checked);
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
                        onChange: (e) => {
                          setFilterStatus(
                            e.detail.checked.map((item: string) => Number(item) as Status),
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
        </div>
      )}
    </div>
  );
}
