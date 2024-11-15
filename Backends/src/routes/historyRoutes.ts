import express from 'express';
import { authenticateToken } from '../middleware/auth';
import { 
  getLocationHistory, 
  getAttendanceHistory,
  getActivitySummary 
} from '../controllers/historyController';

const router = express.Router();

router.get('/history/location', authenticateToken, getLocationHistory);
router.get('/history/attendance', authenticateToken, getAttendanceHistory);
router.get('/history/summary', authenticateToken, getActivitySummary);

export default router; 