import express from "express";
import cors from 'cors';
import dotenv from 'dotenv';
import { router as myRoute } from './routes/myRoute';
import locationRoutes from './routes/locationRoutes';
import attendanceRoutes from './routes/attendanceRoutes';
import notificationRoutes from './routes/notificationRoutes';
import profileRoutes from './routes/profileRoutes';
import path from 'path';
import healthRoutes from './routes/healthRoutes';

dotenv.config();

const app = express();

// CORS configuration
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Debug middleware
app.use((req, res, next) => {
  console.log(`📝 ${req.method} ${req.url}`);
  console.log('Headers:', req.headers);
  console.log('Body:', req.body);
  next();
});

// Health check endpoint
app.get('/health', (_, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/v2', healthRoutes);
app.use('/api/v2', myRoute);
app.use('/api/v2', locationRoutes);
app.use('/api/v2', attendanceRoutes);
app.use('/api/v2', notificationRoutes);
app.use('/api/v2', profileRoutes);

// Add static file serving
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Add upload routes
import uploadRoutes from './routes/uploadRoutes';
app.use('/api/v2', uploadRoutes);

const PORT = 8080;

// Listen on all network interfaces
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running at:`);
  console.log(`- Local: http://localhost:${PORT}`);
  console.log(`- Network: http://0.0.0.0:${PORT}`);
});

// Error handling
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
});

process.on('unhandledRejection', (error) => {
  console.error('❌ Unhandled Rejection:', error);
});

