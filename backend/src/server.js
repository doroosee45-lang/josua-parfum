import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import cors from 'cors';
import { connectDatabase, isMongoConnected } from './config/db.js';
import { initializeSeedData } from './repositories/storeRepository.js';
import { UPLOADS_DIR } from './middleware/uploadMiddleware.js';

import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import settingRoutes from './routes/settingRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 5000;

// CORS & JSON Body Parsers (supports base64 fallback as well as multipart/form-data)
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Serve uploaded perfume photos publicly across all devices
app.use('/uploads', express.static(UPLOADS_DIR));

// Health Check Endpoint
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    boutique: 'JOSHUA PARFUM',
    databaseEngine: isMongoConnected() ? 'mongodb' : 'persistent-json',
    timestamp: new Date().toISOString(),
  });
});

// Mount REST API Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/settings', settingRoutes);
app.use('/api/upload', uploadRoutes);

// Optional Production Static Serving of Compiled Frontend (frontend/dist)
const frontendDist = path.resolve(__dirname, '../../../frontend/dist');
if (process.env.NODE_ENV === 'production' && fs.existsSync(frontendDist)) {
  app.use(express.static(frontendDist));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) return next();
    res.sendFile(path.join(frontendDist, 'index.html'));
  });
}

// Centralized French Error Handler
app.use((err, _req, res, _next) => {
  console.error('❌ [API Error]:', err.message);
  res.status(err.status || 500).json({
    message: err.message || 'Une erreur interne est survenue sur le serveur.',
  });
});

async function bootstrap() {
  await connectDatabase();
  await initializeSeedData();

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 [JOSHUA PARFUM Backend] Serveur API opérationnel sur http://0.0.0.0:${PORT}`);
  });
}

bootstrap();
