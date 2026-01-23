import { Request, Response } from 'express';
import { Review, Check } from '../models';
import { Op } from 'sequelize';

// Status enum matching frontend
enum Status {
  FAIL = 0,
  PASS = 1,
  IRRELEVANT = 2,
  NOT_ASSESSED = 3,
}

// Helper function to calculate review summary statistics
const calculateReviewSummary = async (reviewId: number) => {
  const checks = await Check.findAll({
    where: { review: reviewId },
  });

  const reviewedCount = checks.filter((c) => c.status !== Status.NOT_ASSESSED).length;
  const passCount = checks.filter((c) => c.status === Status.PASS).length;
  const failCount = checks.filter((c) => c.status === Status.FAIL).length;
  const irrelevantCount = checks.filter((c) => c.status === Status.IRRELEVANT).length;

  // Calculate latest update timestamp
  const times = checks
    .map((c) => (c.updated_at ? new Date(c.updated_at).getTime() : null))
    .filter((t) => t !== null);
  
  const review = await Review.findByPk(reviewId);
  const latestUpdate = times.length > 0 
    ? new Date(Math.max(...times)).toISOString() 
    : review?.created_at?.toISOString() || new Date().toISOString();

  return {
    latestUpdate,
    reviewedCount,
    passCount,
    failCount,
    irrelevantCount,
  };
};

// GET /api/reviews - Get all reviews with summaries
export const getAllReviews = async (req: Request, res: Response) => {
  try {
    const reviews = await Review.findAll({
      order: [['created_at', 'DESC']],
    });

    const summaries = await Promise.all(
      reviews.map(async (review) => {
        const stats = await calculateReviewSummary(review.id);
        return {
          ...review.toJSON(),
          ...stats,
        };
      })
    );

    res.json(summaries);
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
};

// GET /api/reviews/:id - Get single review by ID
export const getReviewById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const review = await Review.findByPk(parseInt(id, 10));

    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }

    res.json(review);
  } catch (error) {
    console.error('Error fetching review:', error);
    res.status(500).json({ error: 'Failed to fetch review' });
  }
};

// GET /api/reviews/:id/checks - Get all checks for a review
export const getChecksForReview = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const checks = await Check.findAll({
      where: { review: parseInt(id, 10) },
      order: [['requirement', 'ASC']],
    });

    res.json(checks);
  } catch (error) {
    console.error('Error fetching checks:', error);
    res.status(500).json({ error: 'Failed to fetch checks' });
  }
};

// POST /api/reviews - Create new review
export const createReview = async (req: Request, res: Response) => {
  try {
    const { title, excludedContentTypes, selectedPrefillIds, objectType, regulatoryFramework } = req.body;

    const review = await Review.create({
      title,
      excludedContentTypes: Array.isArray(excludedContentTypes) 
        ? excludedContentTypes.join(';') 
        : excludedContentTypes,
      selectedPrefillIds,
      objectType,
      regulatoryFramework,
    });

    res.status(201).json(review);
  } catch (error) {
    console.error('Error creating review:', error);
    res.status(500).json({ error: 'Failed to create review' });
  }
};

// PUT /api/reviews/:id - Update review
export const updateReview = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, excludedContentTypes, selectedPrefillIds, objectType, regulatoryFramework } = req.body;

    const review = await Review.findByPk(parseInt(id, 10));
    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }

    await review.update({
      title,
      excludedContentTypes: Array.isArray(excludedContentTypes) 
        ? excludedContentTypes.join(';') 
        : excludedContentTypes,
      selectedPrefillIds,
      objectType,
      regulatoryFramework,
    });

    res.json(review);
  } catch (error) {
    console.error('Error updating review:', error);
    res.status(500).json({ error: 'Failed to update review' });
  }
};

// DELETE /api/reviews/:id - Delete review (cascade deletes checks)
export const deleteReview = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const review = await Review.findByPk(parseInt(id, 10));

    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }

    await review.destroy();
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting review:', error);
    res.status(500).json({ error: 'Failed to delete review' });
  }
};

