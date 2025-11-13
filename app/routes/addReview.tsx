import { TypographyHeadingJumboLevel, TypographyHeadingJumboVariation } from '@designsystem-se/af';
import { DigiTypography, DigiTypographyHeadingJumbo } from '@designsystem-se/af-react';
import { useTranslation } from 'react-i18next';

import Breadcrumbs from '~/components/Breadcrumbs';
import { ReviewForm } from '~/components/ReviewForm';
import i18n from '~/lang/i18n';

const applicationTitle = import.meta.env.VITE_APPLICATION_TITLE || 'Granska tillgänglighet';

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
      <div className="content-container content-container--white content-container--nomargin">
        <Breadcrumbs
          pages={[{ title: t('start.Title'), href: '/' }]}
          currentPage={t('addReview.Title')}
        />
        <DigiTypographyHeadingJumbo
          afText={t('addReview.Title')}
          afLevel={TypographyHeadingJumboLevel.H1}
          afVariation={TypographyHeadingJumboVariation.PRIMARY}
        ></DigiTypographyHeadingJumbo>
        <ReviewForm />
      </div>
    </DigiTypography>
  );
}
