import { DigiLayoutBlock, DigiLayoutContainer, DigiTypography } from '@designsystem-se/af-react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';

import PageTitle from '~/components/PageTitle';
import { ReviewForm } from '~/components/ReviewForm';
import { envVars } from '~/helpers';
import { useReviewById } from '~/hooks/useReviewData';
import i18n from '~/lang/i18n';

const applicationTitle = envVars().applicationTitle;

export function meta() {
  return [
    { title: `${applicationTitle}: ${i18n.t('editReview.Title')}` },
    { name: 'description', content: i18n.t('editReview.MetaDescription') },
  ];
}

export default function EditReviewPage() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const { review } = useReviewById(String(id));

  return (
    <DigiTypography>
      <main>
        {review && (
          <>
            <PageTitle
              h1Text={t('editReview.Title')}
              preamble={t('editReview.Preamble', { title: review.title })}
              breadcrumbsPages={[{ title: t('start.Title'), href: '/' }]}
              breadcrumbsCurrentPage={t('editReview.Title')}
            />
            <DigiLayoutContainer afVerticalPadding={true}>
              <DigiLayoutBlock afVerticalPadding={true}>
                <ReviewForm review={review} />
              </DigiLayoutBlock>
            </DigiLayoutContainer>
          </>
        )}
      </main>
    </DigiTypography>
  );
}
