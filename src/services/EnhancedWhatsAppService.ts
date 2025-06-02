/**
 * Enhanced WhatsApp Service for إتجاه العقارية (Etjahh Real Estate)
 * خدمة واتساب محسنة لشركة إتجاه العقارية
 * 
 * Features:
 * - Advanced message tracking with read receipts
 * - Automatic retry mechanism for failed messages
 * - Real-time status updates and notifications
 * - Arabic language support with RTL formatting
 * - Comprehensive delivery analytics
 */

import { prisma } from '../lib/prisma';
import { logWithTimestamp } from '../utils/logger';
import { sendWhatsAppMessage } from '../functions/sendWhatsAppMessage';
import { MessageTrackingService } from './messageTrackingService';

export interface WhatsAppMessageOptions {
  to: string;
  text: string;
  trackReadReceipts?: boolean;
  isAutomated?: boolean;
  responseSource?: string;
  retryAttempts?: number;
  priority?: 'high' | 'normal' | 'low';
}

export interface MessageDeliveryStatus {
  messageId: string;
  status: 'sent' | 'delivered' | 'read' | 'failed';
  timestamp: Date;
  recipientId: string;
  deliveryTime?: number; // Time to delivery in seconds
  readTime?: number; // Time to read in seconds
}

export class EnhancedWhatsAppService {
  
