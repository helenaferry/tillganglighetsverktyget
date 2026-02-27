import { type LogoConfig, type RequirementWithCheck, Status } from '~/data/types';
import i18n from '~/lang/i18n';
import { organizationConfiguration } from '../../public/organization-configurations/organizationCofiguration.js';

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
    const raw = organizationConfiguration.logo;
    if (!organizationConfiguration.logo) return defaultLogo;
    try {
      if (
        organizationConfiguration.logo?.header?.mobileUrl &&
        organizationConfiguration.logo?.header?.desktopUrl &&
        organizationConfiguration.logo?.footer?.mobileUrl &&
        organizationConfiguration.logo?.footer?.desktopUrl
      ) {
        return organizationConfiguration.logo as LogoConfig;
      }
      return defaultLogo;
    } catch {
      return defaultLogo;
    }
  };
  return {
    applicationTitle: organizationConfiguration.applicationTitle || i18n.t('FallbackApplicationTitle'),
    logo: parseLogo(),
    footerLinks: organizationConfiguration.footerLinks
      ? organizationConfiguration.footerLinks
      : [],
    regulatoryFramework: organizationConfiguration.regulatoryFramework || '',
    requirementAdditions: organizationConfiguration.requirementAdditions,
    prefillRequirements: organizationConfiguration.prefillRequirements
  };
}
