import express from 'express';
import { authenticateToken } from '../middleware/auth';
import { upload, uploadAvatar } from '../controllers/uploadController';

const router = express.Router();

router.post('/profile/avatar', 
  authenticateToken, 
  upload.single('avatar'), 
  uploadAvatar
);

export default router; 