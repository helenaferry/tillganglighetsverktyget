import { Request, Response } from 'express';
import { Review, Check } from '../models';
import { Op, fn, col, literal, UniqueConstraintError } from 'sequelize';
import { sequelizeInstance } from '../database/database';
import logger, {
  logReviewCreated,
  logReviewDeleted,
  logReviewUpdated,
  logCheckUpdated,
} from '../logger';
import { Status } from '../types/status';

/** Normalize Express param (string | string[]) to string for parseInt/usage. */
function paramString(value: string | string[] | undefined): string {
  return Array.isArray(value) ? (value[0] ?? '') : (value ?? '');
}

// GET /api/reviews - Get all reviews with summaries
// Optimized to avoid N+1 query problem by using aggregations
export const getAllReviews = async (req: Request, res: Response) => {
  try {
    // Short-circuit when no reviews: use simple query to avoid GROUP BY on empty table (Oracle/Sequelize)
    const hasAny = await Review.findOne({ attributes: ['id'], raw: true });
    if (!hasAny) return res.json([]);

    const reviews = await Review.findAll({
      include: [
        {
          model: Check,
          as: 'checks',
          attributes: [], // Don't fetch check details, only use for aggregation
          required: false, // LEFT JOIN to include reviews without checks
        },
      ],
      attributes: [
        'id',
        'created_at',
        'title',
        'excludedContentTypes',
        'objectType',
        'regulatoryFramework',
        'selectedPrefillIds',
        // Use COALESCE to handle reviews with no checks
        [
          fn(
            'COALESCE',
            fn('MAX', col('checks.updated_at')),
            col('Review.created_at'),
          ),
          'latestUpdate',
        ],
        [
          fn(
            'COALESCE',
            fn(
              'SUM',
              literal(
                'CASE WHEN "checks"."status" IS NOT NULL AND "checks"."status" != 3 THEN 1 ELSE 0 END',
              ),
            ),
            0,
          ),
          'reviewedCount',
        ],
        [
          fn(
            'COALESCE',
            fn(
              'SUM',
              literal('CASE WHEN "checks"."status" = 1 THEN 1 ELSE 0 END'),
            ),
            0,
          ),
          'passCount',
        ],
        [
          fn(
            'COALESCE',
            fn(
              'SUM',
              literal('CASE WHEN "checks"."status" = 0 THEN 1 ELSE 0 END'),
            ),
            0,
          ),
          'failCount',
        ],
        [
          fn(
            'COALESCE',
            fn(
              'SUM',
              literal('CASE WHEN "checks"."status" = 2 THEN 1 ELSE 0 END'),
            ),
            0,
          ),
          'irrelevantCount',
        ],
      ],
      group: [
        'Review.id',
        'Review.created_at',
        'Review.title',
        col('Review.excluded_content_types'),
        col('Review.object_type'),
        col('Review.regulatory_framework'),
        col('Review.selected_prefill_ids'),
      ],
      order: [['created_at', 'DESC']],
      raw: true,
    });

    res.json(reviews);
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    logger.error('Error fetching reviews', {
      error: err.message,
      stack: err.stack,
    });
    const isDev = process.env.NODE_ENV === 'development';
    res.status(500).json({
      error: 'Failed to fetch reviews',
      ...(isDev && { detail: err.message }),
    });
  }
};

// GET /api/reviews/:id - Get single review by ID
export const getReviewById = async (req: Request, res: Response) => {
  try {
    const id = paramString(req.params.id);
    const review = await Review.findByPk(parseInt(id, 10));

    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }

    res.json(review);
  } catch (error) {
    logger.error('Error fetching review', { error });
    res.status(500).json({ error: 'Failed to fetch review' });
  }
};

// GET /api/reviews/:id/checks - Get all checks for a review
export const getChecksForReview = async (req: Request, res: Response) => {
  try {
    const id = paramString(req.params.id);
    const checks = await Check.findAll({
      where: { review: parseInt(id, 10) },
      order: [['requirement', 'ASC']],
    });

    res.json(checks);
  } catch (error) {
    logger.error('Error fetching checks', { error });
    res.status(500).json({ error: 'Failed to fetch checks' });
  }
};

