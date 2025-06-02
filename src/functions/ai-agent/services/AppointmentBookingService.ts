/**
 * إتجاه العقارية (Etjahh Real Estate) - Appointment Booking Service
 * خدمة حجز المواعيد لشركة إتجاه العقارية
 */

import { PrismaClient } from '@prisma/client';
import { logWithTimestamp } from '../../../utils/logger';
import {
  AppointmentResult,
  ClientInfo,
  BOOKING_KEYWORDS_AR,
  BOOKING_KEYWORDS_EN
} from '../types/AITypes';

/**
 * Appointment Booking Service Class
 * فئة خدمة حجز المواعيد
 */
export class AppointmentBookingService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  /**
   * Detect booking request in user message
   * كشف طلب الحجز في رسالة المستخدم
   */
  detectBookingRequest(userMessage: string, language: string): boolean {
    const message = userMessage.toLowerCase();

    const keywords = language === 'ar' ? BOOKING_KEYWORDS_AR : BOOKING_KEYWORDS_EN;

    return keywords.some(keyword => message.includes(keyword.toLowerCase()));
  }

  /**
   * Create appointment in database
   * إنشاء موعد في قاعدة البيانات
   */
  async createAppointment(
    clientPhone: string,
    userMessage: string,
    propertyId?: string,
    language: string = 'ar'
  ): Promise<AppointmentResult> {
    try {
      // Find or create client
      const client = await this.findOrCreateClient(clientPhone, userMessage);

      if (!client) {
        return {
          success: false,
          error: 'Failed to create or find client'
        };
      }

      // Determine appointment type and details
      const appointmentDetails = this.generateAppointmentDetails(
        userMessage,
        propertyId,
        language
      );

      // Schedule appointment for next business day
      const scheduledAt = this.getNextBusinessDayAt10AM();

      // Create appointment
      const appointment = await this.prisma.appointment.create({
        data: {
          title: appointmentDetails.title,
          description: appointmentDetails.description,
          scheduledAt,
          type: appointmentDetails.type,
          status: 'SCHEDULED',
          clientId: client.id,
          propertyId: propertyId || null,
          location: appointmentDetails.location
        }
      });

      logWithTimestamp(`Created appointment: ${appointment.id} for client: ${client.phone}`, 'info');

      return {
        success: true,
        appointment: {
          id: appointment.id,
          title: appointment.title,
          description: appointment.description || '',
          scheduledAt: appointment.scheduledAt,
          type: appointment.type,
          status: appointment.status,
          clientId: appointment.clientId,
          propertyId: appointment.propertyId,
          location: appointment.location || ''
        }
      };
    } catch (error: any) {
      logWithTimestamp(`Error creating appointment: ${error.message}`, 'error');
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Find or create client
   * البحث عن العميل أو إنشاؤه
   */
  private async findOrCreateClient(clientPhone: string, userMessage: string): Promise<ClientInfo | null> {
    try {
      // Find existing client
      let client = await this.prisma.client.findUnique({
        where: { phone: clientPhone }
      });

      if (!client) {
        // Create new client
        client = await this.prisma.client.create({
          data: {
            name: `عميل جديد - ${clientPhone}`,
            phone: clientPhone,
            lastMessage: userMessage,
            type: 'Client'
          }
        });
        logWithTimestamp(`Created new client: ${client.id}`, 'info');
      } else {
        // Update existing client's last message and activity
        client = await this.prisma.client.update({
          where: { id: client.id },
          data: {
            lastMessage: userMessage,
            lastActive: new Date()
          }
        });
      }

      return {
        id: client.id,
        name: client.name,
        phone: client.phone,
        email: client.email || undefined,
        type: client.type,
        lastMessage: client.lastMessage || undefined,
        lastActive: client.lastActive || undefined,
        createdAt: client.createdAt,
        updatedAt: client.updatedAt
      };
    } catch (error: any) {
      logWithTimestamp(`Error finding/creating client: ${error.message}`, 'error');
      return null;
    }
  }

  /**
   * Generate appointment details
   * توليد تفاصيل الموعد
   */
  private generateAppointmentDetails(
    userMessage: string,
    propertyId?: string,
    language: string = 'ar'
  ): {
    title: string;
    description: string;
    type: string;
    location: string;
  } {
    const appointmentType = propertyId ? 'viewing' : 'meeting';

    const title = language === 'ar'
      ? propertyId
        ? `معاينة عقار - ${propertyId.slice(-8).toUpperCase()}`
        : 'استشارة عقارية'
      : propertyId
        ? `Property Viewing - ${propertyId.slice(-8).toUpperCase()}`
        : 'Real Estate Consultation';

    const description = language === 'ar'
      ? `طلب موعد من العميل: ${userMessage}`
      : `Appointment request from client: ${userMessage}`;

    const location = language === 'ar'
      ? 'مكتب شركة إتجاه العقارية'
      : 'Etjahh Real Estate Office';

    return {
      title,
      description,
      type: appointmentType,
      location
    };
  }

  /**
   * Get next business day at 10 AM
   * الحصول على يوم العمل التالي في الساعة 10 صباحاً
   */
  private getNextBusinessDayAt10AM(): Date {
    const scheduledAt = new Date();

    // Add one day
    scheduledAt.setDate(scheduledAt.getDate() + 1);

    // Set to 10 AM
    scheduledAt.setHours(10, 0, 0, 0);

    // If it's Friday (5) or Saturday (6), move to Sunday (0)
    const dayOfWeek = scheduledAt.getDay();
    if (dayOfWeek === 5) { // Friday
      scheduledAt.setDate(scheduledAt.getDate() + 2); // Move to Sunday
    } else if (dayOfWeek === 6) { // Saturday
      scheduledAt.setDate(scheduledAt.getDate() + 1); // Move to Sunday
    }

    return scheduledAt;
  }

  /**
   * Generate appointment confirmation message
   * توليد رسالة تأكيد الموعد
   */
  generateConfirmationMessage(appointment: any, language: string = 'ar'): string {
    const scheduledDate = new Date(appointment.scheduledAt);
    const dateStr = scheduledDate.toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US');
    const timeStr = scheduledDate.toLocaleTimeString(language === 'ar' ? 'ar-SA' : 'en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });

    if (language === 'ar') {
      return `✅ *تم تأكيد حجز موعدك بنجاح!*

📅 *تفاصيل الموعد:*
🆔 رقم الموعد: ${appointment.id.slice(-8).toUpperCase()}
📋 نوع الموعد: ${appointment.type === 'viewing' ? 'معاينة عقار' : 'استشارة عقارية'}
📅 التاريخ: ${dateStr}
🕙 الوقت: ${timeStr}
📍 المكان: ${appointment.location}

${appointment.propertyId ? `🏠 رقم العقار: ${appointment.propertyId.slice(-8).toUpperCase()}\n` : ''}

📞 *سيتم التواصل معك:*
• قبل الموعد بـ 24 ساعة للتأكيد
• في حالة الحاجة لتغيير الموعد
• لتقديم تفاصيل إضافية

💡 *ملاحظة:* يمكنك إلغاء أو تعديل الموعد بإرسال رسالة

*شركة إتجاه العقارية* 🏢
نحن هنا لخدمتك على مدار الساعة!`;
    } else {
      return `✅ *Your appointment has been successfully booked!*

📅 *Appointment Details:*
🆔 Appointment ID: ${appointment.id.slice(-8).toUpperCase()}
📋 Type: ${appointment.type === 'viewing' ? 'Property Viewing' : 'Real Estate Consultation'}
📅 Date: ${dateStr}
🕙 Time: ${timeStr}
📍 Location: ${appointment.location}

${appointment.propertyId ? `🏠 Property ID: ${appointment.propertyId.slice(-8).toUpperCase()}\n` : ''}

📞 *We will contact you:*
• 24 hours before the appointment for confirmation
• If you need to reschedule
• To provide additional details

💡 *Note:* You can cancel or modify the appointment by sending a message

*Etjahh Real Estate Company* 🏢
We're here to serve you 24/7!`;
    }
  }

  /**
   * Get client appointments
   * الحصول على مواعيد العميل
   */
  async getClientAppointments(clientPhone: string): Promise<any[]> {
    try {
      const client = await this.prisma.client.findUnique({
        where: { phone: clientPhone },
        include: {
          appointments: {
            orderBy: { scheduledAt: 'desc' },
            take: 10
          }
        }
      });

      return client?.appointments || [];
    } catch (error: any) {
      logWithTimestamp(`Error fetching client appointments: ${error.message}`, 'error');
      return [];
    }
  }

  /**
   * Cancel appointment
   * إلغاء الموعد
   */
  async cancelAppointment(appointmentId: string, reason?: string): Promise<boolean> {
    try {
      await this.prisma.appointment.update({
        where: { id: appointmentId },
        data: {
          status: 'CANCELLED',
          description: reason ? `${reason} - Cancelled` : 'Cancelled'
        }
      });

      logWithTimestamp(`Appointment ${appointmentId} cancelled`, 'info');
      return true;
    } catch (error: any) {
      logWithTimestamp(`Error cancelling appointment: ${error.message}`, 'error');
      return false;
    }
  }

  /**
   * Cleanup - disconnect Prisma
   * تنظيف - قطع اتصال Prisma
   */
  async disconnect(): Promise<void> {
    await this.prisma.$disconnect();
  }
}
