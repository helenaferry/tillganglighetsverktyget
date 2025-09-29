import {
  LoaderSkeletonVariation,
  TypographyHeadingJumboLevel,
  TypographyHeadingJumboVariation,
} from '@digi/arbetsformedlingen';
import {
  DigiButton,
  DigiIconEdit,
  DigiIconTrash,
  DigiLoaderSkeleton,
  DigiTable,
  DigiTypographyHeadingJumbo,
} from '@digi/arbetsformedlingen-react';
import { useNavigate } from 'react-router';

import { ObjectType } from '~/data/types';
import { formatDate, formatDateAndTime } from '~/formattingHelper';
import { useRequirements } from '~/hooks/useRequirementData';
import { useDeleteReview, useReviews } from '~/hooks/useReviewData';

import { StyledLink } from './StyledLink';

export function ReviewsList() {
  const {
    data: reviews,
    isLoading: reviewsLoading,
    error: reviewsError,
    isFetched: reviewsFetched,
  } = useReviews();
  const deleteReview = useDeleteReview();
  const {
    data: requirements,
    isLoading: requirementsLoading,
    isFetched: requirementsFetched,
  } = useRequirements(ObjectType.WEB);
  const {
    data: requirementsDoc,
    isLoading: isLoadingDoc,
    isFetched: isFetchedDoc,
  } = useRequirements(ObjectType.DOCUMENT);
  const requirementsCount = requirements?.length || 0;
  const requirementsDocCount = requirementsDoc?.length || 0;
  const loading = reviewsLoading || requirementsLoading || isLoadingDoc;
  const fetched = reviewsFetched && requirementsFetched && isFetchedDoc;
  const navigate = useNavigate();
  return (
    <div className="content-container content-container--largest">
      <DigiTypographyHeadingJumbo
        afText="Granskningar"
        afLevel={TypographyHeadingJumboLevel.H1}
        afVariation={TypographyHeadingJumboVariation.PRIMARY}
      ></DigiTypographyHeadingJumbo>
      {loading && (
        <DigiLoaderSkeleton
          afVariation={LoaderSkeletonVariation.SECTION}
          afCount={4}
        ></DigiLoaderSkeleton>
      )}
      {reviewsError && <p>Fel vid hämtning av granskningar</p>}
      {(fetched && !reviews) || (reviews?.length === 0 && <p>Inga granskningar hittades.</p>)}
      {fetched && reviews && (
        <div className="content-container content-container--white">
          <DigiTable>
            <table>
              <thead>
                <tr>
                  <th scope="col">Titel</th>
                  <th scope="col">Granskningsobjekt</th>
                  <th scope="col">Skapad</th>
                  <th>Godkända</th>
                  <th>Underkända</th>
                  <th>Ej granskade</th>
                  <th>Senaste uppdatering</th>
                  <th></th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {reviews.map((review) => (
                  <tr key={review.id}>
                    <td>
                      <StyledLink
                        to={`/granskning/${review.id}`}
                        text={review.title || 'Granskning'}
                      />
                    </td>
                    <td>{review.application?.name}</td>
                    <td>{formatDate(review.created_at)}</td>
                    <td>{review.passCount}</td>
                    <td>{review.failCount}</td>
                    <td>
                      {review.objectType === ObjectType.DOCUMENT
                        ? requirementsDocCount -
                          review.irrelevantCount -
                          review.passCount -
                          review.failCount
                        : requirementsCount -
                          review.irrelevantCount -
                          review.passCount -
                          review.failCount}
                    </td>
                    <td>{formatDateAndTime(review.latestUpdate)}</td>
                    <td>
                      <DigiButton
                        afType="button"
                        afVariation="function"
                        afAriaLabel={'Redigera granskning ' + review.title}
                        onClick={() => {
                          navigate(`/granskning/${review.id}/redigera`);
                        }}
                      >
                        <DigiIconEdit slot="icon" />
                      </DigiButton>
                    </td>
                    <td>
                      <DigiButton
                        afType="button"
                        afVariation="function"
                        afAriaLabel={'Ta bort granskning ' + review.title}
                        onClick={() => {
                          if (
                            window.confirm(
                              'Är du säker på att du vill ta bort denna granskning? Du kan inte ångra dig!',
                            )
                          ) {
                            deleteReview.mutate(review.id);
                          }
                        }}
                      >
                        <DigiIconTrash slot="icon" />
                      </DigiButton>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {deleteReview.isError && <span style={{ color: 'red' }}>Fel vid borttagning</span>}
            {deleteReview.isSuccess && <span style={{ color: 'green' }}>Borttagen!</span>}
          </DigiTable>
        </div>
      )}
      <StyledLink to="/granskning/skapa" text="Skapa ny granskning" isButton={true} />
    </div>
  );
}
