import express from 'express';
import { authenticate } from '../middleware/auth';
import {
  register,
  login,
  getProfile,
  updateProfile,
  deleteProfile
} from '../controllers/userController';

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes
router.use(authenticate);
router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.delete('/profile', deleteProfile);

export default router; 