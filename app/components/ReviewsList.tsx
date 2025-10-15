import {
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
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router';

import { ObjectType } from '~/data/types';
import { formatDate } from '~/formattingHelpers';
import { useRequirements } from '~/hooks/useRequirementData';
import { useReviews } from '~/hooks/useReviewData';

import { CardsOrTable } from './CardsOrTable';
import { StyledLink } from './StyledLink';

export function ReviewsList() {
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

  const [filterFreeText, setFilterFreeText] = useState('');

  const reviews = useMemo(() => {
    return reviewsAll?.filter((review) => review.objectType !== ObjectType.DOCUMENT);
  }, [reviewsAll]);

  const filteredReviews = useMemo(() => {
    const result =
      reviews?.filter(
        (review) => review.title?.toLowerCase().includes(filterFreeText.toLowerCase()) || false,
      ) || [];
    return result;
  }, [reviews, filterFreeText]);

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
              headings={['granskningar', 'Skapad', 'Uppdaterad', 'Granskade krav', '']}
              rows={filteredReviews.map((review) => {
                return {
                  id: review.id,
                  posInSet: filteredReviews.findIndex((r) => r.id === review.id) + 1,
                  content: [
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
                  ],
                };
              })}
              totalItems={reviews?.length || 0}
              filters={[
                {
                  type: 'freeText',
                  label: 'Sök på granskningsnamn',
                  onChange: (e) => {
                    setFilterFreeText(e.detail.target.value);
                  },
                },
              ]}
              defaultItemsPerPage={10}
            />
          </div>
        )}
      </div>
    </DigiTypography>
  );
}
