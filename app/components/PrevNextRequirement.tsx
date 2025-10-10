import { DigiTypography } from '@digi/arbetsformedlingen-react';

import type { Requirement } from '~/data/types';

import { StyledLink } from './StyledLink';

interface Props {
  reviewId: string;
  nextUnhandled?: Requirement | undefined;
  previousUnhandled?: Requirement | undefined;
}

export default function PrevNextRequirement({ reviewId, nextUnhandled, previousUnhandled }: Props) {
  return (
    <div className="content-container content-container--white content-container--largest">
      <DigiTypography>
        {nextUnhandled && <h4>Nästa ogranskade krav: {nextUnhandled.name}</h4>}
        <div className="flex flex-col sm:flex-row gap-4 mt-4">
          {previousUnhandled && (
            <StyledLink
              styleVariant="secondary-button"
              to={`/granskning/${reviewId}/${previousUnhandled.id}#krav`}
              text="Föregående ogranskade krav"
              ariaLabel={`Föregående ogranskade krav: ${previousUnhandled.name}`}
            />
          )}

          {nextUnhandled && (
            <StyledLink
              styleVariant="primary-button"
              to={`/granskning/${reviewId}/${nextUnhandled.id}#krav`}
              text="Nästa ogranskade krav"
              ariaLabel={`Nästa ogranskade krav: ${nextUnhandled.name}`}
            />
          )}
        </div>
      </DigiTypography>
    </div>
  );
}
