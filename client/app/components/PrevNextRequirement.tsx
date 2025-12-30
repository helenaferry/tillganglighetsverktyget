import { DigiLayoutBlock, DigiLayoutContainer, DigiTypography } from '@designsystem-se/af-react';
import { useTranslation } from 'react-i18next';

import type { Requirement } from '~/data/types';

import { StyledLink } from './StyledLink';

interface Props {
  reviewId: string;
  nextUnhandled?: Requirement | undefined;
  previousUnhandled?: Requirement | undefined;
}

export default function PrevNextRequirement({ reviewId, nextUnhandled, previousUnhandled }: Props) {
  const { t } = useTranslation();
  return (
    <DigiLayoutContainer afNoGutter={true}>
      <DigiLayoutBlock afVerticalPadding={true}>
        <DigiTypography>
          <h4>
            {nextUnhandled
              ? `${t('PrevNextRequirement.NextRequirement')}: ${nextUnhandled.name}`
              : ''}
            {!nextUnhandled && previousUnhandled
              ? `${t('PrevNextRequirement.PreviousRequirement')}: ${previousUnhandled.name}`
              : ''}
            {!nextUnhandled && !previousUnhandled ? t('PrevNextRequirement.NoMoreUnhandled') : ''}
          </h4>
          <div className="flex flex-col sm:flex-row gap-4 mt-4">
            {previousUnhandled && (
              <StyledLink
                styleVariant="secondary-button"
                to={`/granskning/${reviewId}/${previousUnhandled.id}#krav`}
                ariaLabel={`${t('PrevNextRequirement.PreviousRequirement')}: ${previousUnhandled.name}`}
                overrideLink={true}
              >
                {t('PrevNextRequirement.PreviousRequirement')}
              </StyledLink>
            )}

            {nextUnhandled && (
              <StyledLink
                styleVariant="primary-button"
                to={`/granskning/${reviewId}/${nextUnhandled.id}#krav`}
                ariaLabel={`${t('PrevNextRequirement.NextRequirement')}: ${nextUnhandled.name}`}
                overrideLink={true}
              >
                {t('PrevNextRequirement.NextRequirement')}
              </StyledLink>
            )}

            {!nextUnhandled && !previousUnhandled && (
              <StyledLink
                to={`/granskning/${reviewId}/underkanda-krav`}
                styleVariant="link-button-secondary"
                hideIcon
              >
                {t('ReviewRequirements.CompileFailed')}
              </StyledLink>
            )}
          </div>
        </DigiTypography>
      </DigiLayoutBlock>
    </DigiLayoutContainer>
  );
}
