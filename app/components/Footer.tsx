import { DigiFooterCard } from '@designsystem-se/af-react';

import { envVars } from '~/helpers';

import { StyledLink } from './StyledLink';

export default function Footer() {
  const { applicationTitle, logoUrl, logoWidth, logoHeight } = envVars();

  return (
    <footer className="bg-stratos-500 px-8 py-12">
      <DigiFooterCard>
        <ul>
          <li>
            <StyledLink to="/">Alla granskningar</StyledLink>
          </li>
          <li>
            <StyledLink to="/granskning/skapa">Skapa ny granskning</StyledLink>
          </li>
          <li>
            <StyledLink to="/krav">Tillgänglighetskrav</StyledLink>
          </li>
          <li>
            <StyledLink to="/tips">Tips och råd</StyledLink>
          </li>
          <li>
            <StyledLink
              to="#"
              overrideLink={true}
              onClick={(e) => {
                e.preventDefault();
                alert('Kommer ...');
              }}
            >
              Tillgänglighetsredogörelse
            </StyledLink>
          </li>
        </ul>
      </DigiFooterCard>

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
        <span className="font-bold text-base text-white w-full max-w-full break-words hyphens-auto">
          {applicationTitle}
        </span>
      </StyledLink>
    </footer>
  );
}
