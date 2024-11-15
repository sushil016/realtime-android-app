import express from 'express';
import { checkHealth, checkServiceHealth } from '../controllers/healthController';

const router = express.Router();

router.get('/health', checkHealth);
router.get('/health/:service', checkServiceHealth);

export default router; 