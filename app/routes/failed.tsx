import { ErrorPageStatusCodes, LoaderSkeletonVariation } from '@designsystem-se/af';
import {
  DigiLayoutBlock,
  DigiLoaderSkeleton,
  DigiNotificationErrorPage,
  DigiTypography,
} from '@designsystem-se/af-react';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';

import Export from '~/components/Export';
import PageTitle from '~/components/PageTitle';
import { ObjectType } from '~/data/types';
import { useRequirementCategories, useRequirements } from '~/hooks/useRequirementData';
import { useChecksForReview, useReviewById } from '~/hooks/useReviewData';
import i18n from '~/lang/i18n';

const applicationTitle = import.meta.env.VITE_APPLICATION_TITLE || 'Granska tillgänglighet';

export function meta() {
  return [
    { title: `${applicationTitle}: ${i18n.t('failed.Title')}` },
    { name: 'description', content: i18n.t('failed.MetaDescription') },
  ];
}

export default function FailedPage() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const { review, isLoading: reviewLoading, isFetched: reviewFetched } = useReviewById(String(id));
  const {
    checks,
    isLoading: checksLoading,
    isFetched: checksFetched,
  } = useChecksForReview(String(id));
  const {
    data: requirementsAll,
    isLoading: requirementsAllLoading,
    isFetched: requirementsAllFetched,
  } = useRequirements(review?.regulatoryFramework || '');
  const {
    data: categoriesWeb,
    isLoading: categoriesWebLoading,
    isFetched: categoriesWebFetched,
  } = useRequirementCategories(ObjectType.WEB);
  const {
    data: categoriesDoc,
    isLoading: categoriesDocLoading,
    isFetched: categoriesDocFetched,
  } = useRequirementCategories(ObjectType.DOCUMENT);
  const requirements = useMemo(() => {
    return review?.objectType === (ObjectType.DOCUMENT as string)
      ? requirementsAll?.filter((r) => r.objectType === ObjectType.DOCUMENT) || []
      : requirementsAll?.filter((r) => r.objectType === ObjectType.WEB) || [];
  }, [review, requirementsAll]);
  const categories = useMemo(() => {
    return review?.objectType === (ObjectType.DOCUMENT as string) ? categoriesDoc : categoriesWeb;
  }, [review, categoriesDoc, categoriesWeb]);
  const loading =
    reviewLoading ||
    checksLoading ||
    requirementsAllLoading ||
    categoriesWebLoading ||
    categoriesDocLoading;
  const fetched =
    reviewFetched &&
    checksFetched &&
    requirementsAllFetched &&
    categoriesWebFetched &&
    categoriesDocFetched;
  return (
    <main>
      {loading && (
        <DigiLayoutBlock>
          <DigiLoaderSkeleton
            className="m-5"
            afVariation={LoaderSkeletonVariation.SECTION}
            afCount={4}
          ></DigiLoaderSkeleton>
        </DigiLayoutBlock>
      )}
      {fetched &&
        (!review ||
          !checks ||
          checks.length === 0 ||
          !requirements ||
          requirements.length === 0 ||
          !categories ||
          categories.length === 0) && (
          <DigiNotificationErrorPage afHttpStatusCode={ErrorPageStatusCodes.NOT_FOUND}>
            <p slot="bodytext">{t('failed.NotFound', { id: id })}</p>
          </DigiNotificationErrorPage>
        )}
      {fetched &&
        review &&
        checks &&
        checks.length > 0 &&
        requirements &&
        requirements.length > 0 &&
        categories &&
        categories.length > 0 && (
          <DigiTypography>
            <PageTitle
              h1Text={t('failed.Title')}
              breadcrumbsPages={[
                { title: `${t('start.Title')}`, href: '/' },
                { title: review?.title || `${t('Review')}`, href: `/granskning/${review.id}` },
              ]}
              breadcrumbsCurrentPage={t('failed.Title')}
              preamble={`${t('Review')}: ${review.title}`}
            />
            <Export
              review={review}
              checks={checks}
              requirements={requirements}
              categories={categories}
            />
          </DigiTypography>
        )}
    </main>
  );
}
