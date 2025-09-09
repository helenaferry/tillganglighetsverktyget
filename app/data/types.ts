export enum Level {
    Astar = "A*",
    A = "A",
    AA = "AA",
}

export interface HowToTest {
    id: number;
    title: string;
    content: string;
}

export type Requirement = {
    id: string;
    topic: string;
    criteria: string;
    category: string;
    level: Level;
    principle: string;
    guideline: string;
    statement: string;
    why: string;
    role: string;
    wcag: string;
    howToTest: HowToTest;
}

export enum Status {
    FAIL, //0
    PASS, //1
    IRRELEVANT, //2
    NOT_ASSESSED //3
}

// Database types
import type { Database } from "~/data/supabase-types";

export type Review = Database['public']['Tables']['reviews']['Row'];
export type Check = Database['public']['Tables']['checks']['Row'];
export type Application = Database['public']['Tables']['applications']['Row'];

export type ReviewWithApplication = Review & { application?: Application };

export type ReviewSummary = Review & {
    latestUpdate: string;
    application?: Application;
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
}