import { Status, type Application, type Check, type PrefillRequirement, type Requirement, type Review, type ReviewSummary, type ReviewWithApplication } from "./types";

import { createClient } from '@supabase/supabase-js'
const supabaseUrl = import.meta.env.VITE_DATABASE_URL;
const supabaseKey = import.meta.env.VITE_DATABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey)

export const ReviewService = {
    async getAllReviewSummaries(): Promise<ReviewSummary[]> {
        const { data: reviews, error: reviewError } = await supabase
            .from('reviews')
            .select('*, application(*)')
            .order('created_at', { ascending: false });
        if (reviewError) throw reviewError;

        // Get all checks for all reviews
        const { data: checks, error: checksError } = await supabase
            .from('checks')
            .select('review, status, updated_at');
        if (checksError) throw checksError;

        return (reviews as ReviewSummary[]).map(review => {
            const reviewChecks = checks.filter((c: any) => c.review === review.id);
            const times = reviewChecks
                .map((c: any) => c.updated_at && !isNaN(new Date(c.updated_at).getTime()) ? new Date(c.updated_at).getTime() : null)
                .filter((t: number | null) => t !== null);
            const latestUpdate = times.length > 0
                ? new Date(Math.max(...times)).toISOString()
                : review.created_at;
            return {
                ...review,
                latestUpdate,
                passCount: reviewChecks.filter((c: any) => c.status === Status.PASS).length,
                failCount: reviewChecks.filter((c: any) => c.status === Status.FAIL).length,
                irrelevantCount: reviewChecks.filter((c: any) => c.status === Status.IRRELEVANT).length,
            };
        });
    },

    async getReviewById(reviewId: string): Promise<ReviewWithApplication> {
        const { data, error } = await supabase
            .from('reviews')
            .select('*, application(*)')
            .eq('id', Number(reviewId))
            .single();
        if (error) throw error;
        return data as ReviewWithApplication;
    },

    async getChecksForReview(reviewId: string): Promise<Check[]> {
        const { data, error } = await supabase
            .from('checks')
            .select('*')
            .eq('review', Number(reviewId));
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
            .eq('review', Number(reviewId))
            .eq('requirement', Number(requirement));
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

    async getCheckById(reviewId: string, requirementId: string): Promise<Check | null> {
        const { data, error } = await supabase
            .from('checks')
            .select('*')
            .eq('review', Number(reviewId))
            .eq('requirement', Number(requirementId));
        if (error) throw error;
        return data.length > 0 ? (data[0] as Check) : null;
    },

    async deleteCheck(checkId: string): Promise<boolean> {
        const { error } = await supabase
            .from('checks')
            .delete()
            .eq('id', Number(checkId));
        if (error) throw error;
        return true;
    },

    async disableChecks(reviewId: number, requirements: string[]): Promise<Check[]> {
        const inserts = requirements.map((requirement) => ({
            review: Number(reviewId),
            requirement: Number(requirement),
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

    async enableChecks(reviewId: number, requirements: string[]): Promise<void> {
        const { error } = await supabase
            .from('checks')
            .delete()
            .eq('review', Number(reviewId))
            .in('requirement', requirements.map(r => Number(r)))
            .eq('status', Status.IRRELEVANT);
        if (error) throw error;
    },

    async prefillChecks(reviewId: number, prefill: PrefillRequirement): Promise<Check[]> {
        const reqIds = prefill.requirements.split(",").map(r => r.trim()).filter(r => r !== "");
        if (reqIds.length === 0) return [];

        const status = prefill.status === "PASS" ? Status.PASS : prefill.status === "FAIL" ? Status.FAIL : prefill.status === "IRRELEVANT" ? Status.IRRELEVANT : Status.NOT_ASSESSED;
        const comment = prefill.comment || "";
        const results: Check[] = [];

        for (const requirement of reqIds) {
            // Check if a check already exists
            const { data: existing, error: findError } = await supabase
                .from('checks')
                .select('*')
                .eq('review', Number(reviewId))
                .eq('requirement', Number(requirement));
            if (findError) throw findError;
            if (existing && existing.length > 0) {
                // Update existing check
                const { data: updated, error: updateError } = await supabase
                    .from('checks')
                    .update({ status, comment })
                    .eq('id', existing[0].id)
                    .select();
                if (updateError) throw updateError;
                if (updated && updated.length > 0) results.push(updated[0] as Check);
            } else {
                // Insert new check
                const { data: inserted, error: insertError } = await supabase
                    .from('checks')
                    .insert({ review: Number(reviewId), requirement: Number(requirement), status, comment })
                    .select();
                if (insertError) throw insertError;
                if (inserted && inserted.length > 0) results.push(inserted[0] as Check);
            }
        }
        return results;
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
        selectedPrefillIds: string;
    }): Promise<Review> {
        const { title, application, id, excludedContentTypes, selectedPrefillIds } = input;
        if (id) {
            const { data, error } = await supabase
                .from('reviews')
                .update({ title, application, excludedContentTypes: excludedContentTypes.join(";"), selectedPrefillIds })
                .eq('id', Number(id))
                .select();
            if (error) throw error;
            return data[0] as Review;
        } else {
            const { data, error } = await supabase
                .from('reviews')
                .insert({ title, application, excludedContentTypes: excludedContentTypes.join(";"), selectedPrefillIds })
                .select();
            if (error) throw error;
            return data[0] as Review;
        }
    },

    async deleteChecksForReview(reviewId: number): Promise<void> {
        await supabase
            .from('checks')
            .delete()
            .eq('review', Number(reviewId));
    },

    async deleteReview(reviewId: number): Promise<void> {
        await supabase
            .from('reviews')
            .delete()
            .eq('id', Number(reviewId));
    },
};
