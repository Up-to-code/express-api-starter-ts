/**
 * Enhanced Property Response Service for إتجاه العقارية (Etjahh Real Estate)
 * خدمة الاستجابة العقارية المحسنة لشركة إتجاه العقارية
 * 
 * Combines property search, detailed information, and image sending
 * in a single comprehensive WhatsApp message experience.
 */

import { logWithTimestamp } from '../../../utils/logger';
import { PropertySearchService } from './PropertySearchService';
import { WhatsAppImageService } from './WhatsAppImageService';
import { EnhancedWhatsAppService } from '../../../services/EnhancedWhatsAppService';
import { PropertyWithScore, PropertySearchResult } from '../types/AITypes';

export interface PropertyResponseOptions {
  clientPhone: string;
  userMessage: string;
  language: string;
  includeImages: boolean;
  maxProperties: number;
  maxImagesPerProperty: number;
}

export interface PropertyResponseResult {
  success: boolean;
  propertiesFound: number;
  messagesSent: number;
  imagesSent: number;
  searchResult?: PropertySearchResult;
  error?: string;
  processingTime: number;
}

export class EnhancedPropertyResponseService {
  private propertySearchService: PropertySearchService;
  private whatsappImageService: WhatsAppImageService;

  constructor() {
    this.propertySearchService = new PropertySearchService();
    this.whatsappImageService = new WhatsAppImageService();
  }

  /**
   * Send comprehensive property response with text and images
   * إرسال استجابة عقارية شاملة مع النص والصور
   */
  async sendPropertyResponse(options: PropertyResponseOptions): Promise<PropertyResponseResult> {
    const startTime = Date.now();
    
    try {
      const {
        clientPhone,
        userMessage,
        language,
        includeImages = true,
        maxProperties = 3,
        maxImagesPerProperty = 2
      } = options;

      logWithTimestamp(
        `🏠 Starting enhanced property response for: ${userMessage}`,
        'info'
      );

      // Extract search criteria and search for properties
      const searchCriteria = this.propertySearchService.extractSearchCriteria(userMessage, language);
      
      if (!searchCriteria) {
        return {
          success: false,
          propertiesFound: 0,
          messagesSent: 0,
          imagesSent: 0,
          error: 'No property search criteria found',
          processingTime: Date.now() - startTime
        };
      }

      // Perform property search
      const searchResult = await this.propertySearchService.searchProperties(searchCriteria.criteria);
      
      if (searchResult.properties.length === 0) {
        // Send "no results" message
        const noResultsMessage = this.generateNoResultsMessage(searchCriteria.criteria, language);
        
        await EnhancedWhatsAppService.sendMessage({
          to: clientPhone,
          text: noResultsMessage,
          responseSource: 'Enhanced Property Search - No Results',
          priority: 'normal'
        });

        return {
          success: true,
          propertiesFound: 0,
          messagesSent: 1,
          imagesSent: 0,
          searchResult,
          processingTime: Date.now() - startTime
        };
      }

      // Limit properties to send
      const propertiesToSend = searchResult.properties.slice(0, maxProperties);
      let totalMessagesSent = 0;
      let totalImagesSent = 0;

      // Send introduction message
      const introMessage = this.generateIntroMessage(searchResult, language);
      await EnhancedWhatsAppService.sendMessage({
        to: clientPhone,
        text: introMessage,
        responseSource: 'Enhanced Property Search - Intro',
        priority: 'high'
      });
      totalMessagesSent++;

      // Send each property with details and images
      for (let i = 0; i < propertiesToSend.length; i++) {
        const property = propertiesToSend[i];
        
        // Send detailed property information
        const propertyMessage = this.generateDetailedPropertyMessage(property, i + 1, language);
        
        await EnhancedWhatsAppService.sendMessage({
          to: clientPhone,
          text: propertyMessage,
          responseSource: `Enhanced Property Search - Property ${i + 1}`,
          priority: 'high'
        });
        totalMessagesSent++;

        // Send property images if available and requested
        if (includeImages && property.images && property.images.length > 0) {
          const imageResult = await this.whatsappImageService.sendPropertyGallery(
            clientPhone,
            property,
            language,
            maxImagesPerProperty
          );
          
          totalImagesSent += imageResult.sentCount;
          
          if (imageResult.errors.length > 0) {
            logWithTimestamp(
              `⚠️ Some images failed to send for property ${property.id}: ${imageResult.errors.join(', ')}`,
              'warning'
            );
          }
        }

        // Add delay between properties to avoid overwhelming the user
        if (i < propertiesToSend.length - 1) {
          await this.delay(2000);
        }
      }

      // Send conclusion message with next steps
      const conclusionMessage = this.generateConclusionMessage(propertiesToSend.length, language);
      await EnhancedWhatsAppService.sendMessage({
        to: clientPhone,
        text: conclusionMessage,
        responseSource: 'Enhanced Property Search - Conclusion',
        priority: 'normal'
      });
      totalMessagesSent++;

      const processingTime = Date.now() - startTime;

      logWithTimestamp(
        `✅ Enhanced property response completed: ${propertiesToSend.length} properties, ${totalMessagesSent} messages, ${totalImagesSent} images in ${processingTime}ms`,
        'success'
      );

      return {
        success: true,
        propertiesFound: searchResult.properties.length,
        messagesSent: totalMessagesSent,
        imagesSent: totalImagesSent,
        searchResult,
        processingTime
      };

    } catch (error: any) {
      logWithTimestamp(
        `❌ Enhanced property response error: ${error.message}`,
        'error'
      );

      return {
        success: false,
        propertiesFound: 0,
        messagesSent: 0,
        imagesSent: 0,
        error: error.message,
        processingTime: Date.now() - startTime
      };
    }
  }