// POST /api/reviews - Create new review
export const createReview = async (req: Request, res: Response) => {
  try {
    const {
      title,
      excludedContentTypes,
      selectedPrefillIds,
      objectType,
      regulatoryFramework,
    } = req.body;

    const review = await Review.create({
      title,
      excludedContentTypes: Array.isArray(excludedContentTypes)
        ? excludedContentTypes.join(';')
        : excludedContentTypes,
      selectedPrefillIds,
      objectType,
      regulatoryFramework,
    });

    // Oracle RETURNING clause doesn't populate ID in Sequelize
    // Fetch the created review to get the generated ID
    if (!review.id) {
      const createdReview = await Review.findOne({
        where: {
          title,
          created_at: review.created_at,
        },
      });

      if (!createdReview) {
        throw new Error('Failed to fetch created review after insert');
      }

      const context = req.context || {
        clientIp: req.ip || 'unknown',
        requestId: 'unknown',
      };

      logReviewCreated(createdReview, context);

      return res.status(201).json(createdReview);
    }

    const context = req.context || {
      clientIp: req.ip || 'unknown',
      requestId: 'unknown',
    };

    logReviewCreated(review, context);

    res.status(201).json(review);
  } catch (error) {
    logger.error('Error creating review', { error });
    res.status(500).json({ error: 'Failed to create review' });
  }
};

// PUT /api/reviews/:id - Update review
export const updateReview = async (req: Request, res: Response) => {
  try {
    const id = paramString(req.params.id);
    const {
      title,
      excludedContentTypes,
      selectedPrefillIds,
      objectType,
      regulatoryFramework,
    } = req.body;

    const review = await Review.findByPk(parseInt(id, 10));
    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }

    // Store old values to detect changes
    const oldTitle = review.title;
    const oldExcludedContentTypes = review.excludedContentTypes;
    const oldSelectedPrefillIds = review.selectedPrefillIds;
    const oldObjectType = review.objectType;
    const oldRegulatoryFramework = review.regulatoryFramework;

    const newExcludedContentTypes = Array.isArray(excludedContentTypes)
      ? excludedContentTypes.join(';')
      : excludedContentTypes;

    await review.update({
      title,
      excludedContentTypes: newExcludedContentTypes,
      selectedPrefillIds,
      objectType,
      regulatoryFramework,
    });

    // Detect changes
    const changes: {
      title?: { old: string | null; new: string | null };
      excludedContentTypes?: { old: string | null; new: string | null };
      selectedPrefillIds?: { old: string | null; new: string | null };
      objectType?: { old: string | null; new: string | null };
      regulatoryFramework?: { old: string | null; new: string | null };
    } = {};

    if (oldTitle !== title) {
      changes.title = { old: oldTitle, new: title };
    }
    if (oldExcludedContentTypes !== newExcludedContentTypes) {
      changes.excludedContentTypes = {
        old: oldExcludedContentTypes,
        new: newExcludedContentTypes,
      };
    }
    if (oldSelectedPrefillIds !== selectedPrefillIds) {
      changes.selectedPrefillIds = {
        old: oldSelectedPrefillIds,
        new: selectedPrefillIds,
      };
    }
    if (oldObjectType !== objectType) {
      changes.objectType = { old: oldObjectType, new: objectType };
    }
    if (oldRegulatoryFramework !== regulatoryFramework) {
      changes.regulatoryFramework = {
        old: oldRegulatoryFramework,
        new: regulatoryFramework,
      };
    }

    const context = req.context || {
      clientIp: req.ip || 'unknown',
      requestId: 'unknown',
    };

    // Reload review to get updated values
    await review.reload();

    logReviewUpdated(review, changes, context);

    res.json(review);
  } catch (error) {
    logger.error('Error updating review', { error });
    res.status(500).json({ error: 'Failed to update review' });
  }
};

// DELETE /api/reviews/:id - Delete review (cascade deletes checks)
export const deleteReview = async (req: Request, res: Response) => {
  try {
    const id = paramString(req.params.id);
    const review = await Review.findByPk(parseInt(id, 10));

    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }

    await review.destroy();

    const context = req.context || {
      clientIp: req.ip || 'unknown',
      requestId: 'unknown',
    };

    logReviewDeleted(review, context);

    res.status(204).send();
  } catch (error) {
    logger.error('Error deleting review', { error });
    res.status(500).json({ error: 'Failed to delete review' });
  }
};

