import {
  DigiLayoutContainer,
  DigiTypography,
  DigiTypographyHeadingJumbo,
} from '@digi/arbetsformedlingen-react';
import { ReviewsList } from '~/components/ReviewsList';
import { StyledLink } from '~/components/StyledLink';
import {
  TypographyHeadingJumboLevel,
  TypographyHeadingJumboVariation,
} from '@digi/arbetsformedlingen';

export function meta() {
  return [
    { title: 'Tillgänglighetsverktyget' },
    { name: 'description', content: 'Hur tillgänglig är din webbplats?' },
  ];
}

export default function HomePage() {
  return (
    <DigiLayoutContainer afVerticalPadding>
      <DigiTypography>
        <>
          <DigiTypographyHeadingJumbo
            afText="Granskningar"
            afLevel={TypographyHeadingJumboLevel.H1}
            afVariation={TypographyHeadingJumboVariation.PRIMARY}
          ></DigiTypographyHeadingJumbo>
          <ReviewsList />
          <StyledLink to="/add" text="Skapa ny granskning" isButton={true} />
        </>
      </DigiTypography>
    </DigiLayoutContainer>
  );
}