  /**
   * Generate introduction message for search results
   * توليد رسالة تمهيدية لنتائج البحث
   */
  private generateIntroMessage(searchResult: PropertySearchResult, language: string): string {
    const { properties, total, searchStrategy } = searchResult;
    
    if (language === 'ar') {
      return `🏠 *نتائج البحث العقاري - شركة إتجاه العقارية*

🎯 تم العثور على *${total}* عقار مطابق لمعاييرك
📊 استراتيجية البحث: ${this.getSearchStrategyArabic(searchStrategy)}
⭐ عرض أفضل *${Math.min(properties.length, 3)}* عقارات

سأرسل لك تفاصيل كل عقار مع الصور...`;
    } else {
      return `🏠 *Property Search Results - Etjahh Real Estate*

🎯 Found *${total}* properties matching your criteria
📊 Search Strategy: ${searchStrategy}
⭐ Showing top *${Math.min(properties.length, 3)}* properties

I'll send you details for each property with images...`;
    }
  }

  /**
   * Generate detailed property message with all information
   * توليد رسالة مفصلة للعقار مع جميع المعلومات
   */
  private generateDetailedPropertyMessage(property: PropertyWithScore, index: number, language: string): string {
    const propertyId = property.id.slice(-8).toUpperCase();
    const price = this.formatPrice(property.price, property.currency, language);
    const matchScore = property.matchScore || 0;
    const matchReasons = property.matchReasons || [];

    if (language === 'ar') {
      return `🏢 *العقار رقم ${index}*

📋 *التفاصيل الأساسية:*
🆔 رقم العقار: ${propertyId}
🏠 ${property.titleAr || property.title}
💰 السعر: ${price}
📍 الموقع: ${property.cityAr || property.city}${property.locationAr ? ` - ${property.locationAr}` : ''}

🏗️ *المواصفات:*
🛏️ غرف النوم: ${property.bedrooms || 'غير محدد'}
🚿 دورات المياه: ${property.bathrooms || 'غير محدد'}
📐 المساحة: ${property.area ? `${property.area} متر مربع` : 'غير محدد'}
🏠 نوع العقار: ${this.getPropertyTypeArabic(property.type)}
${property.furnished ? '✅ مفروش' : '❌ غير مفروش'}
${property.parking ? `🚗 مواقف سيارات: ${property.parking}` : ''}

${property.descriptionAr || property.description ? `📝 *الوصف:*\n${property.descriptionAr || property.description}\n` : ''}

⭐ *نقاط التطابق:* ${matchScore}/100
${matchReasons.length > 0 ? `✅ ${matchReasons.join('\n✅ ')}` : ''}

${property.agent ? `👨‍💼 *المسؤول:* ${property.agent.name}\n📧 ${property.agent.email}` : ''}

*شركة إتجاه العقارية* 🏢
📞 للاستفسار أو حجز موعد معاينة`;
    } else {
      return `🏢 *Property ${index}*

📋 *Basic Details:*
🆔 Property ID: ${propertyId}
🏠 ${property.title}
💰 Price: ${price}
📍 Location: ${property.city}${property.location ? ` - ${property.location}` : ''}

🏗️ *Specifications:*
🛏️ Bedrooms: ${property.bedrooms || 'Not specified'}
🚿 Bathrooms: ${property.bathrooms || 'Not specified'}
📐 Area: ${property.area ? `${property.area} sqm` : 'Not specified'}
🏠 Property Type: ${property.type}
${property.furnished ? '✅ Furnished' : '❌ Unfurnished'}
${property.parking ? `🚗 Parking: ${property.parking}` : ''}

${property.description ? `📝 *Description:*\n${property.description}\n` : ''}

⭐ *Match Score:* ${matchScore}/100
${matchReasons.length > 0 ? `✅ ${matchReasons.join('\n✅ ')}` : ''}

${property.agent ? `👨‍💼 *Agent:* ${property.agent.name}\n📧 ${property.agent.email}` : ''}

*Etjahh Real Estate Company* 🏢
📞 For inquiries or viewing appointments`;
    }
  }

