import { useParams } from 'react-router-dom';
import { useReviewById, useChecksForReview } from '~/hooks/useReviewData';
import { useRequirements, useRequirementCategories } from '~/hooks/useRequirementData';
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
import { ObjectType } from '~/data/types';
import { useMemo } from 'react';

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
  const { data: requirementsWeb, isLoading: requirementsWebLoading } = useRequirements(
    ObjectType.WEB,
  );
  const { data: requirementsDoc, isLoading: requirementsDocLoading } = useRequirements(
    ObjectType.DOCUMENT,
  );
  const { data: categoriesWeb, isLoading: categoriesWebLoading } = useRequirementCategories(
    review?.objectType as ObjectType,
  );
  const requirements = useMemo(() => {
    return review?.objectType === (ObjectType.DOCUMENT as String)
      ? requirementsDoc
      : requirementsWeb;
  }, [review]);
  const categories = useMemo(() => {
    return review?.objectType === (ObjectType.DOCUMENT as String)
      ? ['Dokumentkrav']
      : categoriesWeb;
  }, [review]);
  const loading =
    reviewLoading ||
    checksLoading ||
    requirementsWebLoading ||
    requirementsDocLoading ||
    categoriesWebLoading;
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
                <CreateStatement
                  review={review}
                  checks={checks}
                  requirements={requirements}
                  categories={categories || []}
                />
              )}
            </>
          )}
        </div>
      </DigiTypography>
    </DigiLayoutContainer>
  );
}
