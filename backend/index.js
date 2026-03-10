import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import { initDB } from './db/schema.js';
import { seedDB } from './db/seed.js';
import { testConnection } from './db/pool.js';
import { errorHandler } from './middleware/errorHandler.js';

import authRoutes from './routes/auth.js';
import adminRoutes from './routes/admin.js';
import courseRoutes from './routes/courses.js';
import paymentRoutes from './routes/payments.js';
import taskRoutes from './routes/tasks.js';
import progressRoutes from './routes/progress.js';
import notificationRoutes from './routes/notifications.js';

dotenv.config();

const app = express();
let dbReady = false;

app.use(cors({
  origin: 'https://ncc-upscale-2.onrender.com',
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', db: dbReady });
});

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/notifications', notificationRoutes);

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

async function initWithRetry(maxRetries = 5) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`Connecting to database (attempt ${attempt}/${maxRetries})...`);
      await testConnection();
      await initDB();
      await seedDB();
      dbReady = true;
      console.log('Database ready');
      return;
    } catch (err) {
      console.error(`DB connection attempt ${attempt} failed: ${err.message}`);
      if (attempt < maxRetries) {
        const delay = Math.min(5000 * attempt, 30000);
        console.log(`Retrying in ${delay / 1000}s...`);
        await new Promise(r => setTimeout(r, delay));
      } else {
        console.error('All DB connection attempts failed. Server running without DB — fix your DATABASE_URL in .env or check your Neon dashboard.');
      }
    }
  }
}

app.listen(PORT, () => {
  console.log(`NCC Upscale backend running on port ${PORT}`);
  initWithRetry();
});
