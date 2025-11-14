import {
  DigiHeaderNavigation,
  DigiHeaderNavigationItem,
  DigiNavigationSidebarButton,
  DigiTypography,
} from '@designsystem-se/af-react';
import { useLocation } from 'react-router-dom';

import { envVars } from '~/helpers';

import { StyledLink } from './StyledLink';
import { useTranslation } from 'react-i18next';

export default function Header() {
  const { t } = useTranslation();
  const { applicationTitle, logoUrl, logoWidth, logoHeight } = envVars();
  const location = useLocation();

  return (
    <header className="bg-white">
      <DigiTypography>
        <div className="grid grid-cols-[1fr_5rem] md:grid-cols-1 w-full  border-b-1 border-b-grayscale-200">
          <div className="min-w-0">
            <StyledLink
              aria-label={`${t('Header.startPageLink')} ${applicationTitle}`}
              to="/"
              styleVariant="plain"
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
            </StyledLink>
          </div>
          <div className="flex items-center justify-end md:hidden" style={{ minWidth: '0' }}>
            <DigiNavigationSidebarButton afAriaLabel={t('Header.openMenu')} />
          </div>
        </div>
        <DigiHeaderNavigation
          afCloseButtonText={t('Header.close')}
          afCloseButtonAriaLabel={t('Header.closeMenu')}
          afNavAriaLabel={t('Header.mainMenu')}
        >
          <DigiHeaderNavigationItem
            afCurrentPage={location.pathname === '/' || location.pathname.includes('granskning')}
          >
            <StyledLink to="/" styleVariant="plain">
              {t('start.Title')}
            </StyledLink>
          </DigiHeaderNavigationItem>
          <DigiHeaderNavigationItem afCurrentPage={location.pathname === '/krav'}>
            <StyledLink to="/krav" styleVariant="plain">
              {t('requirements.Title')}
            </StyledLink>
          </DigiHeaderNavigationItem>
          <DigiHeaderNavigationItem afCurrentPage={location.pathname === '/tips'}>
            <StyledLink to="/tips" styleVariant="plain">
              {t('tips.Title')}
            </StyledLink>
          </DigiHeaderNavigationItem>
          <DigiHeaderNavigationItem afCurrentPage={location.pathname === '/kravOld'}>
            <StyledLink to="/kravOld" styleVariant="plain">
              Krav (gammal)
            </StyledLink>
          </DigiHeaderNavigationItem>
        </DigiHeaderNavigation>
      </DigiTypography>
    </header>
  );
}
