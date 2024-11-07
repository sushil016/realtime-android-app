import express from "express";
import cors from 'cors';
import dotenv from 'dotenv';
import { router as myRoute } from './routes/myRoute';
import locationRoutes from './routes/locationRoutes';
import attendanceRoutes from './routes/attendanceRoutes';
import notificationRoutes from './routes/notificationRoutes';
import settingsRoutes from './routes/settingsRoutes';
import { initializeSettings } from './controllers/settingsController';

dotenv.config();

const app = express();

// Enable CORS with specific options
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Add body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize settings
initializeSettings().catch(console.error);

// Routes
app.use('/api/v2', myRoute);
app.use('/api/v2', locationRoutes);
app.use('/api/v2', attendanceRoutes);
app.use('/api/v2', notificationRoutes);
app.use('/api/v2', settingsRoutes);

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error'
  });
});

const PORT = Number(process.env.PORT) || 8080;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on http://0.0.0.0:${PORT}`);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

process.on('unhandledRejection', (error) => {
  console.error('Unhandled Rejection:', error);
});

