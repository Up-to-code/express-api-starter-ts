/**
 * WhatsApp Analytics API Routes for إتجاه العقارية (Etjahh Real Estate)
 * مسارات تحليلات واتساب لشركة إتجاه العقارية
 * 
 * Provides comprehensive analytics for WhatsApp message delivery,
 * read receipts, engagement rates, and performance metrics.
 */

import express from 'express';
import { EnhancedWhatsAppService } from '../services/EnhancedWhatsAppService';
import { prisma } from '../lib/prisma';
import { logWithTimestamp } from '../utils/logger';

const router = express.Router();

/**
 * GET /api/v1/whatsapp/analytics/overview
 * Get comprehensive WhatsApp analytics overview
 * الحصول على نظرة عامة شاملة لتحليلات واتساب
 */
router.get('/overview', async (req, res) => {
  try {
    const timeframe = (req.query.timeframe as string) || 'week';
    
    if (!['day', 'week', 'month'].includes(timeframe)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid timeframe. Use: day, week, or month'
      });
    }

    const analytics = await EnhancedWhatsAppService.getDeliveryAnalytics(
      timeframe as 'day' | 'week' | 'month'
    );

    logWithTimestamp(
      `📊 Analytics requested for ${timeframe}: ${analytics.totalSent} messages`,
      'info'
    );

    res.json({
      success: true,
      timeframe,
      analytics: {
        ...analytics,
        summary: {
          totalMessages: analytics.totalSent,
          successRate: analytics.deliveryRate,
          engagementRate: analytics.readRate,
          avgResponseTime: analytics.avgReadTime
        }
      }
    });

  } catch (error: any) {
    logWithTimestamp(
      `Failed to get WhatsApp analytics: ${error.message}`,
      'error'
    );

    res.status(500).json({
      success: false,
      error: 'Failed to retrieve analytics'
    });
  }
});

/**
 * GET /api/v1/whatsapp/analytics/messages/:messageId
 * Get detailed analytics for a specific message
 * الحصول على تحليلات مفصلة لرسالة محددة
 */
router.get('/messages/:messageId', async (req, res) => {
  try {
    const { messageId } = req.params;

    const messageStatus = await EnhancedWhatsAppService.getMessageStatus(messageId);

    if (!messageStatus) {
      return res.status(404).json({
        success: false,
        error: 'Message not found'
      });
    }

    res.json({
      success: true,
      message: messageStatus
    });

  } catch (error: any) {
    logWithTimestamp(
      `Failed to get message status: ${error.message}`,
      'error'
    );

    res.status(500).json({
      success: false,
      error: 'Failed to retrieve message status'
    });
  }
});

/**
 * GET /api/v1/whatsapp/analytics/clients
 * Get client engagement analytics
 * الحصول على تحليلات تفاعل العملاء
 */
router.get('/clients', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = parseInt(req.query.offset as string) || 0;

    // Get client engagement data
    const clients = await prisma.client.findMany({
      take: limit,
      skip: offset,
      orderBy: { lastActive: 'desc' },
      include: {
        _count: {
          select: {
            messages: {
              where: {
                isBot: true,
                whatsappMessageId: { not: null }
              }
            }
          }
        },
        messages: {
          where: {
            isBot: true,
            whatsappMessageId: { not: null }
          },
          select: {
            status: true,
            readAt: true,
            deliveredAt: true,
            sentAt: true
          },
          orderBy: { sentAt: 'desc' },
          take: 10
        }
      }
    });

    const clientAnalytics = clients.map(client => {
      const messages = client.messages;
      const totalMessages = messages.length;
      const deliveredMessages = messages.filter(m => 
        m.status === 'delivered' || m.status === 'read'
      ).length;
      const readMessages = messages.filter(m => m.status === 'read').length;

      const deliveryRate = totalMessages > 0 ? (deliveredMessages / totalMessages) * 100 : 0;
      const readRate = deliveredMessages > 0 ? (readMessages / deliveredMessages) * 100 : 0;

      // Calculate average response time
      const readTimes = messages
        .filter(m => m.readAt && m.sentAt)
        .map(m => (m.readAt!.getTime() - m.sentAt!.getTime()) / 1000);
      
      const avgReadTime = readTimes.length > 0
        ? readTimes.reduce((sum, time) => sum + time, 0) / readTimes.length
        : 0;

      return {
        clientId: client.id,
        phone: client.phone,
        name: client.name,
        lastActive: client.lastActive,
        totalMessages: client._count.messages,
        recentMessages: totalMessages,
        deliveryRate: Math.round(deliveryRate * 100) / 100,
        readRate: Math.round(readRate * 100) / 100,
        avgReadTime: Math.round(avgReadTime * 100) / 100,
        engagement: readRate > 70 ? 'high' : readRate > 40 ? 'medium' : 'low'
      };
    });

    res.json({
      success: true,
      clients: clientAnalytics,
      pagination: {
        limit,
        offset,
        total: await prisma.client.count()
      }
    });

  } catch (error: any) {
    logWithTimestamp(
      `Failed to get client analytics: ${error.message}`,
      'error'
    );

    res.status(500).json({
      success: false,
      error: 'Failed to retrieve client analytics'
    });
  }
});

