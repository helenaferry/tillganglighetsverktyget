import { DigiTypography } from '@digi/arbetsformedlingen-react';
import { useParams } from 'react-router-dom';

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
    <DigiTypography>
      <ReviewForm reviewId={String(id)} />
    </DigiTypography>
  );
}
