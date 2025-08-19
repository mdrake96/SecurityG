import { Request, Response } from 'express';
import { Review } from '../models/Review';
import { User } from '../models/User';
import { Job } from '../models/Job';

// Create a review
export const createReview = async (req: Request, res: Response) => {
  try {
    const { jobId, rating, comment } = req.body;
    const reviewerId = (req as any).user._id;

    // Check if job exists and user is authorized to review
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    // Check if user has already reviewed this job
    const existingReview = await Review.findOne({
      job: jobId,
      reviewer: reviewerId
    });

    if (existingReview) {
      return res.status(400).json({ error: 'You have already reviewed this job' });
    }

    // Create review
    const review = new Review({
      job: jobId,
      reviewer: reviewerId,
      reviewed: job.client,
      rating,
      comment
    });

    await review.save();

    // Populate reviewer and reviewee details
    await review.populate('reviewer', 'firstName lastName');
    await review.populate('reviewee', 'firstName lastName');
    await review.populate('job', 'title');

    res.status(201).json(review);
  } catch (error) {
    res.status(400).json({ error: 'Failed to create review' });
  }
};

// Get reviews for a user
export const getUserReviews = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const reviews = await Review.find({ reviewed: userId })
      .populate('reviewer', 'firstName lastName')
      .populate('job', 'title')
      .sort({ createdAt: -1 });

    // Calculate average rating
    const averageRating = reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length;

    res.json({
      reviews,
      averageRating: isNaN(averageRating) ? 0 : averageRating,
      totalReviews: reviews.length
    });
  } catch (error) {
    res.status(400).json({ error: 'Failed to fetch reviews' });
  }
};

// Get reviews for a job
export const getJobReviews = async (req: Request, res: Response) => {
  try {
    const { jobId } = req.params;

    const reviews = await Review.find({ job: jobId })
      .populate('reviewer', 'firstName lastName')
      .sort({ createdAt: -1 });

    // Calculate average rating
    const averageRating = reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length;

    res.json({
      reviews,
      averageRating: isNaN(averageRating) ? 0 : averageRating,
      totalReviews: reviews.length
    });
  } catch (error) {
    res.status(400).json({ error: 'Failed to fetch reviews' });
  }
};

// Update a review
export const updateReview = async (req: Request, res: Response) => {
  try {
    const { reviewId } = req.params;
    const { rating, comment } = req.body;
    const userId = (req as any).user._id;

    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }

    // Check if user is the reviewer
    if (review.reviewer.toString() !== userId.toString()) {
      return res.status(403).json({ error: 'Not authorized to update this review' });
    }

    review.rating = rating;
    review.comment = comment;
    await review.save();

    await review.populate('reviewer', 'firstName lastName');
    await review.populate('reviewee', 'firstName lastName');
    await review.populate('job', 'title');

    res.json(review);
  } catch (error) {
    res.status(400).json({ error: 'Failed to update review' });
  }
};

// Delete a review
export const deleteReview = async (req: Request, res: Response) => {
  try {
    const { reviewId } = req.params;
    const userId = (req as any).user._id;

    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }

    // Check if user is the reviewer
    if (review.reviewer.toString() !== userId.toString()) {
      return res.status(403).json({ error: 'Not authorized to delete this review' });
    }

    await review.deleteOne();
    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    res.status(400).json({ error: 'Failed to delete review' });
  }
}; 