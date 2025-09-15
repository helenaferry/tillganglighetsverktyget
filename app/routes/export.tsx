import { useParams } from 'react-router-dom';
import { useReviewById, useChecksForReview } from '~/hooks/useReviewData';
import { useRequirements } from '~/hooks/useRequirementData';
import {
  DigiLayoutContainer,
  DigiTypography,
  DigiTypographyHeadingJumbo,
  DigiLoaderSkeleton,
} from '@digi/arbetsformedlingen-react';
import {
  LoaderSkeletonVariation,
  TypographyHeadingJumboLevel,
  TypographyHeadingJumboVariation,
} from '@digi/arbetsformedlingen';
import CreateStatement from '~/components/CreateStatement';
import ExportTasks from '~/components/ExportTasks';
import Breadcrumbs from '~/components/Breadcrumbs';

export function meta() {
  return [
    { title: 'Tillgänglighetsverktyget: Export' },
    { name: 'description', content: 'Export' },
  ];
}

export default function ExportReviewPage() {
  const { id, type } = useParams<{ id: string; type: 'statement' | 'tasks' }>();
  const { review, isLoading: reviewLoading } = useReviewById(String(id));
  const { checks, isLoading: checksLoading } = useChecksForReview(String(id));
  const { data: requirements, isLoading: requirementsLoading } = useRequirements();
  const loading = reviewLoading || checksLoading || requirementsLoading;
  return (
    <DigiLayoutContainer afVerticalPadding>
      <DigiTypography>
        <div>
          {loading && <DigiLoaderSkeleton afVariation={LoaderSkeletonVariation.SECTION} />}
          {!loading && review && checks && requirements && (
            <>
              <Breadcrumbs
                pages={[
                  { title: 'Granskningar', href: '/' },
                  { title: review?.title || 'Granskning', href: `/review/${review.id}` },
                ]}
                currentPage={
                  type === 'tasks' ? 'Exportera uppgifter' : 'Skapa tillgänglighetsredogörelse'
                }
              />
              <DigiTypographyHeadingJumbo
                afText={
                  type === 'tasks' ? 'Exportera uppgifter' : 'Skapa tillgänglighetsredogörelse'
                }
                afLevel={TypographyHeadingJumboLevel.H1}
                afVariation={TypographyHeadingJumboVariation.PRIMARY}
              ></DigiTypographyHeadingJumbo>
              {type === 'tasks' ? (
                <ExportTasks review={review} checks={checks} requirements={requirements} />
              ) : (
                <CreateStatement review={review} checks={checks} requirements={requirements} />
              )}
            </>
          )}
        </div>
      </DigiTypography>
    </DigiLayoutContainer>
  );
}
