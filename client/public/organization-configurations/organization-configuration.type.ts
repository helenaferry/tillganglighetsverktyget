export interface Logos {
  header: {
    mobileUrl: string;
    desktopUrl: string;
  };
  footer: {
    mobileUrl: string;
    desktopUrl: string;
  };
}

export enum RegulatoryFramework {
  DOS = 'dos',
  LPTT = 'lptt'
}

export interface RequirementAdditions {
  heading: string;
  items: Array<{id: string; text: string}>;
}

export interface PrefillRequirements{
  id: string| number;
  automatic: boolean;
  heading: string;
  description: string;
  activateText: string;
  prefillRequirements?: Array<{ids: Array<string>; status?: string; comment?: string; }>
}

export interface OrganizationConfigurationInterface  {
  applicationTitle: string;
  logo: Logos;
  regulatoryFramework: RegulatoryFramework;
  requirementAdditions?:RequirementAdditions;
  footerLinks?: Array<{icon: string; text: string; url: string;}>;
  prefillRequirements?:Array<PrefillRequirements>;
}