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
  const { applicationTitle, logo } = envVars();
  const location = useLocation();

  return (
    <header className="bg-white">
      <DigiTypography>
        <DigiLayoutContainer>
          <div className="flex justify-between items-center">
            <div className="min-w-0">
              <StyledLink
                ariaLabel={t('HomeLink', { appName: applicationTitle })}
                to="/"
                styleVariant="plain"
                className="flex gap-4 py-5 items-center text-text hover:text-text visited:!text-text !no-underline"
              >
                <img src={logo.header.mobileUrl} alt="" className="md:hidden" />
                <img src={logo.header.desktopUrl} alt="" className="hidden md:inline-block" />
              </StyledLink>
            </div>
            <div className="md:hidden">
              <DigiNavigationSidebarButton afAriaLabel={t('Header.OpenMenu')} />
            </div>
          </div>
        </DigiLayoutContainer>
        <DigiLayoutContainer afNoGutter={true} afVariation={LayoutContainerVariation.FLUID}>
          <div className="border-t-1 border-grayscale-200">
            <DigiHeaderNavigation
              afCloseButtonText={t('Header.Close')}
              afCloseButtonAriaLabel={t('Header.CloseMenu')}
              afNavAriaLabel={t('Header.MainMenu')}
              afCentered={HeaderCenterContentWidth.WIDTH_1400}
            >
              <DigiHeaderNavigationItem
                afCurrentPage={
                  location.pathname === '/' || location.pathname.includes('granskning')
                }
              >
                <StyledLink to="/" styleVariant="plain">
                  {t('Home.Title')}
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
