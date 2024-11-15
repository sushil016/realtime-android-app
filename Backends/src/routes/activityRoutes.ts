import express from 'express';
import { getActivities } from '../controllers/activityController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

router.get('/activities', authenticateToken, getActivities);

export default router; 