import express, { Request, Response } from 'express';
import { MessageTrackingService } from '../../services/messageTrackingService';
import { logWithTimestamp } from '../../utils/logger';

const router = express.Router();

/**
 * GET /api/v1/message-tracking/delivery-report/:clientId
 * Get delivery report for a specific client
 */
router.get('/delivery-report/:clientId', async (req: Request, res: Response) => {
  try {
    const { clientId } = req.params;

    if (!clientId) {
      return res.status(400).json({
        success: false,
        error: 'Client ID is required'
      });
    }

    const report = await MessageTrackingService.getClientDeliveryReport(clientId);

    return res.status(200).json({
      success: true,
      data: report
    });
  } catch (error: any) {
    logWithTimestamp(`Error getting delivery report: ${error.message}`, 'error');
    return res.status(500).json({
      success: false,
      error: 'Failed to get delivery report'
    });
  }
});

/**
 * GET /api/v1/message-tracking/overall-stats
 * Get overall delivery statistics
 */
router.get('/overall-stats', async (req: Request, res: Response) => {
  try {
    const stats = await MessageTrackingService.getOverallDeliveryStats();

    return res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error: any) {
    logWithTimestamp(`Error getting overall stats: ${error.message}`, 'error');
    return res.status(500).json({
      success: false,
      error: 'Failed to get overall statistics'
    });
  }
});

/**
 * POST /api/v1/message-tracking/mark-read
 * Mark a message as read (send read receipt)
 */
router.post('/mark-read', async (req: Request, res: Response) => {
  try {
    const { messageId } = req.body;

    if (!messageId) {
      return res.status(400).json({
        success: false,
        error: 'Message ID is required'
      });
    }

    const success = await MessageTrackingService.markAsRead(messageId);

    return res.status(200).json({
      success,
      message: success ? 'Message marked as read' : 'Failed to mark message as read'
    });
  } catch (error: any) {
    logWithTimestamp(`Error marking message as read: ${error.message}`, 'error');
    return res.status(500).json({
      success: false,
      error: 'Failed to mark message as read'
    });
  }
});

/**
 * GET /api/v1/message-tracking/status/:messageId
 * Get status of a specific message
 */
router.get('/status/:messageId', async (req: Request, res: Response) => {
  try {
    const { messageId } = req.params;

    if (!messageId) {
      return res.status(400).json({
        success: false,
        error: 'Message ID is required'
      });
    }

    // This would require a new method in MessageTrackingService
    // For now, return a placeholder response
    return res.status(200).json({
      success: true,
      data: {
        messageId,
        status: 'sent', // This would come from the database
        sentAt: new Date(),
        deliveredAt: null,
        readAt: null
      }
    });
  } catch (error: any) {
    logWithTimestamp(`Error getting message status: ${error.message}`, 'error');
    return res.status(500).json({
      success: false,
      error: 'Failed to get message status'
    });
  }
});

/**
 * GET /api/v1/message-tracking/analytics
 * Get detailed analytics about message delivery and read rates
 */
router.get('/analytics', async (req: Request, res: Response) => {
  try {
    const { period = '30d', clientId } = req.query;

    // Get overall stats
    const overallStats = await MessageTrackingService.getOverallDeliveryStats();

    // If clientId is provided, get client-specific stats
    let clientStats = null;
    if (clientId && typeof clientId === 'string') {
      clientStats = await MessageTrackingService.getClientDeliveryReport(clientId);
    }

    const analytics = {
      period,
      overall: overallStats,
      client: clientStats,
      insights: {
        deliveryHealth: overallStats.deliveryRate >= 95 ? 'excellent' :
                       overallStats.deliveryRate >= 85 ? 'good' :
                       overallStats.deliveryRate >= 70 ? 'fair' : 'poor',
        readEngagement: overallStats.readRate >= 80 ? 'high' :
                       overallStats.readRate >= 60 ? 'medium' : 'low',
        recommendations: [] as string[]
      }
    };

    // Add recommendations based on performance
    if (overallStats.deliveryRate < 85) {
      analytics.insights.recommendations.push('Consider reviewing message content and timing');
    }
    if (overallStats.readRate < 60) {
      analytics.insights.recommendations.push('Improve message relevance and personalization');
    }
    if (overallStats.failed > overallStats.totalSent * 0.05) {
      analytics.insights.recommendations.push('Check phone number formats and validity');
    }

    return res.status(200).json({
      success: true,
      data: analytics
    });
  } catch (error: any) {
    logWithTimestamp(`Error getting analytics: ${error.message}`, 'error');
    return res.status(500).json({
      success: false,
      error: 'Failed to get analytics'
    });
  }
});

export default router;
