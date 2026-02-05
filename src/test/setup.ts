import { DatabaseManager } from '@/database/DatabaseManager';

// Setup test database before all tests
beforeAll(async () => {
  process.env.NODE_ENV = 'test';
  process.env.DATABASE_PATH = ':memory:'; // Use in-memory database for tests
  
  const dbManager = DatabaseManager.getInstance();
  await dbManager.initialize();
});

// Cleanup after all tests
afterAll(async () => {
  const dbManager = DatabaseManager.getInstance();
  await dbManager.close();
});