// POST /api/reviews/:reviewId/checks - Upsert check
export const upsertCheck = async (req: Request, res: Response) => {
  try {
    const reviewId = paramString(req.params.reviewId);
    const { requirement, status, comment, flag } = req.body;

    // Check if check already exists
    const existingCheck = await Check.findOne({
      where: {
        review: parseInt(reviewId, 10),
        requirement,
      },
    });

    let check;
    const isNew = !existingCheck;
    
    if (existingCheck) {
      // Update existing check (updated_at handled by database trigger)
      await existingCheck.update({
        status,
        comment,
        flag: flag !== undefined ? flag : existingCheck.flag,
      });
      check = existingCheck;
    } else {
      // Create new check
      check = await Check.create({
        review: parseInt(reviewId, 10),
        requirement,
        status,
        comment,
        flag: flag || 0,
      });
    }

    const context = req.context || {
      clientIp: req.ip || 'unknown',
      requestId: 'unknown',
    };

    logCheckUpdated(
      {
        review: check.review,
        requirement: check.requirement,
        status: check.status,
        comment: check.comment || '',
        flag: check.flag || 0,
      },
      isNew,
      context,
    );

    res.json(check.toJSON());
  } catch (error) {
    logger.error('Error upserting check', { error });
    res.status(500).json({ error: 'Failed to upsert check' });
  }
};

// GET /api/reviews/:reviewId/checks/:requirementId - Get specific check
export const getCheckByRequirement = async (req: Request, res: Response) => {
  try {
    const reviewId = paramString(req.params.reviewId);
    const requirementId = paramString(req.params.requirementId);

    const check = await Check.findOne({
      where: {
        review: parseInt(reviewId, 10),
        requirement: requirementId,
      },
    });

    // Return null instead of 404 - not having a check yet is a normal state
    res.json(check);
  } catch (error) {
    logger.error('Error fetching check', { error });
    res.status(500).json({ error: 'Failed to fetch check' });
  }
};

// DELETE /api/checks/:id - Delete specific check
export const deleteCheck = async (req: Request, res: Response) => {
  try {
    const id = paramString(req.params.id);
    const check = await Check.findByPk(parseInt(id, 10));

    if (!check) {
      return res.status(404).json({ error: 'Check not found' });
    }

    await check.destroy();
    res.status(204).send();
  } catch (error) {
    logger.error('Error deleting check', { error });
    res.status(500).json({ error: 'Failed to delete check' });
  }
};

// POST /api/reviews/:reviewId/checks/bulk-disable - Disable multiple checks
export const disableChecks = async (req: Request, res: Response) => {
  const t = await sequelizeInstance.transaction();
  try {
    const reviewId = paramString(req.params.reviewId);
    const { requirements } = req.body; // Array of requirement IDs

    if (!Array.isArray(requirements)) {
      return res.status(400).json({ error: 'requirements must be an array' });
    }

    const checks = await Promise.all(
      requirements.map((requirement) =>
        Check.findOrCreate({
          where: {
            review: parseInt(reviewId, 10),
            requirement,
          },
          defaults: {
            review: parseInt(reviewId, 10),
            requirement,
            status: Status.IRRELEVANT,
            comment: '',
            flag: 0,
          },
          transaction: t,
        }).then(([check, created]) => {
          if (!created) {
            return check.update(
              { status: Status.IRRELEVANT },
              { transaction: t },
            );
          }
          return check;
        }),
      ),
    );

    await t.commit();
    res.json(checks);
  } catch (error) {
    await t.rollback();
    logger.error('Error disabling checks', { error });
    res.status(500).json({ error: 'Failed to disable checks' });
  }
};

// POST /api/reviews/:reviewId/checks/bulk-enable - Enable (delete irrelevant) checks
export const enableChecks = async (req: Request, res: Response) => {
  const t = await sequelizeInstance.transaction();
  try {
    const reviewId = paramString(req.params.reviewId);
    const { requirements } = req.body; // Array of requirement IDs

    if (!Array.isArray(requirements)) {
      return res.status(400).json({ error: 'requirements must be an array' });
    }

    await Check.destroy({
      where: {
        review: parseInt(reviewId, 10),
        requirement: {
          [Op.in]: requirements,
        },
        status: Status.IRRELEVANT,
      },
      transaction: t,
    });

    await t.commit();
    res.status(204).send();
  } catch (error) {
    await t.rollback();
    logger.error('Error enabling checks', { error });
    res.status(500).json({ error: 'Failed to enable checks' });
  }
};

