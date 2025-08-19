import express from 'express';
import { authenticate } from '../middleware/auth';
import {
  createReview,
  getUserReviews,
  getJobReviews,
  updateReview,
  deleteReview
} from '../controllers/reviewController';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Create a review
router.post('/', createReview);

// Get reviews for a user
router.get('/user/:userId', getUserReviews);

// Get reviews for a job
router.get('/job/:jobId', getJobReviews);

// Update a review
router.put('/:reviewId', updateReview);

// Delete a review
router.delete('/:reviewId', deleteReview);

export default router; 