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

// Supabase types
import type { Database } from "~/data/supabase-types";

export type Review = Database['public']['Tables']['reviews']['Row'];
export type Check = Database['public']['Tables']['checks']['Row'];
export type Application = Database['public']['Tables']['applications']['Row'];

// Extended types
export type ReviewWithApplication = Review & {
    application?: Application;
};
export type RequirementWithCheck = Requirement & { check?: Check };

export type FullReview = {
    id: number;
    created_at: string;
    updated?: string;
    title: string | null;
    application?: Application;
    requirements: RequirementWithCheck[];
};

export type UpsertCheckInput = {
    reviewId: number;
    requirement: string;
    status?: 'pass' | 'fail' | 'irrelevant';
    comment?: string;
};
