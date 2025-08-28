import PocketBase from "pocketbase";
import type { Check, Requirement, ReviewWithApplication } from "./types";
import type { TypedPocketBase } from "./pb_types";
const pb: TypedPocketBase = new PocketBase("http://localhost:8090") as TypedPocketBase;

export const ReviewService = {
    async getAllRequirements(path: string = "/tillganglighetslistan.json"): Promise<Requirement[]> {
        const res = await fetch(path);
        if (!res.ok) {
            throw new Error(`Failed to load requirements from ${path}: ${res.status} ${res.statusText}`);
        }
        const json: { data: Requirement[] } = await res.json();
        if (!Array.isArray(json.data)) {
            throw new Error("Invalid requirements data format");
        }
        return json.data;
    },

    async getAllReviews(): Promise<ReviewWithApplication[]> {
        return pb.collection("reviews").getFullList<ReviewWithApplication>(200, {
            expand: "application",
        });
    },

    async getReviewById(reviewId: string): Promise<ReviewWithApplication> {
        return pb.collection("reviews").getOne<ReviewWithApplication>(reviewId, {
            expand: "application",
        });
    },

    async getChecksForReview(reviewId: string): Promise<Check[]> {
        return pb.collection("checks").getFullList<Check>(200, {
            filter: `review="${reviewId}"`,
        });
    },

    async upsertCheck(input: {
        reviewId: string;
        requirement: string;
        status?: "pass" | "fail" | "irrelevant";
        comment?: string;
    }): Promise<Check> {
        const { reviewId, requirement, ...rest } = input;
        const existing = await pb.collection("checks").getFullList<Check>(200, {
            filter: `review="${reviewId}" && requirement="${requirement}"`,
        });

        if (existing.length > 0) {
            return pb.collection("checks").update<Check>(existing[0].id, rest);
        }

        return pb.collection("checks").create<Check>({
            review: reviewId,
            requirement,
            ...rest,
        });
    },

    async deleteCheck(checkId: string): Promise<boolean> {
        await pb.collection("checks").delete(checkId);
        return true;
    },

    async disableChecks(reviewId: string, requirements: string[]): Promise<Check[]> {
        return Promise.all(
            requirements.map((requirement) =>
                pb.collection("checks").create<Check>({
                    review: reviewId,
                    requirement,
                    status: "irrelevant",
                    comment: "",
                })
            )
        );
    },
};
