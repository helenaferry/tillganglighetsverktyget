import {
  ErrorPageStatusCodes,
  LoaderSkeletonVariation,
  TypographyHeadingJumboLevel,
  TypographyHeadingJumboVariation,
} from '@designsystem-se/af';
import {
  DigiLoaderSkeleton,
  DigiNotificationAlert,
  DigiNotificationErrorPage,
  DigiTypography,
  DigiTypographyHeadingJumbo,
} from '@designsystem-se/af-react';
import { useMemo } from 'react';
import { useParams } from 'react-router-dom';

import Breadcrumbs from '~/components/Breadcrumbs';
import ExportTasks from '~/components/ExportTasks';
import { ObjectType } from '~/data/types';
import { useRequirements } from '~/hooks/useRequirementData';
import { useChecksForReview, useReviewById } from '~/hooks/useReviewData';

const applicationTitle = import.meta.env.VITE_APPLICATION_TITLE || 'Granska tillgänglighet';

export function meta() {
  return [{ title: `${applicationTitle}: Export` }, { name: 'description', content: 'Export' }];
}

export default function ExportReviewPage() {
  const { id } = useParams<{ id: string }>();
  const { review, isLoading: reviewLoading } = useReviewById(String(id));
  const { checks, isLoading: checksLoading } = useChecksForReview(String(id));
  const { data: requirementsAll, isLoading: requirementsAllLoading } = useRequirements(
    review?.regulatoryFramework || '',
  );
  const requirements = useMemo(() => {
    return review?.objectType === (ObjectType.DOCUMENT as string)
      ? requirementsAll?.filter((r) => r.objectType === ObjectType.DOCUMENT) || []
      : requirementsAll?.filter((r) => r.objectType === ObjectType.WEB) || [];
  }, [review]);
  const loading = reviewLoading || checksLoading || requirementsAllLoading;
  return (
    <main>
      {loading && (
        <div className="">
          <DigiLoaderSkeleton
            className="m-5"
            afVariation={LoaderSkeletonVariation.SECTION}
            afCount={4}
          ></DigiLoaderSkeleton>
        </div>
      )}
      {!loading && review && checks && requirements && (
        <DigiTypography>
          <div className="">
            <Breadcrumbs
              pages={[
                { title: 'Granskningar', href: '/' },
                { title: review?.title || 'Granskning', href: `/granskning/${review.id}` },
                { title: 'Underkända krav', href: `/granskning/${review.id}/underkanda-krav` },
              ]}
              currentPage="Exportera uppgifter"
            />
            <DigiTypographyHeadingJumbo
              afText="Exportera uppgifter"
              afLevel={TypographyHeadingJumboLevel.H1}
              afVariation={TypographyHeadingJumboVariation.PRIMARY}
            ></DigiTypographyHeadingJumbo>

            <p className="pt-8">
              <b>Granskning:</b> {review.title}
            </p>

            <DigiNotificationAlert afHeading="Den här sidan ser lite hemsk ut just nu">
              Men misströsta inte, den ska bort och slås ihop med sidan för att sammanställa
              brister. Under tiden kan du använda den här fula sidan för att spara .csv och
              importera i Jira.
            </DigiNotificationAlert>
          </div>
          <ExportTasks review={review} checks={checks} requirements={requirements} />
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
