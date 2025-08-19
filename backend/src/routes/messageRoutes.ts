import express from 'express';
import { authenticate } from '../middleware/auth';
import {
  sendMessage,
  getConversation,
  getConversations,
  markAsRead
} from '../controllers/messageController';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Send a message
router.post('/', sendMessage);

// Get conversation with a specific user
router.get('/conversation/:userId', getConversation);

// Get all conversations
router.get('/conversations', getConversations);

// Mark messages as read
router.put('/read/:userId', markAsRead);

export default router; 