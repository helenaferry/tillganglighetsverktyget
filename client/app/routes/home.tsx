import { ReviewsList } from '~/components/ReviewsList';
import { envVars } from '~/helpers/helpers';
import i18n from '~/lang/i18n';

export function meta() {
  const { applicationTitle } = envVars();

  return [
    { title: applicationTitle },
    { name: 'description', content: i18n.t('Home.MetaDescription') },
  ];
}

export default function HomePage() {
  return <ReviewsList />;
}
