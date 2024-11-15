import express from 'express';
import activityRoutes from './routes/activityRoutes';
import cors from 'cors';
import { authenticateToken } from './middleware/auth';

// Initialize express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Auth middleware for all /api routes
app.use('/api', authenticateToken);
app.use('/api', activityRoutes);

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Export the app
export default app; 