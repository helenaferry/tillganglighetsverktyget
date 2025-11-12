import {
  LoaderSkeletonVariation,
  TypographyHeadingJumboLevel,
  TypographyHeadingJumboVariation,
} from '@designsystem-se/af';
import {
  DigiButton,
  DigiIconChevronRight,
  DigiIconPen,
  DigiLoaderSkeleton,
  DigiTypography,
  DigiTypographyHeadingJumbo,
} from '@designsystem-se/af-react';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';

import { ObjectType } from '~/data/types';
import { formatDate } from '~/formattingHelpers';
import { useRequirements } from '~/hooks/useRequirementData';
import { useReviews } from '~/hooks/useReviewData';

import { CardsOrTable } from './CardsOrTable';
import { SortButton } from './SortButton';
import { StyledLink } from './StyledLink';
import { useSearchParams } from 'react-router-dom';

export function ReviewsList() {
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
  } = useRequirements();

  enum SortBy {
    REVIEW = 0,
    CREATED = 1,
    UPDATED = 2,
    REVIEWED = 3,
  }

  const [filterFreeText, setFilterFreeText] = useState('');
  const [sortBy, setSortBy] = useState<SortBy | undefined>(undefined);
  const [sortDirection, setSortDirection] = useState<'stigande' | 'fallande'>('fallande');

  useEffect(() => {
    const searchSearchParam = searchParams.get('sok');
    const sortParam = searchParams.get('sortering');
    const directionParam = searchParams.get('riktning');
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
  }, [searchParams]);

  const setUrlParams = (search: string, sort: SortBy, direction: 'stigande' | 'fallande') => {
    const params: Record<string, string> = {};
    if (search) params.sok = search;
    if (sort !== undefined) params.sortering = sort.toString();
    if (sort !== undefined && direction) params.riktning = direction;
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
    setUrlParams(filterFreeText, field!, sortDirection === 'stigande' ? 'fallande' : 'stigande');
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
  }, [reviews, filterFreeText, sortBy, sortDirection]);

  const requirements = useMemo(() => {
    return requirementsAll?.filter((r) => r.objectType === ObjectType.WEB) || [];
  }, [requirementsAll]);
  const requirementsCount = requirements.length;

  const loading = reviewsLoading || requirementsAllLoading;
  const fetched = reviewsFetched && requirementsAllFetched;
  const navigate = useNavigate();
  return (
    <DigiTypography>
      <div className="content-container content-container--white content-container--nomargin pt-12">
        <DigiTypographyHeadingJumbo
          afText="Granskningar"
          afLevel={TypographyHeadingJumboLevel.H1}
          afVariation={TypographyHeadingJumboVariation.PRIMARY}
        ></DigiTypographyHeadingJumbo>
        <p>
          <strong>
            Här visas alla granskningar som har gjorts. Starta en ny granskning för att självskatta
            tillgängligheten i din tjänst. Du kan när som helst återuppta en påbörjad granskning
            genom att klicka på den i listan.
          </strong>
        </p>
      </div>
      <div className="content-container content-container--nomargin">
        {loading && (
          <DigiLoaderSkeleton
            afVariation={LoaderSkeletonVariation.SECTION}
            afCount={4}
          ></DigiLoaderSkeleton>
        )}
        {reviewsError && <p>Fel vid hämtning av granskningar</p>}
        {(fetched && !filteredReviews) ||
          (filteredReviews?.length === 0 && <p>Inga granskningar hittades.</p>)}
        <div>
          <StyledLink to="/granskning/skapa" styleVariant="link-button">
            Skapa ny granskning
          </StyledLink>
        </div>
        {fetched && filteredReviews && (
          <div className="content-container content-container--ymargin content-container--largest content-container--white">
            <CardsOrTable
              headings={[
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
              cardsHeadings={['Granskningsnamn', 'Skapad', 'Uppdaterad', 'Granskat', '']}
              rows={filteredReviews.map((review) => {
                return {
                  id: review.id,
                  posInSet: filteredReviews.findIndex((r) => r.id === review.id) + 1,
                  content: [
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
                      {`${review.reviewedCount} av ${requirementsCount}`}
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
                      <DigiIconPen slot="icon" />
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
                    setUrlParams(e.detail, sortBy!, sortDirection);
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
              }}
              choicesMade={filterFreeText.length > 0 || sortBy !== undefined}
            />
          </div>
        )}
      </div>
    </DigiTypography>
  );
}
