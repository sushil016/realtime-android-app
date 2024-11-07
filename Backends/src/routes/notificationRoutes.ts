import express from 'express';
import { authenticateToken } from '../middleware/auth';
import { 
  getNotifications,
  markAsRead 
} from '../controllers/notificationController';

const router = express.Router();

router.get('/notifications', authenticateToken, getNotifications);
router.post('/notifications/:id/read', authenticateToken, markAsRead);

export default router; 