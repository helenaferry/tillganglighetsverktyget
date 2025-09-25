import { ReviewsList } from '~/components/ReviewsList';

export function meta() {
  return [
    { title: 'Granska tillgänglighet' },
    { name: 'description', content: 'Hur tillgänglig är din webbplats?' },
  ];
}

export default function HomePage() {
  return <ReviewsList />;
}