// POST /api/reviews/:reviewId/checks - Upsert check
export const upsertCheck = async (req: Request, res: Response) => {
  try {
    const { reviewId } = req.params;
    const { requirement, status, comment, flag } = req.body;

    // Check if check already exists
    const existingCheck = await Check.findOne({
      where: {
        review: parseInt(reviewId, 10),
        requirement,
      },
    });

    let check;
    if (existingCheck) {
      // Update existing check
      await existingCheck.update({
        status,
        comment,
        flag: flag !== undefined ? flag : existingCheck.flag,
        updated_at: new Date(),
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

    res.json(check);
  } catch (error) {
    console.error('Error upserting check:', error);
    res.status(500).json({ error: 'Failed to upsert check' });
  }
};

// GET /api/reviews/:reviewId/checks/:requirementId - Get specific check
export const getCheckByRequirement = async (req: Request, res: Response) => {
  try {
    const { reviewId, requirementId } = req.params;

    const check = await Check.findOne({
      where: {
        review: parseInt(reviewId, 10),
        requirement: requirementId,
      },
    });

    if (!check) {
      return res.status(404).json(null);
    }

    res.json(check);
  } catch (error) {
    console.error('Error fetching check:', error);
    res.status(500).json({ error: 'Failed to fetch check' });
  }
};

// DELETE /api/checks/:id - Delete specific check
export const deleteCheck = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const check = await Check.findByPk(parseInt(id, 10));

    if (!check) {
      return res.status(404).json({ error: 'Check not found' });
    }

    await check.destroy();
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting check:', error);
    res.status(500).json({ error: 'Failed to delete check' });
  }
};

// POST /api/reviews/:reviewId/checks/bulk-disable - Disable multiple checks
export const disableChecks = async (req: Request, res: Response) => {
  try {
    const { reviewId } = req.params;
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
        }).then(([check, created]) => {
          if (!created) {
            return check.update({ status: Status.IRRELEVANT });
          }
          return check;
        })
      )
    );

    res.json(checks);
  } catch (error) {
    console.error('Error disabling checks:', error);
    res.status(500).json({ error: 'Failed to disable checks' });
  }
};

// POST /api/reviews/:reviewId/checks/bulk-enable - Enable (delete irrelevant) checks
export const enableChecks = async (req: Request, res: Response) => {
  try {
    const { reviewId } = req.params;
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
    });

    res.status(204).send();
  } catch (error) {
    console.error('Error enabling checks:', error);
    res.status(500).json({ error: 'Failed to enable checks' });
  }
};

// POST /api/reviews/:reviewId/checks/bulk-delete - Delete multiple checks
export const deleteChecks = async (req: Request, res: Response) => {
  try {
    const { reviewId } = req.params;
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
    });

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting checks:', error);
    res.status(500).json({ error: 'Failed to delete checks' });
  }
};

// POST /api/reviews/:reviewId/checks/bulk-prefill - Bulk prefill checks
export const prefillChecks = async (req: Request, res: Response) => {
  try {
    const { reviewId } = req.params;
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

    // Upsert all checks
    const checks = await Promise.all(
      checksToUpsert.map((checkData) =>
        Check.findOne({
          where: {
            review: checkData.review,
            requirement: checkData.requirement,
          },
        }).then((existingCheck) => {
          if (existingCheck) {
            return existingCheck.update({
              status: checkData.status,
              comment: checkData.comment,
              updated_at: new Date(),
            });
          } else {
            return Check.create(checkData);
          }
        })
      )
    );

    res.json(checks);
  } catch (error) {
    console.error('Error prefilling checks:', error);
    res.status(500).json({ error: 'Failed to prefill checks' });
  }
};

// POST /api/reviews/:reviewId/checks/:requirementId/toggle-flag - Toggle check flag
export const toggleCheckFlag = async (req: Request, res: Response) => {
  try {
    const { reviewId, requirementId } = req.params;
    const { flag } = req.body;

    const [check, created] = await Check.findOrCreate({
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

    if (!created) {
      await check.update({
        flag: flag ? 1 : 0,
        updated_at: new Date(),
      });
    }

    res.json(check);
  } catch (error) {
    console.error('Error toggling check flag:', error);
    res.status(500).json({ error: 'Failed to toggle check flag' });
  }
};
