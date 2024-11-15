import express from 'express';
import { login, signup } from '../controllers/auth';

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.get('/test', (req, res) => {
  res.json({ 
    message: 'API is working!',
    timestamp: new Date().toISOString()
  });
});

export { router };