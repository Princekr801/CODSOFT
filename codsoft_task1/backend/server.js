import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectDB } from './config/dbStore.js';

// Load routes
import authRouter from './routes/auth.js';
import jobsRouter from './routes/jobs.js';
import appsRouter from './routes/applications.js';
import notifyRouter from './routes/notifications.js';

// Init environment variables
dotenv.config();

const app = express();

// Initialize Database connection (handles Mongo & JSON fallbacks)
connectDB();

// Global Middlewares
app.use(cors({
  origin: '*', // Allow all origins for local testing convenience
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Register API Routes
app.use('/api/auth', authRouter);
app.use('/api/jobs', jobsRouter);
app.use('/api/applications', appsRouter);
app.use('/api/notifications', notifyRouter);

// Root health check endpoint (API)
app.get('/api', (req, res) => {
  res.json({ 
    status: 'online', 
    message: 'TalentHub Job Board API is operational! 🚀',
    developer: 'Suraj Kumar Prince'
  });
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve frontend static files
app.use(express.static(path.join(__dirname, '../frontend/dist')));

// Handle React routing, return all unknown requests to React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`📡 Server running on port ${PORT}...`);
  console.log(`🔗 API endpoint ready at: http://localhost:${PORT}`);
});
