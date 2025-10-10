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
import { useMemo } from 'react';
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
        {(fetched && !reviews) || (reviews?.length === 0 && <p>Inga granskningar hittades.</p>)}
        <div className="my-4">
          <StyledLink
            to="/granskning/skapa"
            text="Skapa ny granskning"
            styleVariant="link-button"
          />
        </div>
        {fetched && reviews && (
          <div className="content-container content-container--largest content-container--white">
            <CardsOrTable
              headings={['Granskningsnamn', 'Skapad', 'Uppdaterad', 'Granskade krav', '']}
              rows={reviews
                .filter((review) => review.objectType !== ObjectType.DOCUMENT)
                .map((review) => [
                  <StyledLink
                    key={`granskning-${review.id}`}
                    to={`/granskning/${review.id}`}
                    text={review.title || 'Granskning'}
                  />,
                  formatDate(review.created_at),
                  formatDate(review.latestUpdate),
                  `${review.passCount + review.failCount + review.irrelevantCount} / ${requirementsCount}`,
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
            />
          </div>
        )}
      </div>
    </DigiTypography>
  );
}
