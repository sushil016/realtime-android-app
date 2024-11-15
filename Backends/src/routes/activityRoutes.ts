import express from 'express';
import { getActivities } from '../controllers/activityController';


const router = express.Router();

router.get('/activities', getActivities);

export default router; 