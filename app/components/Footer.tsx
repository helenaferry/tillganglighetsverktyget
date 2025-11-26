import { FooterCardVariation } from '@designsystem-se/af';
import {
  DigiFooter,
  DigiFooterCard,
  DigiIconAccessibilityUniversal,
  DigiIconEnvelope,
  DigiLinkExternal,
} from '@designsystem-se/af-react';

import { envVars } from '~/helpers';

import { StyledLink } from './StyledLink';

export default function Footer() {
  const { applicationTitle, logoUrl, logoWidth, logoHeight, footerLinks } = envVars();
  console.log(footerLinks);
  return (
    <DigiFooter>
      <div slot="content-top">
        <DigiFooterCard afType={FooterCardVariation.ICON}>
          {footerLinks && footerLinks.length > 0 && (
            <ul>
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
          )}
        </DigiFooterCard>

        <div></div>

        <div>
          <DigiFooterCard afType={FooterCardVariation.BORDER}>
            <StyledLink to="/">Alla granskningar</StyledLink>
            <p>Återuppta en befintlig granskning eller skapa en ny.</p>
          </DigiFooterCard>
          <DigiFooterCard afType={FooterCardVariation.BORDER}>
            <StyledLink to="/granskning/skapa">Skapa ny granskning</StyledLink>
            <p>Namnge och svara på några frågor om tjänsten som ska granskas.</p>
          </DigiFooterCard>
        </div>
        <div>
          <DigiFooterCard afType={FooterCardVariation.BORDER}>
            <StyledLink to="/tips">Tips och råd</StyledLink>
            <p>Tips om hur du genomför en tillgänglighetsgranskning.</p>
          </DigiFooterCard>
          <DigiFooterCard afType={FooterCardVariation.BORDER}>
            <StyledLink to="/krav">Tillgänglighetskrav</StyledLink>
            <p>Läs om alla tillgänglighetskrav. Sök eller filtrera fram specifika krav.</p>
          </DigiFooterCard>
        </div>
      </div>
      <div slot="content-bottom-left">
        <StyledLink
          aria-label={`Startsida för ${applicationTitle}`}
          to="/"
          className="flex gap-4 pb-5 items-center text-white hover:text-white visited:!text-white !no-underline"
        >
          <img
            src={logoUrl}
            alt=""
            style={{ width: logoWidth, height: logoHeight }}
            className="border-r-2 border-r-white pr-4"
          />
          <span className="font-bold text-[1.75rem] text-white w-full max-w-full break-words hyphens-auto">
            {applicationTitle}
          </span>
        </StyledLink>
      </div>
    </DigiFooter>
  );
}
