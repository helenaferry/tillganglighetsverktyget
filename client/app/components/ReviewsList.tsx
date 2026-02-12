import {
  ButtonVariation,
  LinkButtonVariation,
  LoaderSkeletonVariation,
  NotificationAlertVariation,
} from '@designsystem-se/af';
import {
  DigiButton,
  DigiFormCheckbox,
  DigiIconChevronRight,
  DigiIconEdit,
  DigiIconHeart,
  DigiIconHeartSolid,
  DigiLayoutBlock,
  DigiLayoutContainer,
  DigiLink,
  DigiLinkButton,
  DigiLoaderSkeleton,
  DigiNotificationAlert,
  DigiTypography,
} from '@designsystem-se/af-react';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { useSearchParams } from 'react-router-dom';

import { ObjectType } from '~/data/types';
import { formatDate } from '~/helpers/formattingHelpers';
import { useRequirements } from '~/hooks/useRequirementData';
import { useReviews } from '~/hooks/useReviewData';

import { CardsOrTable } from './CardsOrTable';
import PageTitle from './PageTitle';
import Process from './Process';
import { SortButton } from './SortButton';

export function ReviewsList() {
  const { t } = useTranslation();
  const regulatoryFrameworkEnv = import.meta.env.VITE_REGULATORY_FRAMEWORK || '';
  const [searchParams] = useSearchParams();
  const {
    data: reviewsAll,
    isLoading: reviewsLoading,
    error: reviewsError,
    isFetched: reviewsFetched,
  } = useReviews();
  const {
    data: requirementsAll,
    isLoading: requirementsAllLoading,
    isFetched: requirementsAllFetched,
  } = useRequirements('');

  enum SortBy {
    REVIEW = 1,
    CREATED = 2,
    UPDATED = 3,
    REVIEWED = 4,
  }

  const [filterFreeText, setFilterFreeText] = useState('');
  const [filterFaves, setFilterFaves] = useState(false);
  const [sortBy, setSortBy] = useState<SortBy | undefined>(undefined);
  const [sortDirection, setSortDirection] = useState<'stigande' | 'fallande'>('fallande');
  const [favoriteReviews, setFavoriteReviews] = useState<number[]>(() => {
    const storedFaves = localStorage.getItem('favoriteReviews');
    return storedFaves ? JSON.parse(storedFaves) : [];
  });

  useEffect(() => {
    const searchSearchParam = searchParams.get('sok');
    const sortParam = searchParams.get('sortering');
    const directionParam = searchParams.get('riktning');
    const favesParam = searchParams.get('favoriter');
    if (!searchSearchParam) {
      setFilterFreeText('');
    } else {
      setFilterFreeText(searchSearchParam);
    }
    if (sortParam) {
      const sortByParam = sortParam;
      if (sortByParam) {
        setSortBy(parseInt(sortByParam));
      }
    } else {
      setSortBy(undefined);
    }
    if (directionParam === 'stigande' || directionParam === 'fallande') {
      setSortDirection(directionParam);
    }
    if (favesParam === 'true') {
      setFilterFaves(true);
    } else {
      setFilterFaves(false);
    }
  }, [searchParams]);

  const setUrlParams = (
    search: string,
    sort: SortBy | undefined,
    direction: 'stigande' | 'fallande',
    faves: boolean,
  ) => {
    const params: Record<string, string> = {};
    if (search) params.sok = search;
    if (sort !== undefined) params.sortering = sort.toString();
    if (sort !== undefined && direction) params.riktning = direction;
    if (faves) params.favoriter = 'true';
    window.history.replaceState(
      {},
      '',
      `${window.location.pathname}?${new URLSearchParams(params).toString()}`,
    );
  };

  const setSort = (field: SortBy | undefined) => {
    if (field === sortBy) {
      setSortDirection(sortDirection === 'stigande' ? 'fallande' : 'stigande');
    } else {
      setSortBy(field);
      setSortDirection('fallande');
    }
    setUrlParams(
      filterFreeText,
      field!,
      sortDirection === 'stigande' ? 'fallande' : 'stigande',
      filterFaves,
    );
  };

  const resetChoices = () => {
    setFilterFreeText('');
    setSortBy(undefined);
    window.history.replaceState({}, '', window.location.pathname);
    setFilterFaves(false);
  };

  const reviews = useMemo(() => {
    return reviewsAll
      ?.filter((review) => review.objectType !== ObjectType.DOCUMENT)
      .sort((a, b) => {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
  }, [reviewsAll]);

  const filteredReviews = useMemo(() => {
    let result = reviews || [];
    if (filterFaves) {
      result = result.filter((review) => favoriteReviews.includes(review.id));
    }
    if (filterFreeText) {
      result = result.filter(
        (review) => review.title?.toLowerCase().includes(filterFreeText.toLowerCase()) || false,
      );
    }
    return [...result].sort((a, b) => {
      if (sortBy === SortBy.CREATED && sortDirection === 'stigande') {
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      } else if (sortBy === SortBy.CREATED && sortDirection === 'fallande') {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      } else if (sortBy === SortBy.UPDATED && sortDirection === 'stigande') {
        return new Date(a.latestUpdate).getTime() - new Date(b.latestUpdate).getTime();
      } else if (sortBy === SortBy.UPDATED && sortDirection === 'fallande') {
        return new Date(b.latestUpdate).getTime() - new Date(a.latestUpdate).getTime();
      } else if (sortBy === SortBy.REVIEWED && sortDirection === 'stigande') {
        return a.reviewedCount - b.reviewedCount;
      } else if (sortBy === SortBy.REVIEWED && sortDirection === 'fallande') {
        return b.reviewedCount - a.reviewedCount;
      } else if (sortBy === SortBy.REVIEW && sortDirection === 'stigande') {
        return a.title && b.title ? a.title.localeCompare(b.title) : 0;
      } else if (sortBy === SortBy.REVIEW && sortDirection === 'fallande') {
        return a.title && b.title ? b.title.localeCompare(a.title) : 0;
      }
      return 0;
    });
  }, [reviews, filterFreeText, sortBy, sortDirection, filterFaves, favoriteReviews]);

  const requirements = useMemo(() => {
    return requirementsAll?.filter((r) => r.objectType === ObjectType.WEB) || [];
  }, [requirementsAll]);

  const requirementsCount = (regulatoryFramework: string) => {
    if (regulatoryFrameworkEnv && regulatoryFrameworkEnv !== '') {
      return requirements.filter((r) =>
        r.regulatoryFramework.split(',').includes(regulatoryFrameworkEnv),
      ).length;
    }
    if (!regulatoryFramework || regulatoryFramework === '' || regulatoryFramework === 'none') {
      return requirements.length;
    }
    return requirements.filter((r) =>
      r.regulatoryFramework.split(',').includes(regulatoryFramework),
    ).length;
  };

  const loading = reviewsLoading || requirementsAllLoading;
  const fetched = reviewsFetched && requirementsAllFetched;
  const navigate = useNavigate();
  return (
    <main>
      <DigiTypography>
        <div>
          <PageTitle h1Text={t('Home.Title')} preamble={t('Home.Preamble')}></PageTitle>
        </div>
        <DigiLayoutContainer afVerticalPadding={true}>
          <div>
            <DigiLayoutBlock afMarginBottom={true} afVerticalPadding={true}>
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                <div className="basis-1/3 flex-shrink-0">
                  <DigiLinkButton
                    afHref="/granskning/skapa"
                    afVariation={LinkButtonVariation.PRIMARY}
                  >
                    {t('Home.CreateReview')}
                  </DigiLinkButton>
                </div>
                <div className="basis-1/3 grow">
                  <Process showHeading={true} subHeadingElement="p" showDescription={false} />
                </div>
              </div>
            </DigiLayoutBlock>
            {loading && (
              <DigiLoaderSkeleton
                afVariation={LoaderSkeletonVariation.SECTION}
                afCount={4}
              ></DigiLoaderSkeleton>
            )}
            {reviewsError && (
              <DigiNotificationAlert afVariation={NotificationAlertVariation.DANGER}>
                {t('ReviewsList.LoadingError')}
              </DigiNotificationAlert>
            )}
            {fetched && filteredReviews && (
              <DigiLayoutBlock afMarginTop={true} afMarginBottom={false} afVerticalPadding={true}>
                <CardsOrTable
                  headings={[
                    '',
                    <SortButton
                      buttonText={t('ReviewsList.HeadingReviewName')}
                      sortBy={SortBy.REVIEW}
                      active={sortBy === SortBy.REVIEW}
                      sortDirection={sortDirection}
                      onSortChange={setSort}
                      key="review-name"
                    />,
                    <SortButton
                      buttonText={t('ReviewsList.HeadingCreated')}
                      sortBy={SortBy.CREATED}
                      active={sortBy === SortBy.CREATED}
                      sortDirection={sortDirection}
                      onSortChange={setSort}
                      key="created"
                    />,
                    <SortButton
                      buttonText={t('ReviewsList.HeadingUpdated')}
                      sortBy={SortBy.UPDATED}
                      active={sortBy === SortBy.UPDATED}
                      sortDirection={sortDirection}
                      onSortChange={setSort}
                      key="updated"
                    />,
                    <SortButton
                      buttonText={t('ReviewsList.HeadingReviewed')}
                      sortBy={SortBy.REVIEWED}
                      active={sortBy === SortBy.REVIEWED}
                      sortDirection={sortDirection}
                      onSortChange={setSort}
                      key="reviewed"
                    />,
                    '',
                  ]}
                  cardsHeadings={[
                    '',
                    t('ReviewsList.HeadingReviewName'),
                    t('ReviewsList.HeadingCreated'),
                    t('ReviewsList.HeadingUpdated'),
                    t('ReviewsList.HeadingReviewed'),
                    '',
                  ]}
                  rows={filteredReviews.map((review) => {
                    const isFavorite = favoriteReviews.includes(review.id);
                    return {
                      id: review.id,
                      posInSet: filteredReviews.findIndex((r) => r.id === review.id) + 1,
                      content: [
                        <DigiButton
                          afType="button"
                          afVariation={ButtonVariation.FUNCTION}
                          key={`fav-${review.id}}`}
                          afAriaLabel={
                            isFavorite
                              ? t('ReviewsList.FavoriteRemove', { reviewName: review.title })
                              : t('ReviewsList.FavoriteAdd', { reviewName: review.title })
                          }
                          afAriaPressed={isFavorite}
                          onClick={() => {
                            let updatedFaves = [...favoriteReviews];
                            if (isFavorite) {
                              updatedFaves = updatedFaves.filter((id) => id !== review.id);
                            } else {
                              updatedFaves.push(review.id);
                            }
                            setFavoriteReviews(updatedFaves);
                            localStorage.setItem('favoriteReviews', JSON.stringify(updatedFaves));
                          }}
                        >
                          {isFavorite ? (
                            <span className="favorite inline-block w-4 h-4">
                              <DigiIconHeartSolid slot="icon" />
                            </span>
                          ) : (
                            <span className="favorite inline-block w-4 h-4">
                              <DigiIconHeart slot="icon" />
                            </span>
                          )}
                        </DigiButton>,
                        <DigiLink
                          afHref={`/granskning/${review.id}`}
                          key={`title-${review.id}`}
                          // Override to work with ScrollRestoration
                          onAfOnClick={(e: Event) => {
                            e.preventDefault();
                            navigate(`/granskning/${review.id}`);
                          }}
                        >
                          <span className="inline lg:hidden">
                            <DigiIconChevronRight />
                          </span>{' '}
                          {review.title || t('ReviewsList.ReviewFallback')}
                        </DigiLink>,
                        <p className="whitespace-nowrap" key={`created-${review.id}`}>
                          {formatDate(review.created_at)}
                        </p>,
                        <p className="whitespace-nowrap" key={`updated-${review.id}`}>
                          {formatDate(review.latestUpdate)}
                        </p>,
                        <p className="whitespace-nowrap" key={`status-${review.id}`}>
                          {review.reviewedCount < 10 && <span className="inline-block w-2"></span>}
                          {t('ReviewsList.ReviewedOf', {
                            reviewed: review.reviewedCount,
                            total: requirementsCount(review.regulatoryFramework || ''),
                          })}
                        </p>,
                        <DigiButton
                          afType="button"
                          afVariation="function"
                          afAriaLabel={t('ReviewsList.EditReviewDetails', {
                            title: review.title,
                          })}
                          onClick={() => {
                            navigate(`/granskning/${review.id}/redigera`);
                          }}
                          key={`edit-${review.id}`}
                        >
                          {t('ReviewsList.EditDetailsButton')}
                          <DigiIconEdit slot="icon" />
                        </DigiButton>,
                      ],
                    };
                  })}
                  itemsName={t('ReviewsList.ItemsName')}
                  itemsNameSingular={t('ReviewsList.ItemsNameSingular')}
                  totalItems={reviews?.length || 0}
                  filters={[
                    {
                      type: 'freeText',
                      label: t('ReviewsList.SearchLabel'),
                      values: [filterFreeText],
                      onChange: (e) => {
                        setFilterFreeText(e.detail);
                        setUrlParams(e.detail, sortBy!, sortDirection, filterFaves);
                      },
                    },
                  ]}
                  defaultItemsPerPage={10}
                  sortedByThIndex={sortBy}
                  sortDirection={sortDirection}
                  displayHeadingsAboveCards={true}
                  resetChoices={resetChoices}
                  choicesMade={filterFreeText.length > 0 || sortBy !== undefined || filterFaves}
                  slotBelow={
                    <DigiFormCheckbox
                      afLabel={t('ReviewsList.ShowFavorites')}
                      afChecked={filterFaves}
                      onAfOnChange={(e) => {
                        setFilterFaves(e.detail.target.checked);
                        setUrlParams(
                          filterFreeText,
                          sortBy,
                          sortDirection,
                          e.detail.target.checked,
                        );
                      }}
                    ></DigiFormCheckbox>
                  }
                  mainColumnIndex={1}
                />
              </DigiLayoutBlock>
            )}
          </div>
        </DigiLayoutContainer>
      </DigiTypography>
    </main>
  );
}
