import express from 'express';
import { authenticateToken } from '../middleware/auth';
import { 
  checkIn, 
  checkOut, 
  getAttendanceHistory 
} from '../controllers/attendanceController';

const router = express.Router();

router.get('/attendance/history', authenticateToken, getAttendanceHistory);
router.post('/attendance/check-in', authenticateToken, checkIn);
router.post('/attendance/check-out', authenticateToken, checkOut);

export default router; 