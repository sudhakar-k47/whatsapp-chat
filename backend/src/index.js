import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import path from 'path';

import authRoutes from './routes/auth.route.js';
import messageRoutes from './routes/message.route.js';
import { connectDB } from './lib/db.js';
import { app, server } from './lib/socket.js';

// Load environment variables
dotenv.config();

const PORT = process.env.PORT || 5001;
const __dirname = path.resolve();

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(cookieParser());

// CORS configuration
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));

// Test route
app.get('/api/test', (req, res) => {
  res.json({ message: 'Test route working' });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/message', messageRoutes);

// Serve frontend in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend/dist')));
  
  // Catch-all for SPA routing
  app.get('/*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
  });
}

// Start server
server.listen(PORT, () => {
  console.log(`✅ Server is running on port ${PORT}`);
  connectDB();
});