/**
 * GET /api/v1/whatsapp/analytics/performance
 * Get performance metrics and trends
 * الحصول على مقاييس الأداء والاتجاهات
 */
router.get('/performance', async (req, res) => {
  try {
    const days = parseInt(req.query.days as string) || 7;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get daily performance data
    const dailyStats = await prisma.$queryRaw`
      SELECT 
        DATE(sent_at) as date,
        COUNT(*) as total_sent,
        COUNT(CASE WHEN status IN ('delivered', 'read') THEN 1 END) as delivered,
        COUNT(CASE WHEN status = 'read' THEN 1 END) as read,
        COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed,
        AVG(CASE 
          WHEN delivered_at IS NOT NULL AND sent_at IS NOT NULL 
          THEN EXTRACT(EPOCH FROM (delivered_at - sent_at))
        END) as avg_delivery_time,
        AVG(CASE 
          WHEN read_at IS NOT NULL AND delivered_at IS NOT NULL 
          THEN EXTRACT(EPOCH FROM (read_at - delivered_at))
        END) as avg_read_time
      FROM "Message"
      WHERE is_bot = true 
        AND whatsapp_message_id IS NOT NULL
        AND sent_at >= $1
      GROUP BY DATE(sent_at)
      ORDER BY date DESC
    ` as any[];

    // Get hourly distribution
    const hourlyStats = await prisma.$queryRaw`
      SELECT 
        EXTRACT(HOUR FROM sent_at) as hour,
        COUNT(*) as message_count,
        COUNT(CASE WHEN status = 'read' THEN 1 END) as read_count
      FROM "Message"
      WHERE is_bot = true 
        AND whatsapp_message_id IS NOT NULL
        AND sent_at >= $1
      GROUP BY EXTRACT(HOUR FROM sent_at)
      ORDER BY hour
    ` as any[];

    res.json({
      success: true,
      performance: {
        dailyStats: dailyStats.map(stat => ({
          date: stat.date,
          totalSent: parseInt(stat.total_sent),
          delivered: parseInt(stat.delivered),
          read: parseInt(stat.read),
          failed: parseInt(stat.failed),
          deliveryRate: stat.total_sent > 0 
            ? Math.round((stat.delivered / stat.total_sent) * 10000) / 100 
            : 0,
          readRate: stat.delivered > 0 
            ? Math.round((stat.read / stat.delivered) * 10000) / 100 
            : 0,
          avgDeliveryTime: stat.avg_delivery_time ? Math.round(stat.avg_delivery_time * 100) / 100 : 0,
          avgReadTime: stat.avg_read_time ? Math.round(stat.avg_read_time * 100) / 100 : 0
        })),
        hourlyDistribution: hourlyStats.map(stat => ({
          hour: parseInt(stat.hour),
          messageCount: parseInt(stat.message_count),
          readCount: parseInt(stat.read_count),
          readRate: stat.message_count > 0 
            ? Math.round((stat.read_count / stat.message_count) * 10000) / 100 
            : 0
        }))
      }
    });

  } catch (error: any) {
    logWithTimestamp(
      `Failed to get performance metrics: ${error.message}`,
      'error'
    );

    res.status(500).json({
      success: false,
      error: 'Failed to retrieve performance metrics'
    });
  }
});

/**
 * POST /api/v1/whatsapp/analytics/test-message
 * Send a test message with tracking
 * إرسال رسالة اختبار مع التتبع
 */
router.post('/test-message', async (req, res) => {
  try {
    const { to, message, priority = 'normal' } = req.body;

    if (!to || !message) {
      return res.status(400).json({
        success: false,
        error: 'Phone number and message are required'
      });
    }

    const result = await EnhancedWhatsAppService.sendMessage({
      to,
      text: message,
      trackReadReceipts: true,
      isAutomated: false,
      responseSource: 'Analytics Test',
      priority: priority as 'high' | 'normal' | 'low'
    });

    res.json({
      success: result.success,
      messageId: result.messageId,
      error: result.error
    });

  } catch (error: any) {
    logWithTimestamp(
      `Failed to send test message: ${error.message}`,
      'error'
    );

    res.status(500).json({
      success: false,
      error: 'Failed to send test message'
    });
  }
});

export default router;
