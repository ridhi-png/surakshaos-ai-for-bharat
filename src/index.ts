import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import dotenv from 'dotenv';
import { logger } from '@/utils/logger';
import { DatabaseManager } from '@/database/DatabaseManager';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Initialize database and start server
async function startServer(): Promise<void> {
  try {
    // Initialize database
    const dbManager = DatabaseManager.getInstance();
    await dbManager.initialize();
    
    logger.info('Database initialized successfully');
    
    // Start server
    app.listen(PORT, () => {
      logger.info(`SurakshaOS server running on port ${PORT}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully');
  const dbManager = DatabaseManager.getInstance();
  await dbManager.close();
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, shutting down gracefully');
  const dbManager = DatabaseManager.getInstance();
  await dbManager.close();
  process.exit(0);
});

startServer();