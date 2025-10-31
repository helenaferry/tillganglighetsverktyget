import {
  LoaderSkeletonVariation,
  TypographyHeadingJumboLevel,
  TypographyHeadingJumboVariation,
} from '@designsystem-se/af';
import {
  DigiLoaderSkeleton,
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
  const { data: requirementsAll, isLoading: requirementsAllLoading } = useRequirements();
  const requirements = useMemo(() => {
    return review?.objectType === (ObjectType.DOCUMENT as string)
      ? requirementsAll?.filter((r) => r.objectType === ObjectType.DOCUMENT) || []
      : requirementsAll?.filter((r) => r.objectType === ObjectType.WEB) || [];
  }, [review]);
  const loading = reviewLoading || checksLoading || requirementsAllLoading;
  return (
    <DigiTypography>
      <div>
        {loading && <DigiLoaderSkeleton afVariation={LoaderSkeletonVariation.SECTION} />}
        {!loading && review && checks && requirements && (
          <>
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

            <ExportTasks review={review} checks={checks} requirements={requirements} />
          </>
        )}
      </div>
    </DigiTypography>
  );
}
