import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import dotenv from 'dotenv';
import { createConnection } from 'typeorm';

// Routes
import missionRoutes from './controllers/missions';
import automationRoutes from './controllers/automation';
import receiptRoutes from './controllers/receipts';
import sbtRoutes from './controllers/sbt';
import userRoutes from './controllers/user';

// Middleware
import { errorHandler } from './middleware/errorHandler';
import { telegramAuth } from './middleware/telegramAuth';
import { rateLimiter } from './middleware/rateLimiter';

// Services
import { QueueService } from './services/QueueService';
import { logger } from './utils/logger';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Database connection
async function initializeDatabase() {
  try {
    await createConnection();
    logger.info('Database connection established');
  } catch (error) {
    logger.error('Database connection failed:', error);
    process.exit(1);
  }
}

// Middleware setup
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://telegram.org"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:", "https://*.polygonscan.com"],
      connectSrc: ["'self'", "https://polygon-rpc.com", "https://*.infura.io"],
    },
  },
}));

app.use(cors({
  origin: process.env.CORS_ORIGIN || 'https://web.telegram.org',
  credentials: true,
}));

app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting
app.use(rateLimiter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
});

// API routes
app.use('/api/missions', telegramAuth, missionRoutes);
app.use('/api/automation', telegramAuth, automationRoutes);
app.use('/api/receipts', telegramAuth, receiptRoutes);
app.use('/api/sbt', telegramAuth, sbtRoutes);
app.use('/api/user', telegramAuth, userRoutes);

// Webhook endpoints (no auth required)
app.post('/webhooks/:service', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    const { service } = req.params;
    const payload = JSON.parse(req.body);

    logger.info(`Webhook received from ${service}:`, payload);

    // Queue webhook processing
    await QueueService.getInstance().addWebhookJob(service, payload);

    res.json({ success: true, message: 'Webhook processed' });
  } catch (error) {
    logger.error('Webhook processing error:', error);
    res.status(500).json({ success: false, error: 'Webhook processing failed' });
  }
});

// Error handling middleware (must be last)
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'API endpoint not found',
  });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  process.exit(0);
});

// Start server
async function startServer() {
  try {
    await initializeDatabase();

    // Initialize queue service
    await QueueService.getInstance().initialize();

    app.listen(PORT, () => {
      logger.info(`🚀 Impact Autopilot API server running on port ${PORT}`);
      logger.info(`📱 Telegram WebApp URL: ${process.env.TELEGRAM_WEBAPP_URL}`);
      logger.info(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

export default app;
