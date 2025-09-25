import { DigiTypography, DigiTypographyHeadingJumbo } from '@digi/arbetsformedlingen-react';
import { ReviewForm } from '~/components/ReviewForm';
import {
  TypographyHeadingJumboLevel,
  TypographyHeadingJumboVariation,
} from '@digi/arbetsformedlingen';

export function meta() {
  return [
    { title: 'Tillgänglighetsverktyget: Skapa ny granskning' },
    { name: 'description', content: 'Skapa ny granskning' },
  ];
}

export default function AddReviewPage() {
  return (
    <DigiTypography>
      <div className="content-container">
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
