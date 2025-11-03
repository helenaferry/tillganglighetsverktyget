import {
  DigiHeaderNavigation,
  DigiHeaderNavigationItem,
  DigiNavigationSidebarButton,
  DigiTypography,
} from '@designsystem-se/af-react';
import { Link } from 'react-router';

import { envVars } from '~/helpers';

import SkipLink from './SkipLink';
import { useLocation } from 'react-router-dom';

export default function Header() {
  const { applicationTitle, logoUrl, logoWidth, logoHeight } = envVars();
  const location = useLocation();

  return (
    <header className="bg-white">
      <DigiTypography>
        <div className="grid grid-cols-[1fr_5rem] md:grid-cols-1 w-full  border-b-1 border-b-grayscale-200">
          <div className="min-w-0">
            <SkipLink />
            <Link
              aria-label={`Startsida för ${applicationTitle}`}
              to="/"
              className="flex gap-4 p-5 items-center text-text hover:text-text visited:!text-text !no-underline"
            >
              <img
                src={logoUrl}
                alt=""
                style={{ width: logoWidth, height: logoHeight }}
                className="border-r-2 border-r-text pr-4"
              />
              <span className="font-bold text-base sm:text-[1.7rem] w-full max-w-full break-words hyphens-auto">
                {applicationTitle}
              </span>
            </Link>
          </div>
          <div className="flex items-center justify-end md:hidden" style={{ minWidth: '0' }}>
            <DigiNavigationSidebarButton afAriaLabel="Öppna meny" />
          </div>
        </div>
        <DigiHeaderNavigation
          afCloseButtonText="Stäng"
          afCloseButtonAriaLabel="Stäng meny"
          afNavAriaLabel="Huvudmeny"
        >
          <DigiHeaderNavigationItem afCurrentPage={location.pathname === '/'}>
            <Link to="/">Granskningar</Link>
          </DigiHeaderNavigationItem>
          <DigiHeaderNavigationItem afCurrentPage={location.pathname === '/krav'}>
            <Link to="/krav">Krav</Link>
          </DigiHeaderNavigationItem>
        </DigiHeaderNavigation>
      </DigiTypography>
    </header>
  );
}
