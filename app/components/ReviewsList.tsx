import {
  type IListItem,
  LoaderSkeletonVariation,
  TypographyHeadingJumboLevel,
  TypographyHeadingJumboVariation,
} from '@digi/arbetsformedlingen';
import {
  DigiButton,
  DigiIconPen,
  DigiLoaderSkeleton,
  DigiTypography,
  DigiTypographyHeadingJumbo,
} from '@digi/arbetsformedlingen-react';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';

import { ObjectType } from '~/data/types';
import { formatDate } from '~/formattingHelpers';
import { useRequirements } from '~/hooks/useRequirementData';
import { useReviews } from '~/hooks/useReviewData';

import { CardsOrTable } from './CardsOrTable';
import { StyledLink } from './StyledLink';

export function ReviewsList() {
  const {
    data: reviews,
    isLoading: reviewsLoading,
    error: reviewsError,
    isFetched: reviewsFetched,
  } = useReviews();
  const {
    data: requirementsAll,
    isLoading: requirementsAllLoading,
    isFetched: requirementsAllFetched,
  } = useRequirements();

  const [filterFreeText, setFilterFreeText] = useState('');
  const [yearFilterOptions, setYearFilterOptions] = useState<IListItem[]>([]);
  const [selectedYearFilterOptions, setSelectedYearFilterOptions] = useState<string[]>([]);

  useEffect(() => {
    if (reviews) {
      const years = Array.from(
        new Set(
          reviews
            .map((review) => {
              return review.created_at ? new Date(review.created_at).getFullYear().toString() : '';
            })
            .filter((year) => year !== ''),
        ),
      ).sort((a, b) => parseInt(b) - parseInt(a));
      setYearFilterOptions(years.map((year) => ({ value: year, label: year })));
    } else {
      setYearFilterOptions([]);
    }
  }, [reviews]);

  const filteredReviews = useMemo(() => {
    let result =
      reviews?.filter(
        (review) => review.title?.toLowerCase().includes(filterFreeText.toLowerCase()) || false,
      ) || [];
    if (selectedYearFilterOptions.length > 0) {
      result = result.filter(
        (review) =>
          review.created_at &&
          selectedYearFilterOptions.includes(new Date(review.created_at).getFullYear().toString()),
      );
    }
    return result;
  }, [reviews, filterFreeText, selectedYearFilterOptions]);

  const requirements = useMemo(() => {
    return requirementsAll?.filter((r) => r.objectType === ObjectType.WEB) || [];
  }, [requirementsAll]);
  const requirementsCount = requirements.length;

  const loading = reviewsLoading || requirementsAllLoading;
  const fetched = reviewsFetched && requirementsAllFetched;
  const navigate = useNavigate();
  return (
    <DigiTypography>
      <div className="bg-white p-5 pt-12">
        <DigiTypographyHeadingJumbo
          afText="Granskningar"
          afLevel={TypographyHeadingJumboLevel.H1}
          afVariation={TypographyHeadingJumboVariation.PRIMARY}
        ></DigiTypographyHeadingJumbo>
        <p>
          <strong>Här hittar du samtliga granskningar.</strong>
        </p>
      </div>
      <div className="m-5">
        {loading && (
          <DigiLoaderSkeleton
            afVariation={LoaderSkeletonVariation.SECTION}
            afCount={4}
          ></DigiLoaderSkeleton>
        )}
        {reviewsError && <p>Fel vid hämtning av granskningar</p>}
        {(fetched && !filteredReviews) ||
          (filteredReviews?.length === 0 && <p>Inga granskningar hittades.</p>)}
        <div className="my-4">
          <StyledLink
            to="/granskning/skapa"
            text="Skapa ny granskning"
            styleVariant="link-button"
          />
        </div>
        {fetched && filteredReviews && (
          <div className="content-container content-container--largest content-container--white">
            <CardsOrTable
              headings={['Granskningsnamn', 'Skapad', 'Uppdaterad', 'Granskade krav', '']}
              rows={filteredReviews
                .filter((review) => review.objectType !== ObjectType.DOCUMENT)
                .map((review) => [
                  <StyledLink
                    key={`granskning-${review.id}`}
                    to={`/granskning/${review.id}`}
                    text={review.title || 'Granskning'}
                  />,
                  <p className="whitespace-nowrap" key={`created-at-${review.id}`}>
                    {formatDate(review.created_at)}
                  </p>,
                  <p className="whitespace-nowrap" key={`latest-update-${review.id}`}>
                    {formatDate(review.latestUpdate)}
                  </p>,
                  <p
                    className="whitespace-nowrap"
                    key={`requirements-count-${review.id}`}
                  >{`${review.passCount + review.failCount + review.irrelevantCount} / ${requirementsCount}`}</p>,
                  <DigiButton
                    key={`edit-review-${review.id}`}
                    afType="button"
                    afVariation="function"
                    afAriaLabel={'Redigera granskning ' + review.title}
                    onClick={() => {
                      navigate(`/granskning/${review.id}/redigera`);
                    }}
                  >
                    Ändra uppgifter
                    <DigiIconPen slot="icon" />
                  </DigiButton>,
                ])}
              filters={[
                {
                  type: 'freeText',
                  label: 'Sök på granskningsnamn',
                  onChange: (e) => {
                    setFilterFreeText(e.detail.target.value);
                  },
                },
                {
                  type: 'select',
                  label: 'Filtrera på årtal skapad',
                  options: yearFilterOptions,
                  onChange: (e) => {
                    const values = e.detail as IListItem[];
                    const selectedValues = values
                      .filter((item) => item.selected)
                      .map((item) => item.value)
                      .filter((value): value is string => value !== undefined);
                    setSelectedYearFilterOptions(selectedValues);
                  },
                },
              ]}
              defaultItemsPerPage={4}
            />
          </div>
        )}
      </div>
    </DigiTypography>
  );
}
