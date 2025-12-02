import { FooterCardVariation } from '@designsystem-se/af';
import {
  DigiFooter,
  DigiFooterCard,
  DigiIconAccessibilityUniversal,
  DigiIconEnvelope,
  DigiLinkExternal,
} from '@designsystem-se/af-react';
import { useTranslation } from 'react-i18next';

import { envVars } from '~/helpers';

import { StyledLink } from './StyledLink';
import { InfoCard } from './InfoCard';

export default function Footer() {
  const { t } = useTranslation();
  const { applicationTitle, logo, footerLinks } = envVars();
  return (
    <div>
      <InfoCard />
      <DigiFooter>
        <div slot="content-top">
          <DigiFooterCard afType={FooterCardVariation.ICON}>
            <ul>
              <li>
                <StyledLink to="/tillganglighetsredogorelse">
                  <DigiIconAccessibilityUniversal></DigiIconAccessibilityUniversal>
                  Tillgänglighetsredogörelse
                </StyledLink>
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
                        <StyledLink to={link.url}>
                          {link.icon === 'a11y' && (
                            <DigiIconAccessibilityUniversal></DigiIconAccessibilityUniversal>
                          )}
                          {link.icon === 'email' && <DigiIconEnvelope></DigiIconEnvelope>}
                          {link.text}
                        </StyledLink>
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
              <StyledLink to="/">{t('Home.FooterTitle')}</StyledLink>
              <p>{t('Home.FooterDescription')}</p>
            </DigiFooterCard>
            <DigiFooterCard afType={FooterCardVariation.BORDER}>
              <StyledLink to="/granskning/skapa">{t('addReview.FooterTitle')}</StyledLink>
              <p>{t('addReview.FooterDescription')}</p>
            </DigiFooterCard>
          </div>
          <div>
            <DigiFooterCard afType={FooterCardVariation.BORDER}>
              <StyledLink to="/tips">{t('tips.Title')}</StyledLink>
              <p>{t('tips.FooterDescription')}</p>
            </DigiFooterCard>
            <DigiFooterCard afType={FooterCardVariation.BORDER}>
              <StyledLink to="/krav">{t('requirements.Title')}</StyledLink>
              <p>{t('requirements.FooterDescription')}</p>
            </DigiFooterCard>
          </div>
        </div>
        <div slot="content-bottom-left">
          <StyledLink
            ariaLabel={t('HomeLink', { appName: applicationTitle })}
            to="/"
            className="flex gap-4 pb-5 items-center text-white hover:text-white visited:!text-white !no-underline"
          >
            <img src={logo.footer.mobileUrl} alt="" className="md:hidden" />
            <img src={logo.footer.desktopUrl} alt="" className="hidden md:inline-block" />
          </StyledLink>
        </div>
      </DigiFooter>
    </div>
  );
}
