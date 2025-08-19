import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { IJob, Job } from '../models/Job';
import { User } from '../models/User';

// Create a job
export const createJob = async (req: Request, res: Response) => {
  try {
    const job = new Job({
      ...req.body,
      client: (req as any).user._id,
      applications: []
    });

    await job.save();
    res.status(201).json(job);
  } catch (error) {
    res.status(400).json({ error: 'Failed to create job' });
  }
};

// Get all jobs
export const getJobs = async (req: Request, res: Response) => {
  try {
    const { status, client, selectedGuard } = req.query;
    const query: any = {};

    if (status) query.status = status;
    if (client) query.client = client;
    if (selectedGuard) query.selectedGuard = selectedGuard;

    const jobs = await Job.find(query)
      .populate('client', 'firstName lastName')
      .populate('applications', 'firstName lastName')
      .populate('selectedGuard', 'firstName lastName')
      .sort({ createdAt: -1 });

    res.json(jobs);
  } catch (error) {
    res.status(400).json({ error: 'Failed to fetch jobs' });
  }
};

// Get a specific job
export const getJob = async (req: Request, res: Response) => {
  try {
    const jobId: string = req.params.id;
    const job = await Job.findById(jobId)
      .populate('client', 'firstName lastName email')
      .populate('applications', 'firstName lastName')
      .populate('selectedGuard', 'firstName lastName');

    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    res.json(job);
  } catch (error) {
    res.status(400).json({ error: 'Failed to fetch job' });
  }
};

// Update a job
export const updateJob = async (req: Request, res: Response) => {
  try {
    const jobId: string = req.params.id;
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    // Check if user is the client
    if (job.client.toString() !== (req as any).user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized to update this job' });
    }

    const updates = req.body;
    const allowedUpdates = ['title', 'description', 'location', 'duration', 'rate', 'requirements', 'shiftDetails', 'securityType', 'numberOfGuards'];
    const isValidOperation = Object.keys(updates).every(update => allowedUpdates.includes(update));

    if (!isValidOperation) {
      return res.status(400).json({ error: 'Invalid updates' });
    }

    Object.assign(job, updates);
    await job.save();

    res.json(job);
  } catch (error) {
    res.status(400).json({ error: 'Failed to update job' });
  }
};

// Delete a job
export const deleteJob = async (req: Request, res: Response) => {
  try {
    const jobId: string = req.params.id;
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    // Check if user is the client
    if (job.client.toString() !== (req as any).user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized to delete this job' });
    }

    await job.deleteOne();
    res.json({ message: 'Job deleted successfully' });
  } catch (error) {
    res.status(400).json({ error: 'Failed to delete job' });
  }
};

// Hire a guard for a job
export const hireGuard = async (req: Request, res: Response) => {
  try {
    const jobId: string = req.params.id;
    const guardId: string = req.params.guardId || req.body.guardId;

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    // Only the client who created the job can hire
    if (job.client.toString() !== (req as any).user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized to hire for this job' });
    }

    // Ensure guard applied for job
    const guardObjectId = new mongoose.Types.ObjectId(guardId);
    if (!job.applications.some(id => id.equals(guardObjectId))) {
      return res.status(400).json({ error: 'Guard did not apply for this job' });
    }

    job.selectedGuard = guardObjectId;
    job.status = 'in-progress';
    await job.save();

    const populatedJob = await Job.findById(job._id)
      .populate('client', 'firstName lastName')
      .populate('selectedGuard', 'firstName lastName');

    res.json(populatedJob);
  } catch (error) {
    res.status(400).json({ error: 'Failed to hire guard' });
  }
};

// Rate a completed job
export const rateJob = async (req: Request, res: Response) => {
  try {
    const jobId: string = req.params.id;
    const { rating, comment } = req.body as { rating: number; comment?: string };

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    // Only the client who created the job can rate it
    if (job.client.toString() !== (req as any).user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized to rate this job' });
    }

    if (job.status !== 'completed') {
      return res.status(400).json({ error: 'Can only rate completed jobs' });
    }

    job.rating = {
      score: rating,
      comment: comment || '',
      createdAt: new Date(),
      updatedAt: new Date()
    } as any;

    await job.save();

    res.json(job);
  } catch (error) {
    res.status(400).json({ error: 'Failed to rate job' });
  }
};
// Apply for a job
export const applyForJob = async (req: Request, res: Response) => {
  try {
    const jobId: string = req.params.id;
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    // Check if user is a guard
    const user = await User.findById((req as any).user._id);
    if (user?.role !== 'guard') {
      return res.status(403).json({ error: 'Only guards can apply for jobs' });
    }

    // Check if job is open
    if (job.status !== 'open') {
      return res.status(400).json({ error: 'Job is not open for applications' });
    }

    // Add guard to applications if not already applied
    const userId = new mongoose.Types.ObjectId((req as any).user._id);
    if (!job.applications.some(id => id.equals(userId))) {
      job.applications.push(userId);
      await job.save();
    }

    res.json({ message: 'Application submitted successfully' });
  } catch (error) {
    res.status(400).json({ error: 'Failed to apply for job' });
  }
};

// Get job applications
export const getJobApplications = async (req: Request, res: Response) => {
  try {
    const jobId: string = req.params.id;
    const job = await Job.findById(jobId)
      .populate('applications', 'firstName lastName email phoneNumber rating');

    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    // Check if user is the client
    if (job.client.toString() !== (req as any).user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized to view applications' });
    }

    res.json(job.applications);
  } catch (error) {
    res.status(400).json({ error: 'Failed to fetch applications' });
  }
};

// Complete a job
export const completeJob = async (req: Request, res: Response) => {
  try {
    const jobId: string = req.params.id;
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    // Check if user is the client
    if (job.client.toString() !== (req as any).user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized to complete this job' });
    }

    // Check if job is in progress
    if (job.status !== 'in-progress') {
      return res.status(400).json({ error: 'Job must be in progress before completion' });
    }

    job.status = 'completed';
    await job.save();

    res.json(job);
  } catch (error) {
    res.status(400).json({ error: 'Failed to complete job' });
  }
}; 