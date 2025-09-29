import { useParams } from 'react-router-dom';

import Review from '~/components/Review';

export function meta() {
  return [
    { title: 'Tillgänglighetsverktyget: Granskning' },
    { name: 'description', content: 'Granskning' },
  ];
}

export default function ReviewPage() {
  const { id, reqId } = useParams<{ id: string; reqId?: string }>();

  return <Review reviewId={String(id)} requirementId={reqId} />;
}
