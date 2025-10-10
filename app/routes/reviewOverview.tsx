import { useParams } from 'react-router-dom';

import ReviewRequirements from '~/components/ReviewRequirements';

export function meta() {
  return [
    { title: 'Granska tillgänglighet: Granskningsöversikt' },
    { name: 'description', content: 'Granskningsöversikt' },
  ];
}

export default function ReviewPage() {
  const { id } = useParams<{ id: string }>();

  return <ReviewRequirements key={String(id)} reviewId={String(id)} />;
}
