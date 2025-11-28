import { DigiLayoutBlock, DigiLayoutContainer, DigiTypography } from '@designsystem-se/af-react';
import { useTranslation } from 'react-i18next';

import PageTitle from '~/components/PageTitle';
import { ReviewForm } from '~/components/ReviewForm';
import i18n from '~/lang/i18n';

const applicationTitle =
  import.meta.env.VITE_APPLICATION_TITLE || i18n.t('FallbackApplicationTitle');

export function meta() {
  return [
    { title: `${applicationTitle}: ${i18n.t('addReview.Title')}` },
    { name: 'description', content: i18n.t('addReview.MetaDescription') },
  ];
}

export default function AddReviewPage() {
  const { t } = useTranslation();
  return (
    <DigiTypography>
      <main>
        <PageTitle
          h1Text={t('addReview.Title')}
          preamble={t('addReview.Preamble')}
          breadcrumbsPages={[{ title: t('Home.Title'), href: '/' }]}
          breadcrumbsCurrentPage={t('addReview.Title')}
        />
        <DigiLayoutContainer afVerticalPadding={true}>
          <DigiLayoutBlock afVerticalPadding={true}>
            <ReviewForm />
          </DigiLayoutBlock>
        </DigiLayoutContainer>
      </main>
    </DigiTypography>
  );
}
