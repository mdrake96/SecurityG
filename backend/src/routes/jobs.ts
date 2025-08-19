import express from 'express';
import { authenticate, checkRole } from '../middleware/auth';
import {
  createJob,
  getJobs,
  getJob,
  updateJob,
  deleteJob,
  applyForJob,
  getJobApplications,
  completeJob,
  hireGuard,
  rateJob
} from '../controllers/jobController';

const router = express.Router();

// Public routes
router.get('/', getJobs);
router.get('/:id', getJob);

// Protected routes
router.post('/', authenticate, checkRole(['client']), createJob);
router.put('/:id', authenticate, checkRole(['client']), updateJob);
router.delete('/:id', authenticate, checkRole(['client']), deleteJob);
router.post('/:id/apply', authenticate, checkRole(['guard']), applyForJob);
router.get('/:id/applications', authenticate, checkRole(['client']), getJobApplications);
router.post('/:id/complete', authenticate, checkRole(['client']), completeJob);
router.post('/:id/hire/:guardId', authenticate, checkRole(['client']), hireGuard);
router.post('/:id/hire', authenticate, checkRole(['client']), hireGuard);
router.post('/:id/rate', authenticate, checkRole(['client']), rateJob);

export default router; 