// POST /api/reviews/:reviewId/checks/bulk-delete - Delete multiple checks
export const deleteChecks = async (req: Request, res: Response) => {
  const t = await sequelizeInstance.transaction();
  try {
    const reviewId = paramString(req.params.reviewId);
    const { requirements } = req.body; // Array of requirement IDs

    if (!Array.isArray(requirements)) {
      return res.status(400).json({ error: 'requirements must be an array' });
    }

    await Check.destroy({
      where: {
        review: parseInt(reviewId, 10),
        requirement: {
          [Op.in]: requirements,
        },
      },
      transaction: t,
    });

    await t.commit();
    res.status(204).send();
  } catch (error) {
    await t.rollback();
    logger.error('Error deleting checks', { error });
    res.status(500).json({ error: 'Failed to delete checks' });
  }
};

// POST /api/reviews/:reviewId/checks/bulk-prefill - Bulk prefill checks
export const prefillChecks = async (req: Request, res: Response) => {
  const t = await sequelizeInstance.transaction();
  try {
    const reviewId = paramString(req.params.reviewId);
    const { prefills } = req.body; // Array of { status, ids, comment }

    if (!Array.isArray(prefills)) {
      return res.status(400).json({ error: 'prefills must be an array' });
    }

    const checksToUpsert: any[] = [];
    for (const prefill of prefills) {
      let statusValue: number;
      switch (prefill.status) {
        case 'PASS':
          statusValue = Status.PASS;
          break;
        case 'FAIL':
          statusValue = Status.FAIL;
          break;
        case 'IRRELEVANT':
          statusValue = Status.IRRELEVANT;
          break;
        default:
          statusValue = Status.NOT_ASSESSED;
      }

      for (const requirementId of prefill.ids) {
        checksToUpsert.push({
          review: parseInt(reviewId, 10),
          requirement: requirementId,
          status: statusValue,
          comment: prefill.comment || '',
          flag: 0,
        });
      }
    }

    // Upsert all checks within transaction
    const checks = await Promise.all(
      checksToUpsert.map((checkData) =>
        Check.findOne({
          where: {
            review: checkData.review,
            requirement: checkData.requirement,
          },
          transaction: t,
        }).then((existingCheck) => {
          if (existingCheck) {
            return existingCheck.update(
              {
                status: checkData.status,
                comment: checkData.comment,
              },
              { transaction: t },
            );
          } else {
            return Check.create(checkData, { transaction: t });
          }
        }),
      ),
    );

    await t.commit();
    res.json(checks);
  } catch (error) {
    await t.rollback();
    logger.error('Error prefilling checks', { error });
    res.status(500).json({ error: 'Failed to prefill checks' });
  }
};

// POST /api/reviews/:reviewId/checks/:requirementId/toggle-flag - Toggle check flag
export const toggleCheckFlag = async (req: Request, res: Response) => {
  try {
    const reviewId = paramString(req.params.reviewId);
    const requirementId = paramString(req.params.requirementId);
    const { flag } = req.body;

    let check;
    let created = false;

    try {
      [check, created] = await Check.findOrCreate({
        where: {
          review: parseInt(reviewId, 10),
          requirement: requirementId,
        },
        defaults: {
          review: parseInt(reviewId, 10),
          requirement: requirementId,
          status: Status.NOT_ASSESSED,
          flag: flag ? 1 : 0,
        },
      });
    } catch (error) {
      // Hantera Sequelize's findOrCreate race condition
      if (error instanceof UniqueConstraintError) {
        check = await Check.findOne({
          where: {
            review: parseInt(reviewId, 10),
            requirement: requirementId,
          },
        });
        if (!check) {
          throw new Error('Check should exist but was not found');
        }
        created = false;
      } else {
        throw error;
      }
    }

    if (!created) {
      // Update flag (updated_at handled by database trigger)
      await check.update({
        flag: flag ? 1 : 0,
      });
    }

    const context = req.context || {
      clientIp: req.ip || 'unknown',
      requestId: 'unknown',
    };

    logCheckUpdated(
      {
        review: check.review,
        requirement: check.requirement,
        status: check.status,
        comment: check.comment || '',
        flag: check.flag || 0,
      },
      created,
      context,
    );

    res.json(check.toJSON());
  } catch (error) {
    logger.error('Error toggling check flag', { error });
    res.status(500).json({ error: 'Failed to toggle check flag' });
  }
};
