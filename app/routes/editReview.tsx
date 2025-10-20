import {
  TypographyHeadingJumboLevel,
  TypographyHeadingJumboVariation,
} from '@digi/arbetsformedlingen';
import { DigiTypography, DigiTypographyHeadingJumbo } from '@digi/arbetsformedlingen-react';
import { useParams } from 'react-router-dom';

import Breadcrumbs from '~/components/Breadcrumbs';
import { ReviewForm } from '~/components/ReviewForm';

export function meta() {
  return [
    { title: 'Tillgänglighetsverktyget: Ändra granskningsuppgifter' },
    { name: 'description', content: 'Ändra granskningsuppgifter' },
  ];
}

export default function EditReviewPage() {
  const { id } = useParams<{ id: string }>();

  return (
    <DigiTypography>
      <div className="content-container content-container--white content-container--nomargin">
        <Breadcrumbs
          pages={[{ title: 'Granskningar', href: '/' }]}
          currentPage="Ändra granskningsuppgifter"
        />
        <DigiTypographyHeadingJumbo
          afText="Ändra granskningsuppgifter"
          afLevel={TypographyHeadingJumboLevel.H1}
          afVariation={TypographyHeadingJumboVariation.PRIMARY}
        ></DigiTypographyHeadingJumbo>
        <ReviewForm reviewId={String(id)} />
      </div>
    </DigiTypography>
  );
}
