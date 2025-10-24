import { createClient } from '@supabase/supabase-js';

import {
  type Check,
  type PrefillRequirement,
  type Review,
  type ReviewSummary,
  Status,
} from './types';
const supabaseUrl = import.meta.env.VITE_DATABASE_URL;
const supabaseKey = import.meta.env.VITE_DATABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export const ReviewService = {
  async getAllReviewSummaries(): Promise<ReviewSummary[]> {
    const { data: reviews, error: reviewError } = await supabase
      .from('reviews')
      .select('*')
      .order('created_at', { ascending: false });
    if (reviewError) throw reviewError;

    // Get all checks for all reviews
    const { data: checks, error: checksError } = await supabase
      .from('checks')
      .select('review, status, updated_at');
    if (checksError) throw checksError;

    return (reviews as ReviewSummary[]).map((review) => {
      const reviewChecks = (checks as Check[]).filter((c: Check) => c.review === review.id);
      const times = reviewChecks
        .map((c: Check) =>
          c.updated_at && !isNaN(new Date(c.updated_at).getTime())
            ? new Date(c.updated_at).getTime()
            : null,
        )
        .filter((t: number | null) => t !== null);
      const latestUpdate =
        times.length > 0 ? new Date(Math.max(...times)).toISOString() : review.created_at;
      return {
        ...review,
        latestUpdate,
        passCount: reviewChecks.filter((c: Check) => c.status === Status.PASS).length,
        failCount: reviewChecks.filter((c: Check) => c.status === Status.FAIL).length,
        irrelevantCount: reviewChecks.filter((c: Check) => c.status === Status.IRRELEVANT).length,
      };
    });
  },

  async getReviewById(reviewId: string): Promise<Review> {
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('id', Number(reviewId))
      .single();
    if (error) throw error;
    return data as Review;
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

  async getCheckById(reviewId: string, requirementId: string): Promise<Check | null> {
    const { data, error } = await supabase
      .from('checks')
      .select('*')
      .eq('review', Number(reviewId))
      .eq('requirement', requirementId);
    if (error) throw error;
    return data.length > 0 ? (data[0] as Check) : null;
  },

  async deleteCheck(checkId: string): Promise<boolean> {
    const { error } = await supabase.from('checks').delete().eq('id', Number(checkId));
    if (error) throw error;
    return true;
  },

  async disableChecks(reviewId: number, requirements: string[]): Promise<Check[]> {
    const inserts = requirements.map((requirement) => ({
      review: Number(reviewId),
      requirement: requirement,
      status: Status.IRRELEVANT,
      comment: '',
    }));
    const { data, error } = await supabase.from('checks').insert(inserts).select();
    if (error) throw error;
    return data as Check[];
  },

  async enableChecks(reviewId: number, requirements: string[]): Promise<void> {
    const { error } = await supabase
      .from('checks')
      .delete()
      .eq('review', Number(reviewId))
      .in(
        'requirement',
        requirements.map((r) => r),
      )
      .eq('status', Status.IRRELEVANT);
    if (error) throw error;
  },

  async prefillChecks(reviewId: number, prefills: PrefillRequirement[]): Promise<Check[]> {
    const results: Check[] = [];
    for (const prefillReq of prefills) {
      for (const requirementId of prefillReq.ids) {
        let status: Status;
        switch (prefillReq.status) {
          case 'PASS':
            status = Status.PASS;
            break;
          case 'FAIL':
            status = Status.FAIL;
            break;
          case 'IRRELEVANT':
            status = Status.IRRELEVANT;
            break;
          default:
            status = Status.NOT_ASSESSED;
        }
        const comment = prefillReq.comment || '';

        // Check if a check already exists
        const { data: existing, error: findError } = await supabase
          .from('checks')
          .select('*')
          .eq('review', Number(reviewId))
          .eq('requirement', requirementId);
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
            .insert({ review: Number(reviewId), requirement: requirementId, status, comment })
            .select();
          if (insertError) throw insertError;
          if (inserted && inserted.length > 0) results.push(inserted[0] as Check);
        }
      }
    }
    return results;
  },

  async upsertReview(input: {
    title: string;
    id?: string;
    excludedContentTypes: string[];
    selectedPrefillIds: string;
    objectType: string;
  }): Promise<Review> {
    const { title, id, excludedContentTypes, selectedPrefillIds, objectType } = input;
    if (id) {
      const { data, error } = await supabase
        .from('reviews')
        .update({
          title,
          excludedContentTypes: excludedContentTypes.join(';'),
          selectedPrefillIds,
          objectType,
        })
        .eq('id', Number(id))
        .select();
      if (error) throw error;
      return data[0] as Review;
    } else {
      const { data, error } = await supabase
        .from('reviews')
        .insert({
          title,
          excludedContentTypes: excludedContentTypes.join(';'),
          selectedPrefillIds,
          objectType,
        })
        .select();
      if (error) throw error;
      return data[0] as Review;
    }
  },

  async deleteChecksForReview(reviewId: number): Promise<void> {
    await supabase.from('checks').delete().eq('review', Number(reviewId));
  },

  async deleteReview(reviewId: number): Promise<void> {
    await supabase.from('reviews').delete().eq('id', Number(reviewId));
  },
};
