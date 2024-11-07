import express from 'express';
import { authenticateToken } from '../middleware/auth';
import { 
  updateLocation, 
  pinLocation, 
  getLocationStats
} from '../controllers/locationController';

const router = express.Router();

router.post('/location/update', authenticateToken, updateLocation);
router.post('/location/pin', authenticateToken, pinLocation);
router.get('/location/stats', authenticateToken, getLocationStats);

export default router; 