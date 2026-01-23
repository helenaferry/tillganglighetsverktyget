import { Router } from 'express';
import * as reviewController from '../controllers/reviewController';

const router = Router();

// Review routes
router.get('/', reviewController.getAllReviews);
router.get('/:id', reviewController.getReviewById);
router.post('/', reviewController.createReview);
router.put('/:id', reviewController.updateReview);
router.delete('/:id', reviewController.deleteReview);

// Check routes for specific review
router.get('/:id/checks', reviewController.getChecksForReview);
router.post('/:reviewId/checks', reviewController.upsertCheck);
router.get('/:reviewId/checks/:requirementId', reviewController.getCheckByRequirement);

// Bulk operations
router.post('/:reviewId/checks/bulk-disable', reviewController.disableChecks);
router.post('/:reviewId/checks/bulk-enable', reviewController.enableChecks);
router.post('/:reviewId/checks/bulk-delete', reviewController.deleteChecks);
router.post('/:reviewId/checks/bulk-prefill', reviewController.prefillChecks);

// Toggle flag
router.post('/:reviewId/checks/:requirementId/toggle-flag', reviewController.toggleCheckFlag);

// Individual check operations
router.delete('/checks/:id', reviewController.deleteCheck);

export default router;
