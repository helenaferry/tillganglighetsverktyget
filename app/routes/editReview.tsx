import { useParams } from 'react-router-dom';
import { DigiLayoutContainer, DigiTypography } from '@digi/arbetsformedlingen-react';
import { ReviewForm } from '~/components/ReviewForm';

export function meta() {
  return [
    { title: 'Tillgänglighetsverktyget: Redigera granskningsuppgifter' },
    { name: 'description', content: 'Redigera granskningsuppgifter' },
  ];
}

export default function EditReviewPage() {
  const { id } = useParams<{ id: string }>();

  return (
    <DigiLayoutContainer afVerticalPadding>
      <DigiTypography>
        <ReviewForm reviewId={String(id)} />
      </DigiTypography>
    </DigiLayoutContainer>
  );
}
