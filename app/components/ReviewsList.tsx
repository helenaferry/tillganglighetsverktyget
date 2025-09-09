import { DigiTable, DigiLoaderSkeleton, DigiButton, DigiIconTrash } from "@digi/arbetsformedlingen-react";
import { StyledLink } from "./StyledLink";
import { useReviews, useDeleteReview } from "~/hooks/useReviewData";
import { useRequirements } from "~/hooks/useRequirementData";
import { LoaderSkeletonVariation } from "@digi/arbetsformedlingen";
import { formatDate, formatDateAndTime } from "~/formattingHelper";

export function ReviewsList() {
  const { data: reviews, isLoading: reviewsLoading, error: reviewsError, isFetched: reviewsFetched } = useReviews();
  const deleteReview = useDeleteReview();
  const { data: requirements, isLoading: requirementsLoading, isFetched: requirementsFetched } = useRequirements();
  const requirementsCount = requirements?.length || 0;
  const loading = reviewsLoading || requirementsLoading;
  const fetched = reviewsFetched && requirementsFetched;
  return (
    <div>
      {loading &&
        <DigiLoaderSkeleton
          afVariation={LoaderSkeletonVariation.SECTION}
          afCount={4}
        >
        </DigiLoaderSkeleton>}
      {reviewsError && <p>Fel vid hämtning av granskningar</p>}
      {fetched && !reviews || reviews?.length === 0 && <p>Inga granskningar hittades.</p>}
      {fetched && reviews && <div className="content-container"><DigiTable>
        <table>
          <thead>
            <tr>
              <th scope="col">Titel</th>
              <th scope="col">Applikation</th>
              <th scope="col">Skapad</th>
              <th>Godkända</th>
              <th>Underkända</th>
              <th>Ej granskade</th>
              <th>Senaste uppdatering</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {reviews.map(review =>
              <tr key={review.id}>
                <td>
                  <StyledLink to={`/review/${review.id}`} text={review.title || 'Granskning'} />
                </td>
                <td>{review.application?.name}</td>
                <td>{formatDate(review.created_at)}</td>
                <td>{review.passCount}</td>
                <td>{review.failCount}</td>
                <td>{requirementsCount - review.irrelevantCount - review.passCount - review.failCount}</td>
                <td>{formatDateAndTime(review.latestUpdate)}</td>
                <td>
                  <DigiButton
                    afType="button"
                    afVariation="function"
                    afAriaLabel={"Ta bort granskning " + review.title}
                    onClick={() => {
                      if (window.confirm('Är du säker på att du vill ta bort denna granskning? Du kan inte ångra dig!')) {
                        deleteReview.mutate(review.id);
                      }
                    }}>
                    <DigiIconTrash slot="icon" />
                  </DigiButton>
                </td>
              </tr>
            )}
          </tbody>
        </table>
        {deleteReview.isError && <span style={{ color: 'red' }}>Fel vid borttagning</span>}
        {deleteReview.isSuccess && <span style={{ color: 'green' }}>Borttagen!</span>}
      </DigiTable></div>}
    </div>
  );
}