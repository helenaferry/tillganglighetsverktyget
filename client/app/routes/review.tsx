import { useParams } from 'react-router-dom';

import ReviewRequirement from '~/components/ReviewRequirement';
import { organizationConfigurations } from '~/helpers/helpers';
import i18n from '~/lang/i18n';

const applicationTitle = organizationConfigurations().applicationTitle;

export function meta() {
  return [
    { title: `${i18n.t('ReviewRequirement.ReviewView')} - ${applicationTitle}` },
    { name: 'description', content: i18n.t('ReviewRequirement.ReviewView') },
  ];
}

export default function ReviewPage() {
  const { id, reqId } = useParams<{ id: string; reqId: string }>();

  return <ReviewRequirement key={reqId} reviewId={String(id)} requirementId={String(reqId)} />;
}
