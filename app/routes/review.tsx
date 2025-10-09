import { useParams } from 'react-router-dom';

import ReviewRequirement from '~/components/ReviewRequirement';
import ReviewRequirements from '~/components/ReviewRequirements';

export function meta() {
  return [
    { title: 'Tillgänglighetsverktyget: Granskning' },
    { name: 'description', content: 'Granskning' },
  ];
}

export default function ReviewPage() {
  const { id, reqId } = useParams<{ id: string; reqId?: string }>();

  return (
    <div>
      {id && reqId ? (
        <ReviewRequirement reviewId={String(id)} requirementId={reqId} />
      ) : (
        <ReviewRequirements reviewId={String(id)} />
      )}
    </div>
  );
}
