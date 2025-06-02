// lib/prisma.ts
import { PrismaClient } from '@prisma/client';

// Global variable to store the Prisma client instance
declare global {
  var __prisma: PrismaClient | undefined;
}

// Create a singleton PrismaClient instance
const prisma = globalThis.__prisma || new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

// In development, store the instance globally to prevent multiple instances
if (process.env.NODE_ENV === 'development') {
  globalThis.__prisma = prisma;
}

// Maximum number of connection attempts
const MAX_RETRIES = 5;
// Initial delay between retries in milliseconds
const INITIAL_RETRY_DELAY = 1000;

/**
 * Connects to the database with retry logic
 */
export async function connectToDatabase(): Promise<PrismaClient> {
  let retries = 0;
  let connected = false;

  while (!connected && retries < MAX_RETRIES) {
    try {
      // Test connection with a simple query
      await prisma.$queryRaw`SELECT 1`;
      connected = true;
      console.log('✅ Database connection established');
    } catch (error) {
      retries++;
      const delay = INITIAL_RETRY_DELAY * Math.pow(2, retries - 1);

      console.error(`⚠️ Database connection failed (attempt ${retries}/${MAX_RETRIES})`);
      console.error(`Retrying in ${delay}ms...`);

      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  if (!connected) {
    console.error('❌ Failed to connect to database after multiple attempts');
    console.error('Please check your DATABASE_URL environment variable and ensure your database is running');
    throw new Error('Database connection failed');
  }

  return prisma;
}

// Export the prisma instance
export { prisma };

// Add shutdown hooks for graceful connection closing
const gracefulShutdown = async () => {
  console.log('Shutting down gracefully...');
  try {
    await prisma.$disconnect();
    console.log('Database connection closed');
  } catch (error) {
    console.error('Error closing database connection:', error);
  }
  process.exit(0);
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);
process.on('beforeExit', async () => {
  try {
    await prisma.$disconnect();
    console.log('Database connection closed');
  } catch (error) {
    console.error('Error closing database connection:', error);
  }
});