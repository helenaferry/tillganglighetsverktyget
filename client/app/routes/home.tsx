import { ReviewsList } from '~/components/ReviewsList';
import { organizationConfigurations } from '~/helpers/helpers';
import i18n from '~/lang/i18n';

export function meta() {
  const { applicationTitle } = organizationConfigurations();

  return [
    { title: applicationTitle },
    { name: 'description', content: i18n.t('Home.MetaDescription') },
  ];
}

export default function HomePage() {
  return <ReviewsList />;
}
