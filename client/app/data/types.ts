export enum ObjectType {
  WEB = 'web',
  DOCUMENT = 'doc',
  APP = 'app',
}

export type Requirement = {
  id: string;
  name: string;
  regulatoryFramework: string;
  wcag: string;
  en301549: string;
  contentType: string;
  category: string;
  objectType: ObjectType;
  statement: string;
  why: string;
  howToTest: string;
  textSuggestions?: string[];
};

export enum Status {
  FAIL, //0
  PASS, //1
  IRRELEVANT, //2
  NOT_ASSESSED, //3
}

// Database types
import type { Database } from '~/data/supabase-types';

export type Review = Database['public']['Tables']['reviews']['Row'];
export type Check = Database['public']['Tables']['checks']['Row'];

export type ReviewSummary = Review & {
  latestUpdate: string;
  reviewedCount: number;
  passCount: number;
  failCount: number;
  irrelevantCount: number;
};
export type RequirementWithCheck = Requirement & { check?: Check };

export type UpsertCheckInput = {
  reviewId: number;
  requirement: string;
  status: Status;
  comment?: string;
};

export type Category = {
  category: string;
  requirements: RequirementWithCheck[];
};

export type PrefillRequirement = {
  status: string;
  ids: string[];
  comment: string;
};

export type PrefillRequirementSetting = {
  id: string;
  automatic: string;
  heading?: string;
  description?: string;
  activateText?: string;
  prefillRequirements: PrefillRequirement[];
};

export type RequirementAdditionsSetting = {
  heading: string;
  items: { id: string; text: string }[];
};

export type LogoConfig = {
  header: {
    mobileUrl: string;
    desktopUrl: string;
  };
  footer: {
    mobileUrl: string;
    desktopUrl: string;
  };
};
