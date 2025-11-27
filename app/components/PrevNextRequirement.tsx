import { DigiLayoutBlock, DigiLayoutContainer, DigiTypography } from '@designsystem-se/af-react';

import type { Requirement } from '~/data/types';

import { StyledLink } from './StyledLink';

interface Props {
  reviewId: string;
  nextUnhandled?: Requirement | undefined;
  previousUnhandled?: Requirement | undefined;
}

export default function PrevNextRequirement({ reviewId, nextUnhandled, previousUnhandled }: Props) {
  return (
    <DigiLayoutContainer afNoGutter={true}>
      <DigiLayoutBlock afVerticalPadding={true}>
        <DigiTypography>
          <h4>
            {nextUnhandled ? `Nästa ogranskade krav: ${nextUnhandled.name}` : ''}
            {!nextUnhandled && previousUnhandled
              ? `Föregående ogranskade krav: ${previousUnhandled.name}`
              : ''}
            {!nextUnhandled && !previousUnhandled ? 'Inga fler ogranskade krav' : ''}
          </h4>
          <div className="flex flex-col sm:flex-row gap-4 mt-4">
            {previousUnhandled && (
              <StyledLink
                styleVariant="secondary-button"
                to={`/granskning/${reviewId}/${previousUnhandled.id}#krav`}
                ariaLabel={`Föregående ogranskade krav: ${previousUnhandled.name}`}
                overrideLink={true}
              >
                Föregående ogranskade krav
              </StyledLink>
            )}

            {nextUnhandled && (
              <StyledLink
                styleVariant="primary-button"
                to={`/granskning/${reviewId}/${nextUnhandled.id}#krav`}
                ariaLabel={`Nästa ogranskade krav: ${nextUnhandled.name}`}
                overrideLink={true}
              >
                Nästa ogranskade krav
              </StyledLink>
            )}

            {!nextUnhandled && !previousUnhandled && (
              <StyledLink
                to={`/granskning/${reviewId}/underkanda-krav`}
                styleVariant="link-button-secondary"
                hideIcon
              >
                Sammanställ underkända krav
              </StyledLink>
            )}
          </div>
        </DigiTypography>
      </DigiLayoutBlock>
    </DigiLayoutContainer>
  );
}
