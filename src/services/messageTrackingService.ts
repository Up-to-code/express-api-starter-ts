import { prisma } from '../lib/prisma';
import { logWithTimestamp } from '../utils/logger';
import {
  MessageStatusType,
  WhatsAppStatus,
  TrackedWhatsAppMessage,
  MessageDeliveryReport
} from '../interfaces/MessageStatus';

/**
 * Service for tracking WhatsApp message delivery and read receipts
 */
export class MessageTrackingService {

  /**
   * Track a sent message
   */
  static async trackSentMessage(
    whatsappMessageId: string,
    internalMessageId: string,
    to: string,
    content: string,
    isAutomated: boolean = false,
    responseSource?: string
  ): Promise<void> {
    try {
      // Store in database (you may need to create a MessageTracking table)
      // For now, we'll update the existing Message record
      await prisma.message.update({
        where: { id: internalMessageId },
        data: {
          // Add these fields to your Message model if they don't exist
          whatsappMessageId,
          status: 'sent',
          sentAt: new Date(),
          lastStatusUpdate: new Date(),
          isAutomated,
          responseSource
        }
      });

      logWithTimestamp(
        `Message tracking started: ${whatsappMessageId} to ${to}`,
        'info'
      );
    } catch (error: any) {
      logWithTimestamp(
        `Failed to track sent message: ${error.message}`,
        'error'
      );
    }
  }

  /**
   * Update message status based on WhatsApp status webhook
   */
  static async updateMessageStatus(status: WhatsAppStatus): Promise<void> {
    try {
      // Enhanced message lookup with multiple strategies
      let existingMessage = await prisma.message.findFirst({
        where: { whatsappMessageId: status.id },
        select: { id: true, status: true, text: true, clientId: true, whatsappMessageId: true }
      });

      // Strategy 1: Try exact match first
      if (!existingMessage) {
        // Strategy 2: Try partial match from the end (last 20 chars)
        const idSuffix = status.id.slice(-20);
        existingMessage = await prisma.message.findFirst({
          where: {
            whatsappMessageId: {
              endsWith: idSuffix
            }
          },
          select: { id: true, status: true, text: true, clientId: true, whatsappMessageId: true }
        });

        if (existingMessage) {
          logWithTimestamp(
            `🔍 Found message by suffix match: ${existingMessage.whatsappMessageId} for ${status.id}`,
            'info'
          );
        }
      }

      // Strategy 3: Try partial match from the beginning (first 30 chars)
      if (!existingMessage) {
        const idPrefix = status.id.substring(0, 30);
        existingMessage = await prisma.message.findFirst({
          where: {
            whatsappMessageId: {
              startsWith: idPrefix
            }
          },
          select: { id: true, status: true, text: true, clientId: true, whatsappMessageId: true }
        });

        if (existingMessage) {
          logWithTimestamp(
            `🔍 Found message by prefix match: ${existingMessage.whatsappMessageId} for ${status.id}`,
            'info'
          );
        }
      }

      // Strategy 4: Try finding recent messages from the same recipient
      if (!existingMessage) {
        const recentMessage = await prisma.message.findFirst({
          where: {
            client: {
              phone: status.recipient_id
            },
            isBot: true,
            whatsappMessageId: { not: null },
            sentAt: {
              gte: new Date(Date.now() - 5 * 60 * 1000) // Last 5 minutes
            }
          },
          select: { id: true, status: true, text: true, clientId: true, whatsappMessageId: true },
          orderBy: { sentAt: 'desc' }
        });

        if (recentMessage) {
          logWithTimestamp(
            `🔍 Found recent message from same recipient: ${recentMessage.whatsappMessageId} for ${status.id}`,
            'info'
          );
          existingMessage = recentMessage;
        }
      }

      if (!existingMessage) {
        logWithTimestamp(
          `❌ ERROR: Message not found for status update: ${status.id} from ${status.recipient_id}`,
          'error'
        );

        // Log for debugging but don't return - create a placeholder entry
        logWithTimestamp(
          `🔧 Creating placeholder message entry for tracking: ${status.id}`,
          'info'
        );

        // Create a placeholder message for tracking
        try {
          const client = await prisma.client.findFirst({
            where: { phone: status.recipient_id }
          });

          if (client) {
            await prisma.message.create({
              data: {
                whatsappMessageId: status.id,
                text: 'Message tracked from webhook',
                clientId: client.id,
                isBot: true,
                status: status.status,
                sentAt: new Date(parseInt(status.timestamp) * 1000),
                lastStatusUpdate: new Date()
              }
            });

            logWithTimestamp(
              `✅ Created placeholder message for tracking: ${status.id}`,
              'info'
            );
          }
        } catch (createError: any) {
          logWithTimestamp(
            `❌ Failed to create placeholder message: ${createError.message}`,
            'error'
          );
        }

        return;
      }

      const updateData: any = {
        status: status.status,
        lastStatusUpdate: new Date()
      };

      // Add specific timestamp based on status
      switch (status.status) {
        case 'delivered':
          updateData.deliveredAt = new Date(parseInt(status.timestamp) * 1000);
          break;
        case 'read':
          updateData.readAt = new Date(parseInt(status.timestamp) * 1000);
          break;
        case 'failed':
          updateData.failedAt = new Date(parseInt(status.timestamp) * 1000);
          if (status.errors) {
            updateData.errorDetails = JSON.stringify(status.errors);
          }
          break;
      }

      // Update message in database with better error handling
      const updatedMessage = await prisma.message.updateMany({
        where: {
          OR: [
            { whatsappMessageId: status.id },
            { whatsappMessageId: { contains: status.id.substring(0, 20) } }
          ]
        },
        data: updateData
      });

      if (updatedMessage.count > 0) {
        logWithTimestamp(
          `✅ SUCCESS: Message status updated: ${status.id} → ${status.status}`,
          'info'
        );

        // Enhanced logging with emojis for different statuses
        switch (status.status) {
          case 'sent':
            logWithTimestamp(`📤 Message ${status.id} sent successfully`, 'info');
            break;
          case 'delivered':
            logWithTimestamp(`📬 Message ${status.id} delivered to ${status.recipient_id}`, 'info');
            break;
          case 'read':
            logWithTimestamp(
              `📖 Message ${status.id} read by ${status.recipient_id}`,
              'success'
            );
            break;
          case 'failed':
            logWithTimestamp(`❌ Message ${status.id} failed to ${status.recipient_id}`, 'error');
            if (status.errors) {
              logWithTimestamp(`💥 Error details: ${JSON.stringify(status.errors)}`, 'error');
            }
            break;
        }
      } else {
        logWithTimestamp(
          `❌ ERROR: Message not found for status update: ${status.id}`,
          'error'
        );
      }
    } catch (error: any) {
      logWithTimestamp(
        `💥 CRITICAL: Failed to update message status: ${error.message}`,
        'error'
      );
      logWithTimestamp(
        `🔍 Debug info - Status ID: ${status.id}, Recipient: ${status.recipient_id}`,
        'error'
      );
    }
  }

