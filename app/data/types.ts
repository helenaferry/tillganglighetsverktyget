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

// PocketBase-specifika typer exporteras vidare under egna alias
import type {
    ReviewsResponse,
    ApplicationsResponse,
    ReviewsRecord,
    ChecksRecord,
} from "~/data/pb_types";

// Aliastyper
export type Review = ReviewsRecord;
export type Check = ChecksRecord;
export type Application = ApplicationsResponse;

// Utökade aliastyper
export type ReviewWithApplication = ReviewsResponse & {
    expand?: { application?: ApplicationsResponse };
};
export type RequirementWithCheck = Requirement & { check?: Check };

export type FullReview = {
    id: string;
    created: string;
    updated: string;
    title: string;
    collectionId: string;
    collectionName: string;
    application?: Application;
    requirements: RequirementWithCheck[];
};

export type UpsertCheckInput = {
    reviewId: string;
    requirement: string;
    status?: 'pass' | 'fail' | 'irrelevant';
    comment?: string;
};
