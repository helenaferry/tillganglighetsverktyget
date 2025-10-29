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
import CreateStatement from '~/components/CreateStatement';
import ExportTasks from '~/components/ExportTasks';
import { StyledLink } from '~/components/StyledLink';
import { ObjectType } from '~/data/types';
import { useRequirementCategories, useRequirements } from '~/hooks/useRequirementData';
import { useChecksForReview, useReviewById } from '~/hooks/useReviewData';

export function meta() {
  return [
    { title: 'Tillgänglighetsverktyget: Export' },
    { name: 'description', content: 'Export' },
  ];
}

export default function ExportReviewPage() {
  const { id, type } = useParams<{ id: string; type: 'redogorelse' | 'uppgifter' }>();
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
    <DigiTypography>
      <div>
        {loading && <DigiLoaderSkeleton afVariation={LoaderSkeletonVariation.SECTION} />}
        {!loading && review && checks && requirements && (
          <>
            <Breadcrumbs
              pages={[
                { title: 'Granskningar', href: '/' },
                { title: review?.title || 'Granskning', href: `/granskning/${review.id}` },
              ]}
              currentPage={
                type === 'uppgifter' ? 'Exportera uppgifter' : 'Skapa tillgänglighetsredogörelse'
              }
            />
            <DigiTypographyHeadingJumbo
              afText={
                type === 'uppgifter' ? 'Exportera uppgifter' : 'Skapa tillgänglighetsredogörelse'
              }
              afLevel={TypographyHeadingJumboLevel.H1}
              afVariation={TypographyHeadingJumboVariation.PRIMARY}
            ></DigiTypographyHeadingJumbo>

            {type === 'uppgifter' ? (
              <ExportTasks review={review} checks={checks} requirements={requirements} />
            ) : (
              <div>
                {' '}
                <StyledLink
                  to={`/granskning/${review.id}/export/uppgifter`}
                  text="Exportera uppgifter (.csv)"
                  styleVariant="link-button-secondary"
                  hideIcon
                />
                <CreateStatement
                  review={review}
                  checks={checks}
                  requirements={requirements}
                  categories={categories || []}
                />
              </div>
            )}
          </>
        )}
      </div>
    </DigiTypography>
  );
}
