import { LinkButtonVariation } from '@designsystem-se/af';
import {
  DigiLayoutBlock,
  DigiLayoutContainer,
  DigiLinkButton,
  DigiTypography,
} from '@designsystem-se/af-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';

import type { Requirement } from '~/data/types';

interface Props {
  reviewId: string;
  nextUnhandled?: Requirement | undefined;
  previousUnhandled?: Requirement | undefined;
}

export default function PrevNextRequirement({ reviewId, nextUnhandled, previousUnhandled }: Props) {
  const { t } = useTranslation();
  const navigate = useNavigate();
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
              <DigiLinkButton
                afVariation={LinkButtonVariation.SECONDARY}
                afHref={`/granskning/${reviewId}/${previousUnhandled.id}#krav`}
                afOverrideLink={true}
                onAfOnClick={(e) => {
                  e.preventDefault();
                  navigate(`/granskning/${reviewId}/${previousUnhandled.id}#krav`);
                }}
              >
                {t('PrevNextRequirement.PreviousRequirement')}
              </DigiLinkButton>
            )}

            {nextUnhandled && (
              <DigiLinkButton
                afVariation={LinkButtonVariation.PRIMARY}
                afHref={`/granskning/${reviewId}/${nextUnhandled.id}#krav`}
                afOverrideLink={true}
                onAfOnClick={(e) => {
                  e.preventDefault();
                  navigate(`/granskning/${reviewId}/${nextUnhandled.id}#krav`);
                }}
              >
                {t('PrevNextRequirement.NextRequirement')}
              </DigiLinkButton>
            )}

            {!nextUnhandled && !previousUnhandled && (
              <DigiLinkButton
                afHref={`/granskning/${reviewId}/underkanda-krav`}
                afVariation={LinkButtonVariation.SECONDARY}
                afHideIcon={true}
              >
                {t('ReviewRequirements.GoToFailedSummary')}
              </DigiLinkButton>
            )}
          </div>
        </DigiTypography>
      </DigiLayoutBlock>
    </DigiLayoutContainer>
  );
}
