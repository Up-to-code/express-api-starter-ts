// routes/home.ts
import express from 'express';
import { Request, Response } from 'express';
import { prisma, connectToDatabase } from '../lib/prisma';

const router = express.Router();

// Middleware to handle database connection
const withDatabaseConnection = async (req: Request, res: Response, next: Function) => {
  try {
    await connectToDatabase();
    next();
  } catch (error) {
    console.error('Database connection error:', error);
    res.status(503).json({ 
      error: 'Database connection error', 
      message: 'Unable to connect to the database. Please try again later.', 
    });
  }
};

// Apply the middleware to all routes
router.use(withDatabaseConnection);

// Get dashboard statistics
router.get('/stats', async (req: Request, res: Response) => {
  try {
    // Wrap queries in a try-catch to handle potential database errors
    const [totalClients, totalMessages, activeCampaigns] = await Promise.all([
      prisma.client.count().catch(() => 0),
      prisma.message.count().catch(() => 0),
      prisma.campaign.count({
        where: { status: 'Active' },
      }).catch(() => 0),
    ]);
    
    // Get count of active clients (active in the last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const activeClients = await prisma.client.count({
      where: {
        lastActive: {
          gte: thirtyDaysAgo,
        },
      },
    }).catch(() => 0);
    
    // Return all stats
    res.json({
      totalClients,
      totalMessages,
      activeClients,
      activeCampaigns,
    });
    
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard statistics' });
  }
});

// Get recent activity (last 5 messages and last 5 clients)
router.get('/recent-activity', async (req: Request, res: Response) => {
  try {
    // Use Promise.allSettled to handle potential partial failures
    const [messagesResult, clientsResult] = await Promise.allSettled([
      // Get last 5 messages with client information
      prisma.message.findMany({
        take: 5,
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          client: true,
        },
      }),
      
      // Get last 5 clients
      prisma.client.findMany({
        take: 5,
        orderBy: {
          createdAt: 'desc',
        },
      }),
    ]);
    
    const recentMessages = messagesResult.status === 'fulfilled' ? messagesResult.value : [];
    const recentClients = clientsResult.status === 'fulfilled' ? clientsResult.value : [];
    
    res.json({
      recentMessages,
      recentClients,
      // Add a status flag to indicate if data is complete
      dataStatus: messagesResult.status === 'fulfilled' && clientsResult.status === 'fulfilled' 
        ? 'complete' 
        : 'partial',
    });
    
  } catch (error) {
    console.error('Error fetching recent activity:', error);
    res.status(500).json({ error: 'Failed to fetch recent activity' });
  }
});

// Get campaign performance data
router.get('/campaign-performance', async (req: Request, res: Response) => {
  try {
    const campaigns = await prisma.campaign.findMany({
      where: {
        status: {
          in: ['Active', 'Completed'],
        },
      },
      select: {
        id: true,
        name: true,
        status: true,
        sentCount: true,
        lastSentAt: true,
        _count: {
          select: {
            clients: true,
          },
        },
      },
      orderBy: {
        lastSentAt: 'desc',
      },
      take: 10,
    }).catch(() => []);
    
    res.json(campaigns);
    
  } catch (error) {
    console.error('Error fetching campaign performance:', error);
    res.status(500).json({ error: 'Failed to fetch campaign performance' });
  }
});

// Main dashboard route
router.get('/', async (req: Request, res: Response) => {
  try {
    // Get basic counts for dashboard overview
    const statsPromises = [
      prisma.client.count().catch(() => 0),
      prisma.message.count().catch(() => 0),
      prisma.campaign.count({
        where: { status: 'Active' },
      }).catch(() => 0),
    ];
    
    // Use Promise.all with error handling
    const [totalClients, totalMessages, activeCampaigns] = await Promise.all(statsPromises);
    
    res.json({
      totalClients,
      totalMessages,
      activeCampaigns,
      timestamp: new Date().toISOString(),
    });
    
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    
    // Return partial data or fallback data if available
    res.status(500).json({ 
      error: 'Failed to fetch complete dashboard data',
      timestamp: new Date().toISOString(),
    });
  }
});

export default router;