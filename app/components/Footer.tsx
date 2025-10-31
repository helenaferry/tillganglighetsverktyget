import { DigiFooter, DigiFooterCard } from '@designsystem-se/af-react';
import { Link } from 'react-router';

import { envVars } from '~/helpers';

export default function Footer() {
  const { applicationTitle, logoUrl, logoWidth, logoHeight } = envVars();

  return (
    <DigiFooter>
      <div slot="content-top">
        <DigiFooterCard>
          <ul>
            <li>
              <Link to="/">Alla granskningar</Link>
            </li>
            <li>
              <Link to="/granskning/skapa">Skapa ny granskning</Link>
            </li>
            <li>
              <Link to="/krav">Krav</Link>
            </li>
            <li>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  alert('Kommer ...');
                }}
              >
                Tillgänglighetsredogörelse
              </a>
            </li>
          </ul>
        </DigiFooterCard>
      </div>
      <div slot="content-bottom-left">
        <Link
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
          <span className="font-bold text-base w-full max-w-full break-words hyphens-auto">
            {applicationTitle}
          </span>
        </Link>
      </div>
    </DigiFooter>
  );
}
