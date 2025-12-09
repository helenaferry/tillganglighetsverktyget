import { type LogoConfig, type RequirementWithCheck, Status } from './data/types';
import i18n from './lang/i18n';

export function numberChecked(requirements: RequirementWithCheck[]) {
  return requirements.filter(
    (req) =>
      req.check?.status === Status.PASS ||
      req.check?.status === Status.FAIL ||
      req.check?.status === Status.IRRELEVANT,
  ).length;
}

export function percentageChecked(requirements: RequirementWithCheck[]) {
  const totalCount = requirements.length;
  if (totalCount === 0) return 0;
  const checkedCount = numberChecked(requirements);
  return (checkedCount / totalCount) * 100;
}

export function numberPerStatus(requirements: RequirementWithCheck[]) {
  const passCount = requirements.filter((req) => req.check?.status === Status.PASS).length;
  const failCount = requirements.filter((req) => req.check?.status === Status.FAIL).length;
  const irrelevantCount = requirements.filter(
    (req) => req.check?.status === Status.IRRELEVANT,
  ).length;
  const notAssessedCount = requirements.filter(
    (req) => !req.check || req.check.status === Status.NOT_ASSESSED,
  ).length;

  return { passCount, failCount, irrelevantCount, notAssessedCount };
}

export function numberRemaining(requirements: RequirementWithCheck[]) {
  return requirements.filter((req) => !req.check || req.check.status === Status.NOT_ASSESSED)
    .length;
}

export function envVars() {
  const defaultLogo: LogoConfig = {
    header: {
      mobileUrl: '/logoHeaderMobile.svg',
      desktopUrl: '/logoHeader.svg',
    },
    footer: {
      mobileUrl: '/logoFooterMobile.svg',
      desktopUrl: '/logoFooter.svg',
    },
  };
  const parseLogo = (): LogoConfig => {
    const raw = import.meta.env.VITE_LOGO;
    if (!raw) return defaultLogo;
    try {
      const parsed = JSON.parse(raw);
      if (
        parsed?.header?.mobileUrl &&
        parsed?.header?.desktopUrl &&
        parsed?.footer?.mobileUrl &&
        parsed?.footer?.desktopUrl
      ) {
        return parsed as LogoConfig;
      }
      return defaultLogo;
    } catch {
      return defaultLogo;
    }
  };
  return {
    applicationTitle: import.meta.env.VITE_APPLICATION_TITLE || i18n.t('FallbackApplicationTitle'),
    logo: parseLogo(),
    footerLinks: import.meta.env.VITE_FOOTER_LINKS
      ? JSON.parse(import.meta.env.VITE_FOOTER_LINKS)
      : [],
    regulatoryFramework: import.meta.env.VITE_REGULATORY_FRAMEWORK || '',
  };
}
