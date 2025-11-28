import { ButtonVariation, LoaderSkeletonVariation } from '@designsystem-se/af';
import {
  DigiButton,
  DigiIconChevronRight,
  DigiIconEdit,
  DigiIconHeart,
  DigiIconHeartSolid,
  DigiLayoutBlock,
  DigiLayoutContainer,
  DigiLoaderSkeleton,
  DigiTypography,
} from '@designsystem-se/af-react';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { useSearchParams } from 'react-router-dom';

import { ObjectType } from '~/data/types';
import { formatDate } from '~/formattingHelpers';
import { useRequirements } from '~/hooks/useRequirementData';
import { useReviews } from '~/hooks/useReviewData';

import { CardsOrTable } from './CardsOrTable';
import PageTitle from './PageTitle';
import Process from './Process';
import { SortButton } from './SortButton';
import { StyledLink } from './StyledLink';

export function ReviewsList() {
  const regulatoryFrameworkEnv = import.meta.env.VITE_REGULATORY_FRAMEWORK || '';
  const [searchParams, setSearchParams] = useSearchParams();
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
    REVIEW = 0,
    CREATED = 1,
    UPDATED = 2,
    REVIEWED = 3,
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
          <PageTitle
            h1Text="Granskningar"
            preamble="Här hittar du alla granskningar som har gjorts. Skapa en ny granskning för att själv bedöma tillgängligheten i din tjänst. Du kan när som helst fortsätta en påbörjad granskning genom att klicka på den i listan."
          ></PageTitle>
        </div>
        <DigiLayoutContainer afVerticalPadding={true}>
          <div>
            <DigiLayoutBlock afMarginBottom={true} afVerticalPadding={true}>
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                <div className="basis-1/3 flex-shrink-0">
                  <StyledLink to="/granskning/skapa" styleVariant="link-button">
                    Skapa ny granskning
                  </StyledLink>
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
            {reviewsError && <p>Fel vid hämtning av granskningar</p>}
            {fetched && (!filteredReviews || filteredReviews?.length === 0) && (
              <p>Inga granskningar hittades.</p>
            )}
            {fetched && filteredReviews && (
              <DigiLayoutBlock afMarginTop={true} afMarginBottom={false} afVerticalPadding={true}>
                <CardsOrTable
                  headings={[
                    '',
                    <SortButton
                      buttonText="Granskningsnamn"
                      sortBy={SortBy.REVIEW}
                      active={sortBy === SortBy.REVIEW}
                      sortDirection={sortDirection}
                      onSortChange={setSort}
                      key="Granskningsnamn"
                    />,
                    <SortButton
                      buttonText="Skapad"
                      sortBy={SortBy.CREATED}
                      active={sortBy === SortBy.CREATED}
                      sortDirection={sortDirection}
                      onSortChange={setSort}
                      key="Skapad"
                    />,
                    <SortButton
                      buttonText="Uppdaterad"
                      sortBy={SortBy.UPDATED}
                      active={sortBy === SortBy.UPDATED}
                      sortDirection={sortDirection}
                      onSortChange={setSort}
                      key="Uppdaterad"
                    />,
                    <SortButton
                      buttonText="Granskat"
                      sortBy={SortBy.REVIEWED}
                      active={sortBy === SortBy.REVIEWED}
                      sortDirection={sortDirection}
                      onSortChange={setSort}
                      key="Granskat"
                    />,
                    '',
                  ]}
                  cardsHeadings={['', 'Granskningsnamn', 'Skapad', 'Uppdaterad', 'Granskat', '']}
                  rows={filteredReviews.map((review) => {
                    return {
                      id: review.id,
                      posInSet: filteredReviews.findIndex((r) => r.id === review.id) + 1,
                      content: [
                        <>
                          {favoriteReviews.includes(review.id) ? (
                            <DigiButton
                              afType="button"
                              afVariation={ButtonVariation.FUNCTION}
                              key={`fav-off-${review.id}`}
                              aria-label="Ta bort från favoriter"
                              onClick={() => {
                                let updatedFaves = [...favoriteReviews];
                                updatedFaves = updatedFaves.filter((id) => id !== review.id);
                                setFavoriteReviews(updatedFaves);
                                localStorage.setItem(
                                  'favoriteReviews',
                                  JSON.stringify(updatedFaves),
                                );
                              }}
                            >
                              <DigiIconHeartSolid slot="icon" />
                            </DigiButton>
                          ) : (
                            <DigiButton
                              afType="button"
                              afVariation={ButtonVariation.FUNCTION}
                              key={`fav-on-${review.id}`}
                              aria-label="Lägg till i favoriter"
                              onClick={() => {
                                const updatedFaves = [...favoriteReviews];
                                updatedFaves.push(review.id);
                                setFavoriteReviews(updatedFaves);
                                localStorage.setItem(
                                  'favoriteReviews',
                                  JSON.stringify(updatedFaves),
                                );
                              }}
                            >
                              <DigiIconHeart slot="icon" />
                            </DigiButton>
                          )}
                        </>,

                        <StyledLink to={`/granskning/${review.id}`} key={`title-${review.id}`}>
                          <span className="inline lg:hidden">
                            <DigiIconChevronRight />
                          </span>{' '}
                          {review.title || 'Granskning'}
                        </StyledLink>,
                        <p className="whitespace-nowrap" key={`created-${review.id}`}>
                          {formatDate(review.created_at)}
                        </p>,
                        <p className="whitespace-nowrap" key={`updated-${review.id}`}>
                          {formatDate(review.latestUpdate)}
                        </p>,
                        <p className="whitespace-nowrap" key={`status-${review.id}`}>
                          {review.reviewedCount < 10 && <span className="inline-block w-2"></span>}
                          {`${review.reviewedCount} av ${requirementsCount(review.regulatoryFramework || '')} krav`}
                        </p>,
                        <DigiButton
                          afType="button"
                          afVariation="function"
                          afAriaLabel={'Ändra uppgifter för granskning: ' + review.title}
                          onClick={() => {
                            navigate(`/granskning/${review.id}/redigera`);
                          }}
                          key={`edit-${review.id}`}
                        >
                          Ändra uppgifter
                          <DigiIconEdit slot="icon" />
                        </DigiButton>,
                      ],
                    };
                  })}
                  itemsName="granskningar"
                  itemsNameSingular="granskning"
                  totalItems={reviews?.length || 0}
                  filters={[
                    {
                      type: 'freeText',
                      label: 'Sök på granskningsnamn',
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
                  resetChoices={() => {
                    setFilterFreeText('');
                    setSort(undefined);
                    setSearchParams({});
                    setFilterFaves(false);
                  }}
                  choicesMade={filterFreeText.length > 0 || sortBy !== undefined || filterFaves}
                  toggleButtons={
                    <fieldset className="flex flex-col lg:flex-row gap-4 mb-8">
                      <legend className="sr-only">Toggla-text</legend>
                      <DigiButton
                        afVariation={
                          filterFaves ? ButtonVariation.SECONDARY : ButtonVariation.PRIMARY
                        }
                        afAriaPressed={!filterFaves}
                        onAfOnClick={() => {
                          setFilterFaves(false);
                          setUrlParams(filterFreeText, sortBy!, sortDirection, false);
                        }}
                      >
                        Visa alla granskningar
                      </DigiButton>
                      <DigiButton
                        afVariation={
                          filterFaves ? ButtonVariation.PRIMARY : ButtonVariation.SECONDARY
                        }
                        afAriaPressed={filterFaves}
                        onAfOnClick={() => {
                          setFilterFaves(true);
                          setUrlParams(filterFreeText, sortBy, sortDirection, true);
                        }}
                      >
                        Visa favoriter ({favoriteReviews.length})
                      </DigiButton>
                    </fieldset>
                  }
                />
              </DigiLayoutBlock>
            )}
          </div>
        </DigiLayoutContainer>
      </DigiTypography>
    </main>
  );
}
