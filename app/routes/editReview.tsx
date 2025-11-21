import { DigiLayoutBlock, DigiLayoutContainer, DigiTypography } from '@designsystem-se/af-react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';

import PageTitle from '~/components/PageTitle';
import { ReviewForm } from '~/components/ReviewForm';
import i18n from '~/lang/i18n';

const applicationTitle = import.meta.env.VITE_APPLICATION_TITLE || 'Granska tillgänglighet';

export function meta() {
  return [
    { title: `${applicationTitle}: ${i18n.t('editReview.Title')}` },
    { name: 'description', content: i18n.t('editReview.MetaDescription') },
  ];
}

export default function EditReviewPage() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();

  return (
    <DigiTypography>
      <main>
        <PageTitle
          h1Text={t('editReview.Title')}
          breadcrumbsPages={[{ title: t('start.Title'), href: '/' }]}
          breadcrumbsCurrentPage={t('editReview.Title')}
        />
        <DigiLayoutContainer afVerticalPadding={true}>
          <DigiLayoutBlock afVerticalPadding={true}>
            <ReviewForm reviewId={String(id)} />
          </DigiLayoutBlock>
        </DigiLayoutContainer>
      </main>
    </DigiTypography>
  );
}
