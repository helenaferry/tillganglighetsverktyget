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
    const { data: reviews, error: reviewError } = await supabase.from('reviews').select('*');
    if (reviewError) throw reviewError;

    const summaries = await Promise.all(
      (reviews as ReviewSummary[]).map(async (review) => {
        const reviewChecks = await supabase
          .from('checks')
          .select('*')
          .eq('review', review.id)
          .then(({ data, error }) => {
            if (error) throw error;
            return data as Check[];
          });
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
          reviewedCount: reviewChecks.filter((c: Check) => c.status !== Status.NOT_ASSESSED).length,
          passCount: reviewChecks.filter((c: Check) => c.status === Status.PASS).length,
          failCount: reviewChecks.filter((c: Check) => c.status === Status.FAIL).length,
          irrelevantCount: reviewChecks.filter((c: Check) => c.status === Status.IRRELEVANT).length,
        };
      }),
    );
    return summaries;
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

  async deleteChecks(reviewId: number, requirementIds: string[]): Promise<boolean> {
    const { error } = await supabase
      .from('checks')
      .delete()
      .eq('review', Number(reviewId))
      .in(
        'requirement',
        requirementIds.map((r) => r),
      );
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
    console.log('Enabling checks for reviewId:', reviewId, 'requirements:', requirements);
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
    // 1. Gather all requirement IDs and their intended status/comment
    const toPrefill: Array<{ requirement: string; status: Status; comment: string }> = [];
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
        toPrefill.push({ requirement: requirementId, status, comment: prefillReq.comment || '' });
      }
    }

    // 2. Fetch all existing checks for this review in one go
    const { data: existingChecks, error: fetchError } = await supabase
      .from('checks')
      .select('id, requirement')
      .eq('review', Number(reviewId));
    if (fetchError) throw fetchError;
    const existingMap = new Map<string, number>(); // requirementId -> checkId
    for (const check of existingChecks ?? []) {
      existingMap.set(check.requirement, check.id);
    }

    // 3. Split into updates and inserts
    const updates: Array<{ id: number; status: Status; comment: string }> = [];
    const inserts: Array<{ review: number; requirement: string; status: Status; comment: string }> =
      [];
    for (const item of toPrefill) {
      const checkId = existingMap.get(item.requirement);
      if (checkId) {
        updates.push({ id: checkId, status: item.status, comment: item.comment });
      } else {
        inserts.push({
          review: Number(reviewId),
          requirement: item.requirement,
          status: item.status,
          comment: item.comment,
        });
      }
    }

    // 4. Bulk insert new checks
    let inserted: Check[] = [];
    if (inserts.length > 0) {
      const { data, error } = await supabase.from('checks').insert(inserts).select();
      if (error) throw error;
      inserted = data as Check[];
    }

    // 5. Parallelize updates (Supabase doesn't support bulk update, so update one by one)
    const updated: Check[] = [];
    if (updates.length > 0) {
      const updatePromises = updates.map((u) =>
        supabase
          .from('checks')
          .update({ status: u.status, comment: u.comment })
          .eq('id', u.id)
          .select(),
      );
      const updateResults = await Promise.all(updatePromises);
      for (const res of updateResults) {
        if (res.error) throw res.error;
        if (res.data && res.data.length > 0) updated.push(res.data[0] as Check);
      }
    }

    // 6. Return all affected checks
    return [...inserted, ...updated];
  },

  async upsertReview(input: {
    title: string;
    id?: string;
    excludedContentTypes: string[];
    selectedPrefillIds: string;
    objectType: string;
    regulatoryFramework: string;
  }): Promise<Review> {
    const { title, id, excludedContentTypes, selectedPrefillIds, objectType, regulatoryFramework } =
      input;
    if (id) {
      const { data, error } = await supabase
        .from('reviews')
        .update({
          title,
          excludedContentTypes: excludedContentTypes.join(';'),
          selectedPrefillIds,
          objectType,
          regulatoryFramework,
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
          regulatoryFramework,
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
