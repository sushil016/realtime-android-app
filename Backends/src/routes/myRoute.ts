import express from 'express';
import { auth, logins } from '../controllers/auth';

export const router = express.Router();

router.post('/login', logins);
router.post('/signup', auth);

router.get('/blog', (req: express.Request, res: express.Response) => {
    res.send({ msg: 'Blog Page' });
});