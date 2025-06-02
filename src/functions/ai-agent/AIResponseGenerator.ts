/**
 * إتجاه العقارية (Etjahh Real Estate) - Main AI Response Generator
 * مولد الاستجابات الذكية الرئيسي لشركة إتجاه العقارية
 */

import { detectLanguage } from '../../utils/helpers';
import { logWithTimestamp } from '../../utils/logger';
import { AIResponse } from './types/AITypes';
import { PropertySearchService } from './services/PropertySearchService';
import { WhatsAppImageService } from './services/WhatsAppImageService';
import { AppointmentBookingService } from './services/AppointmentBookingService';
import { OpenAIService } from './services/OpenAIService';
import { ResponseGeneratorService } from './services/ResponseGeneratorService';
import { EnhancedPropertyResponseService } from './services/EnhancedPropertyResponseService';

/**
 * Main AI Response Generator Class
 * فئة مولد الاستجابات الذكية الرئيسية
 */
export class AIResponseGenerator {
  private propertySearchService: PropertySearchService;
  private whatsappImageService: WhatsAppImageService;
  private appointmentBookingService: AppointmentBookingService;
  private openAIService: OpenAIService;
  private responseGeneratorService: ResponseGeneratorService;
  private enhancedPropertyResponseService: EnhancedPropertyResponseService;

  constructor() {
    this.propertySearchService = new PropertySearchService();
    this.whatsappImageService = new WhatsAppImageService();
    this.appointmentBookingService = new AppointmentBookingService();
    this.openAIService = new OpenAIService();
    this.responseGeneratorService = new ResponseGeneratorService();
    this.enhancedPropertyResponseService = new EnhancedPropertyResponseService();
  }

