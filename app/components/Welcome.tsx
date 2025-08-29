import { DigiLayoutContainer, DigiTypography, DigiTable, DigiLoaderSkeleton } from "@digi/arbetsformedlingen-react";
import { StyledLink } from "./StyledLink";
import { useReviews } from "~/hooks/useReviewData";
import { LoaderSkeletonVariation } from "@digi/arbetsformedlingen";

export function Welcome() {
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
                </tr>
              </thead>
              <tbody>
                {reviews.map(review =>
                  <tr key={review.id}>
                    <td>
                      <StyledLink to={`/review/${review.id}`} text={review.title || 'Granskning'} />
                    </td>
                    <td>{review.application?.name}</td>
                    <td>{review.created_at}</td>
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