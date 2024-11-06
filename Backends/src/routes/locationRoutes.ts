import express from 'express';
import { 
  pinLocation,
  updateLocationHistory,
  getLocationHistory 
} from '../controllers/locationController';

const router = express.Router();

router.post('/location/pin', pinLocation);
router.post('/location/history', updateLocationHistory);
router.get('/location/history/:userId', getLocationHistory);

export default router; 