  /**
   * Generate AI response based on message content and detected language
   * توليد استجابة ذكية بناءً على محتوى الرسالة واللغة المكتشفة
   */
  async generateResponse(
    userMessage: string,
    language: string = 'ar',
    clientPhone?: string
  ): Promise<AIResponse> {
    const startTime = Date.now();

    try {
      logWithTimestamp(`إتجاه العقارية AI Agent processing message: "${userMessage}" (${language})`, 'info');

      // 1. First, check if this is a booking/appointment request
      if (clientPhone && this.appointmentBookingService.detectBookingRequest(userMessage, language)) {
        logWithTimestamp('Booking request detected, creating appointment...', 'info');

        try {
          const appointmentResult = await this.appointmentBookingService.createAppointment(
            clientPhone,
            userMessage,
            undefined,
            language
          );

          if (appointmentResult.success && appointmentResult.appointment) {
            const confirmationMessage = this.appointmentBookingService.generateConfirmationMessage(
              appointmentResult.appointment,
              language
            );

            return {
              response: confirmationMessage,
              confidence: 0.98,
              source: 'appointment_booking',
              appointmentId: appointmentResult.appointment.id,
              processingTime: Date.now() - startTime,
              language
            };
          } else {
            const errorMessage = language === 'ar'
              ? `عذراً، حدث خطأ أثناء حجز الموعد. يرجى المحاولة مرة أخرى أو الاتصال بنا مباشرة.\n\n*شركة إتجاه العقارية* 🏢`
              : `Sorry, there was an error booking your appointment. Please try again or contact us directly.\n\n*Etjahh Real Estate Company* 🏢`;

            return {
              response: errorMessage,
              confidence: 0.7,
              source: 'appointment_booking',
              error: appointmentResult.error,
              processingTime: Date.now() - startTime,
              language
            };
          }
        } catch (bookingError: any) {
          logWithTimestamp(`Appointment booking failed: ${bookingError.message}`, 'error');
          // Fall through to property search
        }
      }

      // 2. Check if this is a property search request - Enhanced with images
      const searchCriteria = this.propertySearchService.extractSearchCriteria(userMessage, language);

      if (searchCriteria && clientPhone) {
        logWithTimestamp('Property search request detected, using enhanced property response...', 'info');

        try {
          // Use enhanced property response service for comprehensive experience
          const enhancedResult = await this.enhancedPropertyResponseService.sendPropertyResponse({
            clientPhone,
            userMessage,
            language,
            includeImages: true,
            maxProperties: 3,
            maxImagesPerProperty: 2
          });

          if (enhancedResult.success) {
            // Return a summary response since detailed messages are already sent
            const summaryResponse = language === 'ar'
              ? `✅ *تم إرسال ${enhancedResult.propertiesFound} عقارات مطابقة لمعاييرك*

📊 *ملخص النتائج:*
🏠 عدد العقارات: ${enhancedResult.propertiesFound}
📱 الرسائل المرسلة: ${enhancedResult.messagesSent}
📸 الصور المرسلة: ${enhancedResult.imagesSent}
⏱️ وقت المعالجة: ${enhancedResult.processingTime}ms

*شركة إتجاه العقارية* 🏢
تم إرسال تفاصيل العقارات والصور أعلاه ⬆️`
              : `✅ *Sent ${enhancedResult.propertiesFound} properties matching your criteria*

📊 *Results Summary:*
🏠 Properties: ${enhancedResult.propertiesFound}
📱 Messages sent: ${enhancedResult.messagesSent}
📸 Images sent: ${enhancedResult.imagesSent}
⏱️ Processing time: ${enhancedResult.processingTime}ms

*Etjahh Real Estate Company* 🏢
Property details and images sent above ⬆️`;

            return {
              response: summaryResponse,
              confidence: 0.98,
              source: 'enhanced_property_search',
              propertySearchResult: enhancedResult.searchResult,
              processingTime: Date.now() - startTime,
              language
            };
          } else {
            // Enhanced service failed, fallback to basic search
            logWithTimestamp('Enhanced property service failed, using basic search...', 'warning');

            const searchResults = await this.propertySearchService.searchProperties(searchCriteria.criteria);
            const response = this.responseGeneratorService.generatePropertySearchResponse(
              searchResults,
              language
            );

            return {
              response,
              confidence: 0.85,
              source: 'property_search',
              propertySearchResult: searchResults,
              error: enhancedResult.error,
              processingTime: Date.now() - startTime,
              language
            };
          }
        } catch (enhancedError: any) {
          logWithTimestamp(`Enhanced property search failed: ${enhancedError.message}`, 'error');
          // Fall through to basic property search

          try {
            const searchResults = await this.propertySearchService.searchProperties(searchCriteria.criteria);
            const response = this.responseGeneratorService.generatePropertySearchResponse(
              searchResults,
              language
            );

            return {
              response,
              confidence: 0.8,
              source: 'property_search',
              propertySearchResult: searchResults,
              processingTime: Date.now() - startTime,
              language
            };
          } catch (basicError: any) {
            logWithTimestamp(`Basic property search also failed: ${basicError.message}`, 'error');
            // Fall through to OpenAI response
          }
        }
      } else if (searchCriteria && !clientPhone) {
        // Property search without phone number - use basic search
        logWithTimestamp('Property search without phone number, using basic search...', 'info');

        try {
          const searchResults = await this.propertySearchService.searchProperties(searchCriteria.criteria);
          const response = this.responseGeneratorService.generatePropertySearchResponse(
            searchResults,
            language
          );

          return {
            response,
            confidence: 0.9,
            source: 'property_search',
            propertySearchResult: searchResults,
            processingTime: Date.now() - startTime,
            language
          };
        } catch (searchError: any) {
          logWithTimestamp(`Property search failed: ${searchError.message}`, 'error');
          // Fall through to OpenAI response
        }
      }

      // 3. Try OpenAI for general questions
      if (this.openAIService.isConfigured()) {
        try {
          logWithTimestamp('Using OpenAI for intelligent response...', 'info');
          const openAIResponse = await this.openAIService.generateResponse(userMessage, language);

          return {
            response: openAIResponse,
            confidence: 0.9,
            source: 'openai_agent',
            processingTime: Date.now() - startTime,
            language
          };
        } catch (openAIError: any) {
          logWithTimestamp(`OpenAI failed: ${openAIError.message}. Falling back to rule-based responses.`, 'error');
          // Fall through to rule-based responses
        }
      }

      // 4. Fallback to rule-based responses
      logWithTimestamp('Using rule-based AI responses...', 'info');

      const ruleBasedResponse = this.responseGeneratorService.generateRuleBasedResponse(userMessage, language);

      if (ruleBasedResponse) {
        return {
          response: ruleBasedResponse,
          confidence: 0.85,
          source: 'ai_agent',
          processingTime: Date.now() - startTime,
          language
        };
      }

      // 5. Default fallback response
      const defaultResponse = this.generateDefaultResponse(language);

      return {
        response: defaultResponse,
        confidence: 0.6,
        source: 'ai_agent',
        processingTime: Date.now() - startTime,
        language
      };

    } catch (error: any) {
      logWithTimestamp(`AI Response Generator error: ${error.message}`, 'error');

      const errorResponse = language === 'ar'
        ? `عذراً، حدث خطأ أثناء معالجة طلبك. يرجى المحاولة مرة أخرى.\n\n*شركة إتجاه العقارية* 🏢`
        : `Sorry, an error occurred while processing your request. Please try again.\n\n*Etjahh Real Estate Company* 🏢`;

      return {
        response: errorResponse,
        confidence: 0.1,
        source: 'ai_agent',
        error: error.message,
        processingTime: Date.now() - startTime,
        language
      };
    }
  }

