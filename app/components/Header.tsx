import { HeaderCenterContentWidth, LayoutContainerVariation } from '@designsystem-se/af';
import {
  DigiHeaderNavigation,
  DigiHeaderNavigationItem,
  DigiLayoutContainer,
  DigiNavigationSidebarButton,
  DigiTypography,
} from '@designsystem-se/af-react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';

import { envVars } from '~/helpers';

import { StyledLink } from './StyledLink';

export default function Header() {
  const { t } = useTranslation();
  const { applicationTitle, logoUrl, logoWidth, logoHeight } = envVars();
  const location = useLocation();

  return (
    <header className="bg-white">
      <DigiTypography>
        <DigiLayoutContainer>
          <div className="flex justify-between items-center">
            <div className="min-w-0">
              <StyledLink
                aria-label={t('homeLink', { appName: applicationTitle })}
                to="/"
                styleVariant="plain"
                className="flex gap-4 py-5 items-center text-text hover:text-text visited:!text-text !no-underline"
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
            <div className="md:hidden">
              <DigiNavigationSidebarButton afAriaLabel={t('Header.openMenu')} />
            </div>
          </div>
        </DigiLayoutContainer>
        <DigiLayoutContainer afNoGutter={true} afVariation={LayoutContainerVariation.FLUID}>
          <div className="border-t-1 border-grayscale-200">
            <DigiHeaderNavigation
              afCloseButtonText={t('Header.close')}
              afCloseButtonAriaLabel={t('Header.closeMenu')}
              afNavAriaLabel={t('Header.mainMenu')}
              afCentered={HeaderCenterContentWidth.WIDTH_1400}
            >
              <DigiHeaderNavigationItem
                afCurrentPage={
                  location.pathname === '/' || location.pathname.includes('granskning')
                }
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
            </DigiHeaderNavigation>
          </div>
        </DigiLayoutContainer>
      </DigiTypography>
    </header>
  );
}
