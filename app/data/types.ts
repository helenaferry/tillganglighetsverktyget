export enum RequirementType {
  REQUIREMENT = 'requirement',
  GUIDELINE = 'guideline',
}

export enum ObjectType {
  WEB = 'web',
  DOCUMENT = 'doc',
  APP = 'app',
}

export type Requirement = {
  id: string;
  name: string;
  type: RequirementType;
  wcag: string;
  en301549: string;
  contentType: string;
  category: string;
  objectType: ObjectType;
  statement: string;
  why: string;
  howToTest: string;
};

export enum Status {
  FAIL, //0
  PASS, //1
  IRRELEVANT, //2
  NOT_ASSESSED, //3
}

export enum StatusText {
  FAIL = 'Underkänt',
  PASS = 'Godkänt',
  IRRELEVANT = 'Irrelevant',
  NOT_ASSESSED = 'Ej granskat',
}

// Database types
import type { Database } from '~/data/supabase-types';

export type Review = Database['public']['Tables']['reviews']['Row'];
export type Check = Database['public']['Tables']['checks']['Row'];

export type ReviewSummary = Review & {
  latestUpdate: string;
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
  id: string;
  comment: string;
};

export type PrefillRequirementSetting = {
  id: string;
  automatic: string;
  activateText?: string;
  prefillRequirements: PrefillRequirement[];
};

export type RequirementAdditionsSetting = {
  heading: string;
  items: { id: string; text: string }[];
};
