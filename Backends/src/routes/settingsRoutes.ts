import express from 'express';
import { authenticateToken } from '../middleware/auth';
import { updateSettings, getSettings } from '../controllers/settingsController';

const router = express.Router();

router.get('/settings', authenticateToken, getSettings);
router.put('/settings', authenticateToken, updateSettings);

export default router; 