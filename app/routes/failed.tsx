import {
  ErrorPageStatusCodes,
  LoaderSkeletonVariation,
  TypographyHeadingJumboLevel,
  TypographyHeadingJumboVariation,
} from '@designsystem-se/af';
import {
  DigiLoaderSkeleton,
  DigiNotificationErrorPage,
  DigiTypography,
  DigiTypographyHeadingJumbo,
} from '@designsystem-se/af-react';
import { useMemo } from 'react';
import { useParams } from 'react-router-dom';

import Breadcrumbs from '~/components/Breadcrumbs';
import CreateStatement from '~/components/CreateStatement';
import { StyledLink } from '~/components/StyledLink';
import { ObjectType } from '~/data/types';
import { useRequirementCategories, useRequirements } from '~/hooks/useRequirementData';
import { useChecksForReview, useReviewById } from '~/hooks/useReviewData';

const applicationTitle = import.meta.env.VITE_APPLICATION_TITLE || 'Granska tillgänglighet';

export function meta() {
  return [
    { title: `${applicationTitle}: Underkända krav` },
    { name: 'description', content: 'Underkända krav' },
  ];
}

export default function FailedPage() {
  const { id } = useParams<{ id: string }>();
  const { review, isLoading: reviewLoading } = useReviewById(String(id));
  const { checks, isLoading: checksLoading } = useChecksForReview(String(id));
  const { data: requirementsAll, isLoading: requirementsAllLoading } = useRequirements();
  const { data: categoriesWeb, isLoading: categoriesWebLoading } = useRequirementCategories(
    ObjectType.WEB,
  );
  const { data: categoriesDoc, isLoading: categoriesDocLoading } = useRequirementCategories(
    ObjectType.DOCUMENT,
  );
  const requirements = useMemo(() => {
    return review?.objectType === (ObjectType.DOCUMENT as string)
      ? requirementsAll?.filter((r) => r.objectType === ObjectType.DOCUMENT) || []
      : requirementsAll?.filter((r) => r.objectType === ObjectType.WEB) || [];
  }, [review]);
  const categories = useMemo(() => {
    return review?.objectType === (ObjectType.DOCUMENT as string) ? categoriesDoc : categoriesWeb;
  }, [review]);
  const loading =
    reviewLoading ||
    checksLoading ||
    requirementsAllLoading ||
    categoriesWebLoading ||
    categoriesDocLoading;
  return (
    <main>
      {loading && (
        <div className="content-container">
          <DigiLoaderSkeleton
            className="m-5"
            afVariation={LoaderSkeletonVariation.SECTION}
            afCount={4}
          ></DigiLoaderSkeleton>
        </div>
      )}
      {!loading && review && (
        <DigiTypography>
          <div className="content-container content-container--nomargin content-container--white">
            <Breadcrumbs
              pages={[
                { title: 'Granskningar', href: '/' },
                { title: review?.title || 'Granskning', href: `/granskning/${review.id}` },
              ]}
              currentPage="Underkända krav"
            />

            <DigiTypographyHeadingJumbo
              afText="Underkända krav"
              afLevel={TypographyHeadingJumboLevel.H1}
              afVariation={TypographyHeadingJumboVariation.PRIMARY}
            ></DigiTypographyHeadingJumbo>

            <p className="pt-8">
              <b>Granskning:</b> {review.title}
            </p>
          </div>

          <div className="content-container content-container--nomargin">
            <StyledLink
              to={`/granskning/${review.id}/export`}
              text="Exportera uppgifter till Jira"
              styleVariant="link-button"
              hideIcon
            />
          </div>

          <CreateStatement
            checks={checks}
            requirements={requirements}
            categories={categories || []}
          />
        </DigiTypography>
      )}
      {!loading && !review && (
        <DigiNotificationErrorPage afHttpStatusCode={ErrorPageStatusCodes.NOT_FOUND}>
          <p slot="bodytext">
            Granskningen med id &quot;{id}&quot; kunde inte hittas. Den kan ha tagits bort, eller så
            har ett oväntat fel uppstått.
          </p>
        </DigiNotificationErrorPage>
      )}
    </main>
  );
}