  /**
   * Generate conclusion message with next steps
   * توليد رسالة ختامية مع الخطوات التالية
   */
  private generateConclusionMessage(propertiesCount: number, language: string): string {
    if (language === 'ar') {
      return `✨ *تم عرض ${propertiesCount} عقارات مختارة لك*

🎯 *الخطوات التالية:*
📞 للاستفسار عن أي عقار، اذكر رقم العقار
📅 لحجز موعد معاينة، قل "أريد حجز موعد"
🔍 للبحث عن عقارات أخرى، أرسل معايير جديدة
💬 لأي استفسار، تواصل معنا مباشرة

*شركة إتجاه العقارية - شريكك الموثوق في العقارات* 🏢✨`;
    } else {
      return `✨ *Showed ${propertiesCount} selected properties for you*

🎯 *Next Steps:*
📞 To inquire about any property, mention the property ID
📅 To book a viewing appointment, say "I want to book an appointment"
🔍 To search for other properties, send new criteria
💬 For any questions, contact us directly

*Etjahh Real Estate Company - Your Trusted Real Estate Partner* 🏢✨`;
    }
  }

  /**
   * Generate no results message
   * توليد رسالة عدم وجود نتائج
   */
  private generateNoResultsMessage(criteria: any, language: string): string {
    if (language === 'ar') {
      return `😔 *لم نجد عقارات مطابقة لمعاييرك*

🔍 *معايير البحث:*
${criteria.city ? `📍 المدينة: ${criteria.city}` : ''}
${criteria.property_type ? `🏠 نوع العقار: ${this.getPropertyTypeArabic(criteria.property_type)}` : ''}
${criteria.bedrooms ? `🛏️ غرف النوم: ${criteria.bedrooms}` : ''}
${criteria.price_range ? `💰 النطاق السعري: ${criteria.price_range.min} - ${criteria.price_range.max}` : ''}

💡 *اقتراحات:*
• جرب توسيع نطاق البحث
• قلل من المعايير المحددة
• ابحث في مدن أخرى
• تواصل معنا للمساعدة الشخصية

*شركة إتجاه العقارية* 🏢
📞 نحن هنا لمساعدتك في العثور على العقار المثالي`;
    } else {
      return `😔 *No properties found matching your criteria*

🔍 *Search Criteria:*
${criteria.city ? `📍 City: ${criteria.city}` : ''}
${criteria.property_type ? `🏠 Property Type: ${criteria.property_type}` : ''}
${criteria.bedrooms ? `🛏️ Bedrooms: ${criteria.bedrooms}` : ''}
${criteria.price_range ? `💰 Price Range: ${criteria.price_range.min} - ${criteria.price_range.max}` : ''}

💡 *Suggestions:*
• Try expanding your search criteria
• Reduce specific requirements
• Search in other cities
• Contact us for personal assistance

*Etjahh Real Estate Company* 🏢
📞 We're here to help you find the perfect property`;
    }
  }

  // Helper methods
  private formatPrice(price: number, currency: string = 'SAR', language: string): string {
    try {
      const locale = language === 'ar' ? 'ar-SA' : 'en-US';
      return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 0,
      }).format(price);
    } catch (error) {
      return `${price.toLocaleString()} ${currency}`;
    }
  }

  private getPropertyTypeArabic(type: string): string {
    const types: { [key: string]: string } = {
      'VILLA': 'فيلا',
      'APARTMENT': 'شقة',
      'TOWNHOUSE': 'تاون هاوس',
      'STUDIO': 'استوديو',
      'DUPLEX': 'دوبلكس',
      'PENTHOUSE': 'بنتهاوس'
    };
    return types[type] || type;
  }

  private getSearchStrategyArabic(strategy: string): string {
    const strategies: { [key: string]: string } = {
      'direct_match': 'مطابقة مباشرة',
      'fallback_search': 'بحث موسع',
      'scored_ranking': 'ترتيب بالنقاط'
    };
    return strategies[strategy] || strategy;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Cleanup resources
   * تنظيف الموارد
   */
  async cleanup(): Promise<void> {
    await this.propertySearchService.disconnect();
  }
}

export default EnhancedPropertyResponseService;
