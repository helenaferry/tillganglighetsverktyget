import { DigiLayoutContainer, DigiTypography, DigiTable, DigiLoaderSkeleton } from "@digi/arbetsformedlingen-react";
import { StyledLink } from "./StyledLink";
import { useReviews } from "~/hooks/useReviewData";
import { LoaderSkeletonVariation } from "@digi/arbetsformedlingen";
import { formatDate, formatPercentage } from "~/formattingHelper";

export function ReviewSummary() {
  const { data: reviews, isLoading: reviewsLoading, error: reviewsError } = useReviews();

  return (
    <DigiLayoutContainer afVerticalPadding>
      <DigiTypography>
        <main>
          <h1>Granskningar</h1>
          {reviewsLoading &&
            <DigiLoaderSkeleton
              afVariation={LoaderSkeletonVariation.SECTION}
              afCount={4}
            >
            </DigiLoaderSkeleton>}
          {reviewsError && <p>Fel vid hämtning av granskningar</p>}
          {!reviewsLoading && !reviews || reviews?.length === 0 && <p>Inga granskningar hittades.</p>}
          {reviews && <DigiTable>
            <table>
              <thead>
                <tr>
                  <th scope="col">Titel</th>
                  <th scope="col">
                    Applikation
                  </th>
                  <th scope="col">Skapad</th>
                  <th>Godkända</th>
                  <th>Underkända</th>
                  <th>Relevanta krav</th>
                  <th>Granskningsgrad</th>
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
                    <td>{96 - review.irrelevantCount}/96 {formatPercentage((96 - review.irrelevantCount) / 96)}</td>
                    <td>{formatPercentage((review.passCount + review.failCount + review.irrelevantCount) / 96)}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </DigiTable>}
        </main>
      </DigiTypography>
    </DigiLayoutContainer>
  );
}