  /**
   * Get delivery report for a specific client
   */
  static async getClientDeliveryReport(clientId: string): Promise<MessageDeliveryReport> {
    try {
      const messages = await prisma.message.findMany({
        where: {
          clientId,
          isBot: true, // Only outgoing messages
          whatsappMessageId: { not: null }
        }
      });

      const totalSent = messages.length;
      const delivered = messages.filter(m =>
        m.status === 'delivered' || m.status === 'read'
      ).length;
      const read = messages.filter(m => m.status === 'read').length;
      const failed = messages.filter(m => m.status === 'failed').length;

      const deliveryRate = totalSent > 0 ? (delivered / totalSent) * 100 : 0;
      const readRate = delivered > 0 ? (read / delivered) * 100 : 0;

      // Calculate average times
      const deliveredMessages = messages.filter(m => m.deliveredAt && m.sentAt);
      const readMessages = messages.filter(m => m.readAt && m.deliveredAt);

      const avgDeliveryTime = deliveredMessages.length > 0
        ? deliveredMessages.reduce((sum, m) =>
            sum + (m.deliveredAt!.getTime() - m.sentAt!.getTime()), 0
          ) / deliveredMessages.length / 1000 // Convert to seconds
        : undefined;

      const avgReadTime = readMessages.length > 0
        ? readMessages.reduce((sum, m) =>
            sum + (m.readAt!.getTime() - m.deliveredAt!.getTime()), 0
          ) / readMessages.length / 1000 // Convert to seconds
        : undefined;

      return {
        totalSent,
        delivered,
        read,
        failed,
        deliveryRate: Math.round(deliveryRate * 100) / 100,
        readRate: Math.round(readRate * 100) / 100,
        avgDeliveryTime,
        avgReadTime
      };
    } catch (error: any) {
      logWithTimestamp(
        `Failed to generate delivery report: ${error.message}`,
        'error'
      );

      return {
        totalSent: 0,
        delivered: 0,
        read: 0,
        failed: 0,
        deliveryRate: 0,
        readRate: 0
      };
    }
  }

  /**
   * Get overall delivery statistics
   */
  static async getOverallDeliveryStats(): Promise<MessageDeliveryReport> {
    try {
      const messages = await prisma.message.findMany({
        where: {
          isBot: true, // Only outgoing messages
          whatsappMessageId: { not: null },
          sentAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
          }
        }
      });

      const totalSent = messages.length;
      const delivered = messages.filter(m =>
        m.status === 'delivered' || m.status === 'read'
      ).length;
      const read = messages.filter(m => m.status === 'read').length;
      const failed = messages.filter(m => m.status === 'failed').length;

      const deliveryRate = totalSent > 0 ? (delivered / totalSent) * 100 : 0;
      const readRate = delivered > 0 ? (read / delivered) * 100 : 0;

      return {
        totalSent,
        delivered,
        read,
        failed,
        deliveryRate: Math.round(deliveryRate * 100) / 100,
        readRate: Math.round(readRate * 100) / 100
      };
    } catch (error: any) {
      logWithTimestamp(
        `Failed to get overall delivery stats: ${error.message}`,
        'error'
      );

      return {
        totalSent: 0,
        delivered: 0,
        read: 0,
        failed: 0,
        deliveryRate: 0,
        readRate: 0
      };
    }
  }

  /**
   * Mark incoming message as read (send read receipt)
   */
  static async markAsRead(messageId: string): Promise<boolean> {
    try {
      // This would send a read receipt back to WhatsApp
      // Implementation depends on your WhatsApp API setup
      logWithTimestamp(
        `Marking message as read: ${messageId}`,
        'info'
      );

      // You can implement actual read receipt sending here
      // For now, we'll just log it
      return true;
    } catch (error: any) {
      logWithTimestamp(
        `Failed to mark message as read: ${error.message}`,
        'error'
      );
      return false;
    }
  }
}

export default MessageTrackingService;
