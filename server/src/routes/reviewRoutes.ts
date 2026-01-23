import { Router } from 'express';
import * as reviewController from '../controllers/reviewController';
import { validate, reviewSchemas, checkSchemas, validateIdParam } from '../middleware/validation';

const router = Router();

// Review routes
router.get('/', reviewController.getAllReviews);
router.get('/:id', validateIdParam, reviewController.getReviewById);
router.post('/', validate(reviewSchemas.create), reviewController.createReview);
router.put('/:id', validateIdParam, validate(reviewSchemas.update), reviewController.updateReview);
router.delete('/:id', validateIdParam, reviewController.deleteReview);

// Check routes for specific review
router.get('/:id/checks', validateIdParam, reviewController.getChecksForReview);
router.post('/:reviewId/checks', validateIdParam, validate(checkSchemas.upsert), reviewController.upsertCheck);
router.get('/:reviewId/checks/:requirementId', validateIdParam, reviewController.getCheckByRequirement);

// Bulk operations
router.post('/:reviewId/checks/bulk-disable', validateIdParam, validate(checkSchemas.bulkRequirements), reviewController.disableChecks);
router.post('/:reviewId/checks/bulk-enable', validateIdParam, validate(checkSchemas.bulkRequirements), reviewController.enableChecks);
router.post('/:reviewId/checks/bulk-delete', validateIdParam, validate(checkSchemas.bulkRequirements), reviewController.deleteChecks);
router.post('/:reviewId/checks/bulk-prefill', validateIdParam, validate(checkSchemas.bulkPrefill), reviewController.prefillChecks);

// Toggle flag
router.post('/:reviewId/checks/:requirementId/toggle-flag', validateIdParam, validate(checkSchemas.toggleFlag), reviewController.toggleCheckFlag);

// Individual check operations
router.delete('/checks/:id', validateIdParam, reviewController.deleteCheck);

export default router;
