import { TypographyHeadingJumboLevel, TypographyHeadingJumboVariation } from '@designsystem-se/af';
import { DigiTypography, DigiTypographyHeadingJumbo } from '@designsystem-se/af-react';

import Breadcrumbs from '~/components/Breadcrumbs';
import { ReviewForm } from '~/components/ReviewForm';

const applicationTitle = import.meta.env.VITE_APPLICATION_TITLE || 'Granska tillgänglighet';

export function meta() {
  return [
    { title: `${applicationTitle}: Skapa ny granskning` },
    { name: 'description', content: 'Skapa ny granskning' },
  ];
}

export default function AddReviewPage() {
  return (
    <DigiTypography>
      <div className="content-container content-container--white content-container--nomargin">
        <Breadcrumbs
          pages={[{ title: 'Granskningar', href: '/' }]}
          currentPage="Skapa ny granskning"
        />
        <DigiTypographyHeadingJumbo
          afText="Skapa ny granskning"
          afLevel={TypographyHeadingJumboLevel.H1}
          afVariation={TypographyHeadingJumboVariation.PRIMARY}
        ></DigiTypographyHeadingJumbo>
        <ReviewForm />
      </div>
    </DigiTypography>
  );
}
