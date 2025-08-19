import mongoose, { Document, Schema } from 'mongoose';

export interface IJob extends Document {
  title: string;
  description: string;
  location: {
    type: string;
    coordinates: number[];
  };
  client: mongoose.Types.ObjectId;
  requirements: string[];
  duration: {
    startDate: Date;
    endDate: Date;
    hoursPerDay: number;
  };
  shiftDetails: {
    startTime: string;
    endTime: string;
    daysOfWeek: string[];
  };
  securityType: 'event' | 'construction' | 'retail' | 'corporate' | 'other';
  numberOfGuards: number;
  rate: {
    amount: number;
    currency: string;
    paymentSchedule: 'hourly' | 'daily' | 'weekly';
  };
  status: 'open' | 'in-progress' | 'completed' | 'cancelled';
  applications: mongoose.Types.ObjectId[];
  selectedGuard?: mongoose.Types.ObjectId;
  rating?: {
    score: number;
    comment: string;
    createdAt: Date;
    updatedAt: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

const jobSchema = new Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      required: true
    }
  },
  client: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  requirements: [{
    type: String,
    required: true
  }],
  duration: {
    startDate: {
      type: Date,
      required: true
    },
    endDate: {
      type: Date,
      required: true
    },
    hoursPerDay: {
      type: Number,
      required: true,
      min: 1,
      max: 24
    }
  },
  shiftDetails: {
    startTime: {
      type: String,
      required: true
    },
    endTime: {
      type: String,
      required: true
    },
    daysOfWeek: [{
      type: String,
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    }]
  },
  securityType: {
    type: String,
    enum: ['event', 'construction', 'retail', 'corporate', 'other'],
    required: true
  },
  numberOfGuards: {
    type: Number,
    required: true,
    min: 1
  },
  rate: {
    amount: {
      type: Number,
      required: true,
      min: 0
    },
    currency: {
      type: String,
      default: 'USD'
    },
    paymentSchedule: {
      type: String,
      enum: ['hourly', 'daily', 'weekly'],
      required: true
    }
  },
  status: {
    type: String,
    enum: ['open', 'in-progress', 'completed', 'cancelled'],
    default: 'open'
  },
  applications: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  selectedGuard: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  rating: {
    score: {
      type: Number,
      min: 0,
      max: 5
    },
    comment: String,
    createdAt: {
      type: Date,
      default: Date.now
    },
    updatedAt: {
      type: Date,
      default: Date.now
    }
  }
}, {
  timestamps: true
});

// Index for geospatial queries
jobSchema.index({ location: '2dsphere' });

const Job = mongoose.model<IJob>('Job', jobSchema);
export { Job }; 