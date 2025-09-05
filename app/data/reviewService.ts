import { Status, type Application, type Check, type Requirement, type Review, type ReviewSummary } from "./types";

import { createClient } from '@supabase/supabase-js'
const supabaseUrl = 'https://siouoxdqpgykibzayejt.supabase.co'
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNpb3VveGRxcGd5a2liemF5ZWp0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY0NzIxODIsImV4cCI6MjA3MjA0ODE4Mn0.sgavqOdB1sjrNpQdvdC4669xTtwPQoRACo53Tn13pZk"// TODO process.env.SUPABASE_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

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

    async getAllRequirementCategories(path: string = "/tillganglighetslistan.json"): Promise<string[]> {
        const res = await fetch(path);
        if (!res.ok) {
            throw new Error(`Failed to load requirement categories from ${path}: ${res.status} ${res.statusText}`);
        }
        const json: { data: Requirement[] } = await res.json();
        if (!Array.isArray(json.data)) {
            throw new Error("Invalid requirement categories data format");
        }
        const categories = Array.from(new Set(json.data.map(req => req.category)));
        return categories;
    },

    async getAllReviews(): Promise<Review[]> {
        const { data, error } = await supabase
            .from('reviews')
            .select('*');
        if (error) throw error;
        return data as Review[];
    },

    async getAllReviewSummaries(): Promise<ReviewSummary[]> {
        const { data: reviews, error: reviewError } = await supabase
            .from('reviews')
            .select('*, application(*)');
        if (reviewError) throw reviewError;

        // Get all checks for all reviews
        const { data: checks, error: checksError } = await supabase
            .from('checks')
            .select('review, status');
        if (checksError) throw checksError;

        // Aggregate counts per review
        return (reviews as ReviewSummary[]).map(review => {
            const reviewChecks = checks.filter((c: any) => c.review === review.id);
            return {
                ...review,
                passCount: reviewChecks.filter((c: any) => c.status === Status.PASS).length,
                failCount: reviewChecks.filter((c: any) => c.status === Status.FAIL).length,
                irrelevantCount: reviewChecks.filter((c: any) => c.status === Status.IRRELEVANT).length,
            };
        });
    },

    async getReviewById(reviewId: string): Promise<ReviewSummary> {
        const { data, error } = await supabase
            .from('reviews')
            .select('*, application(*)')
            .eq('id', reviewId)
            .single();
        if (error) throw error;
        return data as ReviewSummary;
    },

    async getChecksForReview(reviewId: string): Promise<Check[]> {
        const { data, error } = await supabase
            .from('checks')
            .select('*')
            .eq('review', reviewId);
        if (error) throw error;
        return data as Check[];
    },

    async upsertCheck(input: {
        reviewId: string;
        requirement: string;
        status?: Status;
        comment?: string;
    }): Promise<Check> {
        const { reviewId, requirement, status, comment } = input;
        const { data: existing, error: findError } = await supabase
            .from('checks')
            .select('*')
            .eq('review', reviewId)
            .eq('requirement', requirement);
        if (findError) throw findError;
        if (existing && existing.length > 0) {
            const { data, error } = await supabase
                .from('checks')
                .update({ status, comment })
                .eq('id', existing[0].id)
                .select();
            if (error) throw error;
            return data[0] as Check;
        } else {
            const { data, error } = await supabase
                .from('checks')
                .insert({ review: reviewId, requirement, status, comment })
                .select();
            if (error) throw error;
            return data[0] as Check;
        }
    },

    async deleteCheck(checkId: string): Promise<boolean> {
        const { error } = await supabase
            .from('checks')
            .delete()
            .eq('id', checkId);
        if (error) throw error;
        return true;
    },

    async disableChecks(reviewId: number, requirements: string[]): Promise<Check[]> {
        const inserts = requirements.map((requirement) => ({
            review: reviewId,
            requirement,
            status: Status.IRRELEVANT,
            comment: "",
        }));
        const { data, error } = await supabase
            .from('checks')
            .insert(inserts)
            .select();
        if (error) throw error;
        return data as Check[];
    },

    async getApplications(): Promise<Application[]> {
        const { data, error } = await supabase
            .from('applications')
            .select('*');
        if (error) throw error;
        return data as Application[];
    },

    async upsertReview(input: {
        title: string;
        application: string;
        id?: string;
        excludedContentTypes: string[];
    }): Promise<Review> {
        const { title, application, id, excludedContentTypes } = input;
        if (id) {
            const { data, error } = await supabase
                .from('reviews')
                .update({ title, application, excludedContentTypes: excludedContentTypes.join(", ") })
                .eq('id', id)
                .select();
            if (error) throw error;
            return data[0] as Review;
        } else {
            const { data, error } = await supabase
                .from('reviews')
                .insert({ title, application, excludedContentTypes: excludedContentTypes.join(", ") })
                .select();
            if (error) throw error;
            return data[0] as Review;
        }
    },

    async deleteChecksForReview(reviewId: number): Promise<void> {
        await supabase
            .from('checks')
            .delete()
            .eq('review', reviewId);
    },

    async deleteReview(reviewId: number): Promise<void> {
        await supabase
            .from('reviews')
            .delete()
            .eq('id', reviewId);
    },
};
