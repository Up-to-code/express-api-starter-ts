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

// Get messages by day chart data
router.get('/stats/messages-by-day', async (req: Request, res: Response) => {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Get all messages from the last 7 days
    const messages = await prisma.message.findMany({
      where: {
        createdAt: {
          gte: sevenDaysAgo,
        },
      },
      select: {
        createdAt: true,
      },
    }).catch(() => []);

    // Format data for chart
    const labels = [];
    const data = [];

    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      labels.push(date.toLocaleDateString('en-US', { weekday: 'short' }));

      // Count messages for this day
      const dayCount = messages.filter(message =>
        message.createdAt.toISOString().split('T')[0] === dateStr
      ).length;

      data.push(dayCount);
    }

    res.json({
      labels,
      datasets: [{
        label: 'Messages',
        data,
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.2)',
      }],
    });

  } catch (error) {
    console.error('Error fetching messages by day:', error);
    res.status(500).json({ error: 'Failed to fetch messages by day data' });
  }
});

// Get clients by day chart data
router.get('/stats/clients-by-day', async (req: Request, res: Response) => {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Get all clients from the last 7 days
    const clients = await prisma.client.findMany({
      where: {
        createdAt: {
          gte: sevenDaysAgo,
        },
      },
      select: {
        createdAt: true,
      },
    }).catch(() => []);

    // Format data for chart
    const labels = [];
    const data = [];

    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      labels.push(date.toLocaleDateString('en-US', { weekday: 'short' }));

      // Count clients for this day
      const dayCount = clients.filter(client =>
        client.createdAt.toISOString().split('T')[0] === dateStr
      ).length;

      data.push(dayCount);
    }

    res.json({
      labels,
      datasets: [{
        label: 'New Clients',
        data,
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
      }],
    });

  } catch (error) {
    console.error('Error fetching clients by day:', error);
    res.status(500).json({ error: 'Failed to fetch clients by day data' });
  }
});

// Get messages by type chart data
router.get('/stats/messages-by-type', async (req: Request, res: Response) => {
  try {
    // Get message counts by bot status (since we don't have a type field)
    const messagesByBot = await prisma.message.groupBy({
      by: ['isBot'],
      _count: {
        id: true,
      },
    }).catch(() => []);

    const labels = messagesByBot.map(item => item.isBot ? 'Bot Messages' : 'User Messages');
    const data = messagesByBot.map(item => item._count.id);

    res.json({
      labels,
      datasets: [{
        label: 'Messages by Type',
        data,
        backgroundColor: [
          '#10b981',
          '#3b82f6',
        ],
      }],
    });

  } catch (error) {
    console.error('Error fetching messages by type:', error);
    res.status(500).json({ error: 'Failed to fetch messages by type data' });
  }
});

// Get all analytics data in a single call
router.get('/stats/all', async (req: Request, res: Response) => {
  try {
    // Get basic stats
    const [totalClients, totalMessages, activeCampaigns] = await Promise.all([
      prisma.client.count().catch(() => 0),
      prisma.message.count().catch(() => 0),
      prisma.campaign.count({
        where: { status: 'Active' },
      }).catch(() => 0),
    ]);

    // Get active clients count
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const activeClients = await prisma.client.count({
      where: {
        lastActive: {
          gte: thirtyDaysAgo,
        },
      },
    }).catch(() => 0);

    // Get chart data
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Messages by day
    const messages = await prisma.message.findMany({
      where: { createdAt: { gte: sevenDaysAgo } },
      select: { createdAt: true },
    }).catch(() => []);

    // Clients by day
    const clients = await prisma.client.findMany({
      where: { createdAt: { gte: sevenDaysAgo } },
      select: { createdAt: true },
    }).catch(() => []);

    // Messages by type (using isBot field since type doesn't exist)
    const messagesByType = await prisma.message.groupBy({
      by: ['isBot'],
      _count: { id: true },
    }).catch(() => []);

    // Format chart data
    const formatDayData = (data: any[], color: string, label: string) => {
      const labels = [];
      const chartData = [];

      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        labels.push(date.toLocaleDateString('en-US', { weekday: 'short' }));

        // Count items for this day
        const dayCount = data.filter(item =>
          item.createdAt.toISOString().split('T')[0] === dateStr
        ).length;

        chartData.push(dayCount);
      }

      return {
        labels,
        datasets: [{
          label,
          data: chartData,
          borderColor: color,
          backgroundColor: color.replace(')', ', 0.2)').replace('rgb', 'rgba'),
        }],
      };
    };

    res.json({
      stats: {
        totalClients,
        totalMessages,
        activeClients,
        activeCampaigns,
      },
      messagesByDay: formatDayData(messages, '#10b981', 'Messages'),
      clientsByDay: formatDayData(clients, '#3b82f6', 'New Clients'),
      messagesByType: {
        labels: messagesByType.map(item => item.isBot ? 'Bot Messages' : 'User Messages'),
        datasets: [{
          label: 'Messages by Type',
          data: messagesByType.map(item => item._count.id),
          backgroundColor: ['#10b981', '#3b82f6'],
        }],
      },
    });

  } catch (error) {
    console.error('Error fetching all analytics data:', error);
    res.status(500).json({ error: 'Failed to fetch analytics data' });
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