import express from 'express';
import { authenticate } from '../middleware/auth';
import {
  createJob,
  getJobs,
  getJob,
  updateJob,
  deleteJob,
  applyForJob,
  hireGuard,
  completeJob
} from '../controllers/jobController';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Create a job
router.post('/', createJob);

// Get all jobs
router.get('/', getJobs);

// Get a specific job
router.get('/:id', getJob);

// Update a job
router.put('/:id', updateJob);

// Delete a job
router.delete('/:id', deleteJob);

// Apply for a job
router.post('/:id/apply', applyForJob);

// Hire a guard
router.post('/:id/hire/:guardId', hireGuard);

// Complete a job
router.post('/:id/complete', completeJob);

export default router; 