import mongoose, { Document, Schema } from 'mongoose';

export interface IReview extends Document {
  reviewer: mongoose.Types.ObjectId;
  reviewed: mongoose.Types.ObjectId;
  job: mongoose.Types.ObjectId;
  rating: number;
  comment: string;
  createdAt: Date;
  updatedAt: Date;
}

const reviewSchema = new Schema<IReview>({
  reviewer: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  reviewed: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  job: {
    type: Schema.Types.ObjectId,
    ref: 'Job',
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    required: true,
    trim: true
  }
}, {
  timestamps: true
});

// Ensure one review per job per reviewer
reviewSchema.index({ reviewer: 1, job: 1 }, { unique: true });

export const Review = mongoose.model<IReview>('Review', reviewSchema); 