#!/usr/bin/env ts-node

import { DatabaseManager } from './DatabaseManager';
import { logger } from '@/utils/logger';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function runMigrations(): Promise<void> {
  try {
    logger.info('Starting database migrations...');
    
    const dbManager = DatabaseManager.getInstance();
    await dbManager.initialize();
    
    logger.info('Database migrations completed successfully');
    await dbManager.close();
    process.exit(0);
  } catch (error) {
    logger.error('Migration failed:', error);
    process.exit(1);
  }
}

// Run migrations if this file is executed directly
if (require.main === module) {
  runMigrations();
}