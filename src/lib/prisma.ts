// lib/prisma.ts
import { PrismaClient } from '@prisma/client';
import { setTimeout } from 'timers/promises';

// Create a singleton PrismaClient instance
let prisma: PrismaClient;

// Maximum number of connection attempts
const MAX_RETRIES = 5;
// Initial delay between retries in milliseconds (will increase exponentially)
const INITIAL_RETRY_DELAY = 1000;

/**
 * Connects to the database with retry logic
 */
export async function connectToDatabase(): Promise<PrismaClient> {
  if (prisma) return prisma;
  
  prisma = new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });
  
  // Verify connection
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
      await setTimeout(delay);
    }
  }
  
  if (!connected) {
    console.error('❌ Failed to connect to database after multiple attempts');
    console.error('Please check your DATABASE_URL environment variable and ensure your database is running');
    
    // You might want to exit the process here if database is essential
    // process.exit(1);
  }
  
  return prisma;
}

// Initialize the connection
export { prisma };

// Add shutdown hook for graceful connection closing
process.on('beforeExit', async () => {
  if (prisma) {
    await prisma.$disconnect();
    console.log('Database connection closed');
  }
});