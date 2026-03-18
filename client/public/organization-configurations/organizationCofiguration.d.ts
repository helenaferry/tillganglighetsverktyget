export declare const organizationConfiguration: {
  applicationTitle?: string;
  logo?: {
    header?: { mobileUrl: string; desktopUrl: string };
    footer?: { mobileUrl: string; desktopUrl: string };
  };
  regulatoryFramework?: string;
  requirementAdditions?: {
    heading: string;
    items: { id: string; text: string }[];
  };
  footerLinks?: { text: string; url: string; external?: string; icon?: string }[];
  prefillRequirements?: {
    id: string;
    automatic: string;
    heading?: string;
    description?: string;
    activateText?: string;
    prefillRequirements: {
      ids: string[];
      status: string;
      comment: string;
    }[];
  }[];
};
