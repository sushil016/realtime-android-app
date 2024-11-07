import express from "express";
import cors from 'cors';
import dotenv from 'dotenv';
import { router as myRoute } from './routes/myRoute';
import locationRoutes from './routes/locationRoutes';

dotenv.config();

const app = express();

// Enable CORS with specific options
app.use(cors({
  origin: '*', // In production, replace with your frontend domain
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Routes
app.use('/api/v2', myRoute);
app.use('/api/v2', locationRoutes);

const PORT = Number(process.env.PORT) || 8080;

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on port ${PORT}`);
});

