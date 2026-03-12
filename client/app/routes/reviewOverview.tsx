import { useParams } from 'react-router-dom';

import ReviewRequirements from '~/components/ReviewRequirements';
import { organizationConfigurations } from '~/helpers/helpers';
const applicationTitle = organizationConfigurations().applicationTitle;
import i18n from '~/lang/i18n';

export function meta() {
  return [
    { title: `${i18n.t('ReviewRequirements.ReviewOverview')} - ${applicationTitle}` },
    { name: 'description', content: i18n.t('ReviewRequirements.ReviewOverview') },
  ];
}

export default function ReviewPage() {
  const { id } = useParams<{ id: string }>();

  return <ReviewRequirements key={String(id)} reviewId={String(id)} />;
}
