import { useParams } from 'react-router-dom';

import ReviewRequirement from '~/components/ReviewRequirement';

// TODO: Needs rework if we are to show review title
export function meta() {
  return [{ title: 'Granska' }, { name: 'description', content: 'Granskningsvy' }];
}

export default function ReviewPage() {
  const { id, reqId } = useParams<{ id: string; reqId: string }>();

  return <ReviewRequirement key={reqId} reviewId={String(id)} requirementId={String(reqId)} />;
}
