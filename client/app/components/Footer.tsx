import { FooterCardVariation } from '@designsystem-se/af';
import {
  DigiFooter,
  DigiFooterCard,
  DigiIconAccessibilityUniversal,
  DigiIconEnvelope,
  DigiLink,
  DigiLinkExternal,
} from '@designsystem-se/af-react';
import { useTranslation } from 'react-i18next';

import { organizationConfigurations } from '~/helpers/helpers';

import { InfoCard } from './InfoCard';

export default function Footer() {
  const { t } = useTranslation();
  const { applicationTitle, logo, footerLinks } = organizationConfigurations();
  return (
    <div>
      <InfoCard />
      <DigiFooter>
        <div slot="content-top">
          <DigiFooterCard afType={FooterCardVariation.ICON}>
            <ul>
              <li>
                <DigiLink afHref="/tillganglighetsredogorelse">
                  <DigiIconAccessibilityUniversal></DigiIconAccessibilityUniversal>
                  Tillgänglighetsredogörelse
                </DigiLink>
              </li>
              {footerLinks.map(
                (link: { url: string; external: string; text: string; icon: string }) => {
                  return (
                    <li key={link.url}>
                      {link.external === 'true' ? (
                        <DigiLinkExternal afHref={link.url} afTarget="_blank">
                          {link.text}
                        </DigiLinkExternal>
                      ) : (
                        <DigiLink afHref={link.url}>
                          {link.icon === 'a11y' && (
                            <DigiIconAccessibilityUniversal></DigiIconAccessibilityUniversal>
                          )}
                          {link.icon === 'email' && <DigiIconEnvelope></DigiIconEnvelope>}
                          {link.text}
                        </DigiLink>
                      )}
                    </li>
                  );
                },
              )}
            </ul>
          </DigiFooterCard>

          <div></div>

          <div>
            <DigiFooterCard afType={FooterCardVariation.BORDER}>
              <DigiLink afHref="/">{t('Home.FooterTitle')}</DigiLink>
              <p>{t('Home.FooterDescription')}</p>
            </DigiFooterCard>
            <DigiFooterCard afType={FooterCardVariation.BORDER}>
              <DigiLink afHref="/granskning/skapa">{t('addReview.FooterTitle')}</DigiLink>
              <p>{t('addReview.FooterDescription')}</p>
            </DigiFooterCard>
          </div>
          <div>
            <DigiFooterCard afType={FooterCardVariation.BORDER}>
              <DigiLink afHref="/tips">{t('tips.Title')}</DigiLink>
              <p>{t('tips.FooterDescription')}</p>
            </DigiFooterCard>
            <DigiFooterCard afType={FooterCardVariation.BORDER}>
              <DigiLink afHref="/krav">{t('requirements.Title')}</DigiLink>
              <p>{t('requirements.FooterDescription')}</p>
            </DigiFooterCard>
          </div>
        </div>
        <div slot="content-bottom-left">
          <DigiLink
            afAriaLabel={t('HomeLink', { appName: applicationTitle })}
            afHref="/"
            className="flex gap-4 pb-5 items-center text-white hover:text-white visited:!text-white !no-underline"
          >
            <img src={logo.footer.mobileUrl} alt="" className="md:hidden" />
            <img src={logo.footer.desktopUrl} alt="" className="hidden md:inline-block" />
          </DigiLink>
        </div>
      </DigiFooter>
    </div>
  );
}
