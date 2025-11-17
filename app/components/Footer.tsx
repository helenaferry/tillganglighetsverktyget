import {
  DigiFooterCard,
  DigiIconAccessibilityUniversal,
  DigiIconEnvelope,
  DigiLinkExternal,
} from '@designsystem-se/af-react';

import { envVars } from '~/helpers';

import { StyledLink } from './StyledLink';
import { FooterCardVariation } from '@designsystem-se/af';

export default function Footer() {
  const { applicationTitle, logoUrl, logoWidth, logoHeight } = envVars();

  return (
    <footer className="bg-stratos-500 px-8 py-12">
      <div className="content-container content-container--largest content-container--nomargin content-container--nopadding">
        <div className="flex flex-col justify-between lg:flex-row gap-5">
          <DigiFooterCard afType={FooterCardVariation.ICON}>
            <ul>
              <li>
                <StyledLink
                  to="#"
                  overrideLink={true}
                  onClick={(e) => {
                    e.preventDefault();
                    alert('Kommer ...');
                  }}
                >
                  <DigiIconAccessibilityUniversal></DigiIconAccessibilityUniversal>
                  Tillgänglighetsredogörelse
                </StyledLink>
              </li>
              <li>
                <StyledLink to="mailto:designsystem@arbetsformedlingen.se">
                  <DigiIconEnvelope></DigiIconEnvelope>
                  Mejla vår funktionsbrevlåda
                </StyledLink>
              </li>
              <li>
                <DigiLinkExternal
                  afHref="https://designsystem.arbetsformedlingen.se"
                  afTarget="_blank"
                >
                  Arbetsförmedlingens designsystem (öppnas i egen flik)
                </DigiLinkExternal>
              </li>
            </ul>
          </DigiFooterCard>

          <div className="basis-[37%] grid sm:grid-cols-2 gap-5">
            <DigiFooterCard afType={FooterCardVariation.BORDER}>
              <StyledLink to="/">Alla granskningar</StyledLink>
              <p>Återuppta en befintlig granskning eller skapa en ny.</p>
            </DigiFooterCard>
            <DigiFooterCard afType={FooterCardVariation.BORDER}>
              <StyledLink to="/granskning/skapa">Skapa ny granskning</StyledLink>
              <p>Namnge och svara på några frågor om tjänsten som ska granskas.</p>
            </DigiFooterCard>
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
    </footer>
  );
}