  /**
   * Generate default response for unrecognized queries
   * توليد استجابة افتراضية للاستفسارات غير المعروفة
   */
  private generateDefaultResponse(language: string): string {
    return language === 'ar'
      ? `مرحباً بك في *شركة إتجاه العقارية*! 👋

أنا مساعدك الذكي المتخصص في العقارات السعودية. يمكنني مساعدتك في:

🏠 *البحث عن عقارات* للشراء أو الإيجار
💰 *تقييم العقارات* وتحليل الأسعار
📅 *حجز مواعيد المعاينة* والاستشارات
📊 *تحليل السوق* والاتجاهات العقارية
💡 *الاستشارات العقارية* المتخصصة

كيف يمكنني مساعدتك اليوم؟

*شركة إتجاه العقارية - شريكك الموثوق في العقارات* 🏢✨`
      : `Welcome to *Etjahh Real Estate Company*! 👋

I'm your intelligent assistant specializing in Saudi real estate. I can help you with:

🏠 *Property Search* for buying or renting
💰 *Property Valuation* and price analysis
📅 *Booking Viewing Appointments* and consultations
📊 *Market Analysis* and real estate trends
💡 *Specialized Real Estate Consultations*

How can I help you today?

*Etjahh Real Estate Company - Your Trusted Real Estate Partner* 🏢✨`;
  }

  /**
   * Get service status for diagnostics
   * الحصول على حالة الخدمات للتشخيص
   */
  getServiceStatus(): {
    propertySearch: boolean;
    whatsappImages: boolean;
    appointmentBooking: boolean;
    openAI: boolean;
  } {
    return {
      propertySearch: true, // Always available (uses database)
      whatsappImages: this.whatsappImageService.isConfigured(),
      appointmentBooking: true, // Always available (uses database)
      openAI: this.openAIService.isConfigured()
    };
  }

  /**
   * Cleanup resources
   * تنظيف الموارد
   */
  async cleanup(): Promise<void> {
    try {
      await this.propertySearchService.disconnect();
      await this.appointmentBookingService.disconnect();
      await this.enhancedPropertyResponseService.cleanup();
      logWithTimestamp('AI Response Generator cleanup completed', 'info');
    } catch (error: any) {
      logWithTimestamp(`Cleanup error: ${error.message}`, 'error');
    }
  }
}

/**
 * Main function for backward compatibility
 * الدالة الرئيسية للتوافق مع الإصدارات السابقة
 */
export async function generateAIResponse(
  userMessage: string,
  language: string = 'ar',
  clientPhone?: string
): Promise<AIResponse> {
  const generator = new AIResponseGenerator();

  try {
    // Auto-detect language if not provided or if 'en' is passed
    if (!language || language === 'en') {
      language = detectLanguage(userMessage);
    }

    const response = await generator.generateResponse(userMessage, language, clientPhone);
    return response;
  } finally {
    await generator.cleanup();
  }
}