  /**
   * Send a WhatsApp message with enhanced tracking
   * إرسال رسالة واتساب مع تتبع محسن
   */
  static async sendMessage(options: WhatsAppMessageOptions): Promise<{
    success: boolean;
    messageId?: string;
    error?: string;
  }> {
    try {
      const {
        to,
        text,
        trackReadReceipts = true,
        isAutomated = false,
        responseSource = 'Enhanced WhatsApp Service',
        retryAttempts = 3,
        priority = 'normal'
      } = options;

      logWithTimestamp(
        `🚀 Sending ${priority} priority message to ${to} [${responseSource}]`,
        'info'
      );

      // Create message record in database first
      const messageRecord = await prisma.message.create({
        data: {
          text,
          clientId: await this.getOrCreateClientId(to),
          isBot: true,
          isAutomated,
          responseSource,
          status: 'pending',
          sentAt: new Date()
        }
      });

      // Attempt to send message with retry logic
      let lastError: string = '';
      for (let attempt = 1; attempt <= retryAttempts; attempt++) {
        try {
          const result = await sendWhatsAppMessage(
            to,
            text,
            messageRecord.id,
            trackReadReceipts,
            isAutomated,
            responseSource
          );

          if (result.success && result.messageId) {
            // Update message record with WhatsApp message ID
            await prisma.message.update({
              where: { id: messageRecord.id },
              data: {
                whatsappMessageId: result.messageId,
                status: 'sent',
                sentAt: new Date()
              }
            });

            logWithTimestamp(
              `✅ Message sent successfully on attempt ${attempt}: ${result.messageId}`,
              'success'
            );

            return {
              success: true,
              messageId: result.messageId
            };
          }

          lastError = result.error || 'Unknown error';
        } catch (error: any) {
          lastError = error.message;
          logWithTimestamp(
            `⚠️ Attempt ${attempt}/${retryAttempts} failed: ${lastError}`,
            'warning'
          );

          if (attempt < retryAttempts) {
            // Wait before retry (exponential backoff)
            const delay = Math.pow(2, attempt) * 1000;
            await new Promise(resolve => setTimeout(resolve, delay));
          }
        }
      }

      // All attempts failed
      await prisma.message.update({
        where: { id: messageRecord.id },
        data: {
          status: 'failed',
          failedAt: new Date(),
          errorDetails: lastError
        }
      });

      logWithTimestamp(
        `❌ Failed to send message after ${retryAttempts} attempts: ${lastError}`,
        'error'
      );

      return {
        success: false,
        error: lastError
      };

    } catch (error: any) {
      logWithTimestamp(
        `💥 Critical error in sendMessage: ${error.message}`,
        'error'
      );

      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Send a message with Arabic formatting and RTL support
   * إرسال رسالة مع تنسيق عربي ودعم RTL
   */
  static async sendArabicMessage(
    to: string,
    arabicText: string,
    options?: Partial<WhatsAppMessageOptions>
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    // Format Arabic text with proper RTL markers
    const formattedText = this.formatArabicText(arabicText);

    return this.sendMessage({
      to,
      text: formattedText,
      responseSource: 'Arabic Message Service',
      ...options
    });
  }

  /**
   * Get or create client ID for phone number
   * الحصول على معرف العميل أو إنشاؤه لرقم الهاتف
   */
  private static async getOrCreateClientId(phoneNumber: string): Promise<string> {
    try {
      // Try to find existing client
      let client = await prisma.client.findUnique({
        where: { phone: phoneNumber }
      });

      if (!client) {
        // Create new client
        client = await prisma.client.create({
          data: {
            phone: phoneNumber,
            name: `Client ${phoneNumber}`,
            lastMessage: 'New client created',
            lastActive: new Date()
          }
        });

        logWithTimestamp(
          `👤 New client created: ${phoneNumber} (ID: ${client.id})`,
          'info'
        );
      }

      return client.id;
    } catch (error: any) {
      logWithTimestamp(
        `Failed to get/create client for ${phoneNumber}: ${error.message}`,
        'error'
      );
      throw error;
    }
  }

  /**
   * Format Arabic text with proper RTL support
   * تنسيق النص العربي مع دعم RTL المناسب
   */
  private static formatArabicText(text: string): string {
    // Add RTL mark at the beginning for proper display
    const rtlMark = '\u202B';
    const ltrMark = '\u202C';
    
    // Format the text with RTL markers
    return `${rtlMark}${text}${ltrMark}`;
  }

  /**
   * Get comprehensive delivery analytics
   * الحصول على تحليلات التسليم الشاملة
   */
  static async getDeliveryAnalytics(timeframe: 'day' | 'week' | 'month' = 'week'): Promise<{
    totalSent: number;
    delivered: number;
    read: number;
    failed: number;
    deliveryRate: number;
    readRate: number;
    avgDeliveryTime: number;
    avgReadTime: number;
    topPerformingHours: number[];
  }> {
    try {
      const now = new Date();
      const timeframeDays = timeframe === 'day' ? 1 : timeframe === 'week' ? 7 : 30;
      const startDate = new Date(now.getTime() - timeframeDays * 24 * 60 * 60 * 1000);

      const messages = await prisma.message.findMany({
        where: {
          isBot: true,
          sentAt: { gte: startDate },
          whatsappMessageId: { not: null }
        },
        select: {
          status: true,
          sentAt: true,
          deliveredAt: true,
          readAt: true,
          createdAt: true
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
          ) / deliveredMessages.length / 1000
        : 0;

      const avgReadTime = readMessages.length > 0
        ? readMessages.reduce((sum, m) => 
            sum + (m.readAt!.getTime() - m.deliveredAt!.getTime()), 0
          ) / readMessages.length / 1000
        : 0;

      // Find top performing hours
      const hourCounts = new Array(24).fill(0);
      messages.forEach(m => {
        if (m.sentAt) {
          const hour = m.sentAt.getHours();
          hourCounts[hour]++;
        }
      });

      const topPerformingHours = hourCounts
        .map((count, hour) => ({ hour, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 3)
        .map(item => item.hour);

      return {
        totalSent,
        delivered,
        read,
        failed,
        deliveryRate: Math.round(deliveryRate * 100) / 100,
        readRate: Math.round(readRate * 100) / 100,
        avgDeliveryTime: Math.round(avgDeliveryTime * 100) / 100,
        avgReadTime: Math.round(avgReadTime * 100) / 100,
        topPerformingHours
      };

    } catch (error: any) {
      logWithTimestamp(
        `Failed to get delivery analytics: ${error.message}`,
        'error'
      );

      return {
        totalSent: 0,
        delivered: 0,
        read: 0,
        failed: 0,
        deliveryRate: 0,
        readRate: 0,
        avgDeliveryTime: 0,
        avgReadTime: 0,
        topPerformingHours: []
      };
    }
  }

  /**
   * Get real-time message status
   * الحصول على حالة الرسالة في الوقت الفعلي
   */
  static async getMessageStatus(whatsappMessageId: string): Promise<MessageDeliveryStatus | null> {
    try {
      const message = await prisma.message.findFirst({
        where: { whatsappMessageId },
        select: {
          whatsappMessageId: true,
          status: true,
          sentAt: true,
          deliveredAt: true,
          readAt: true,
          client: { select: { phone: true } }
        }
      });

      if (!message) {
        return null;
      }

      const deliveryTime = message.deliveredAt && message.sentAt
        ? (message.deliveredAt.getTime() - message.sentAt.getTime()) / 1000
        : undefined;

      const readTime = message.readAt && message.deliveredAt
        ? (message.readAt.getTime() - message.deliveredAt.getTime()) / 1000
        : undefined;

      return {
        messageId: whatsappMessageId,
        status: message.status as any,
        timestamp: message.sentAt || new Date(),
        recipientId: message.client.phone,
        deliveryTime,
        readTime
      };

    } catch (error: any) {
      logWithTimestamp(
        `Failed to get message status: ${error.message}`,
        'error'
      );
      return null;
    }
  }
}

export default EnhancedWhatsAppService;
