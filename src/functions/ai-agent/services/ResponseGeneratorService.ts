/**
 * إتجاه العقارية (Etjahh Real Estate) - Response Generator Service
 * خدمة توليد الاستجابات لشركة إتجاه العقارية
 */

import { logWithTimestamp } from '../../../utils/logger';
import { 
  PropertyWithScore, 
  PropertySearchResult,
  PROPERTY_TYPE_MAPPING,
  PROPERTY_STATUS_MAPPING
} from '../types/AITypes';

/**
 * Response Generator Service Class
 * فئة خدمة توليد الاستجابات
 */
export class ResponseGeneratorService {

  /**
   * Generate comprehensive property search response
   * توليد استجابة شاملة لبحث العقارات
   */
  generatePropertySearchResponse(
    searchResults: PropertySearchResult,
    language: string = 'ar'
  ): string {
    if (!searchResults.properties || searchResults.properties.length === 0) {
      return this.generateNoResultsResponse(language);
    }

    const properties = searchResults.properties.slice(0, 3); // Limit to top 3
    
    let response = language === 'ar'
      ? `🏠 *وجدت ${properties.length} عقار مناسب لطلبك من شركة إتجاه العقارية:*\n\n`
      : `🏠 *Found ${properties.length} properties matching your request from Etjahh Real Estate:*\n\n`;

    properties.forEach((property, index) => {
      response += this.generateSinglePropertyResponse(property, index + 1, language);
      if (index < properties.length - 1) {
        response += '\n';
      }
    });

    response += language === 'ar'
      ? `\n📞 للمزيد من التفاصيل أو لحجز موعد معاينة، تواصل معنا!\n\n*شركة إتجاه العقارية* 🏢`
      : `\n📞 For more details or to book a viewing appointment, contact us!\n\n*Etjahh Real Estate Company* 🏢`;

    return response;
  }

  /**
   * Generate single property response
   * توليد استجابة عقار واحد
   */
  private generateSinglePropertyResponse(
    property: PropertyWithScore,
    index: number,
    language: string
  ): string {
    const propertyId = property.id.slice(-8).toUpperCase();
    const price = this.formatPrice(property.price, property.currency, language);

    if (language === 'ar') {
      let response = `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
      response += `*${index}. ${property.titleAr || property.title}*\n`;
      response += `🆔 رقم العقار: ${propertyId}\n\n`;

      // Basic Information
      response += `💰 *السعر:* ${price}\n`;
      response += `📍 *الموقع:* ${property.cityAr || property.city}${property.countryAr ? `, ${property.countryAr}` : ''}\n`;
      response += `🏠 *نوع العقار:* ${this.getPropertyTypeArabic(property.type)}\n`;
      response += `📊 *الحالة:* ${this.getPropertyStatusArabic(property.status)}\n\n`;

      // Property Specifications
      response += `📋 *مواصفات العقار:*\n`;
      response += `🛏️ غرف النوم: ${property.bedrooms || 'غير محدد'}\n`;
      response += `🚿 دورات المياه: ${property.bathrooms || 'غير محدد'}\n`;
      response += `📐 المساحة: ${property.area ? property.area + ' متر مربع' : 'غير محدد'}\n`;
      response += `🏗️ سنة البناء: ${property.yearBuilt || 'غير محدد'}\n`;
      response += `🚗 مواقف السيارات: ${property.parking || 'غير محدد'}\n`;
      response += `🪑 مفروش: ${property.furnished ? 'نعم' : 'لا'}\n`;
      response += `🐕 يسمح بالحيوانات: ${property.petFriendly ? 'نعم' : 'لا'}\n\n`;

      // Features & Amenities
      if (property.featuresAr && property.featuresAr.length > 0) {
        response += `✨ *المميزات:*\n`;
        property.featuresAr.slice(0, 5).forEach((feature: string) => {
          response += `• ${feature}\n`;
        });
        if (property.featuresAr.length > 5) {
          response += `• وأكثر من ${property.featuresAr.length - 5} مميزات أخرى...\n`;
        }
        response += `\n`;
      }

      if (property.amenitiesAr && property.amenitiesAr.length > 0) {
        response += `🏢 *المرافق:*\n`;
        property.amenitiesAr.slice(0, 4).forEach((amenity: string) => {
          response += `• ${amenity}\n`;
        });
        if (property.amenitiesAr.length > 4) {
          response += `• وأكثر من ${property.amenitiesAr.length - 4} مرافق أخرى...\n`;
        }
        response += `\n`;
      }

      // Description
      if (property.descriptionAr || property.description) {
        const description = (property.descriptionAr || property.description).substring(0, 150);
        response += `📝 *الوصف:*\n${description}${description.length >= 150 ? '...' : ''}\n\n`;
      }

      // Address
      if (property.addressAr || property.address) {
        response += `📮 *العنوان:* ${property.addressAr || property.address}\n`;
      }

      // Images
      if (property.images && property.images.length > 0) {
        response += `📸 *الصور:* ${property.images.length} صورة متاحة\n`;
      }

      // Match Score (if available)
      if (property.matchScore && property.matchScore > 0) {
        response += `🎯 *نقاط المطابقة:* ${property.matchScore}/100\n`;
        if (property.matchReasons && property.matchReasons.length > 0) {
          response += `✅ *أسباب المطابقة:* ${property.matchReasons.join(', ')}\n`;
        }
      }

      // Contact Information
      response += `\n📞 *للاستفسار والمعاينة:*\n`;
      response += `• اتصل بنا لحجز موعد معاينة\n`;
      response += `• رقم العقار للمراجعة: ${propertyId}\n`;
      response += `• وقت الاستجابة: خلال ساعة واحدة\n\n`;

      return response;
    } else {
      let response = `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
      response += `*${index}. ${property.title}*\n`;
      response += `🆔 Property ID: ${propertyId}\n\n`;

      // Basic Information
      response += `💰 *Price:* ${price}\n`;
      response += `📍 *Location:* ${property.city}${property.country ? `, ${property.country}` : ''}\n`;
      response += `🏠 *Property Type:* ${property.type}\n`;
      response += `📊 *Status:* ${property.status}\n\n`;

      // Property Specifications
      response += `📋 *Property Specifications:*\n`;
      response += `🛏️ Bedrooms: ${property.bedrooms || 'Not specified'}\n`;
      response += `🚿 Bathrooms: ${property.bathrooms || 'Not specified'}\n`;
      response += `📐 Area: ${property.area ? property.area + ' sqm' : 'Not specified'}\n`;
      response += `🏗️ Year Built: ${property.yearBuilt || 'Not specified'}\n`;
      response += `🚗 Parking: ${property.parking || 'Not specified'}\n`;
      response += `🪑 Furnished: ${property.furnished ? 'Yes' : 'No'}\n`;
      response += `🐕 Pet Friendly: ${property.petFriendly ? 'Yes' : 'No'}\n\n`;

      // Features & Amenities
      if (property.features && property.features.length > 0) {
        response += `✨ *Features:*\n`;
        property.features.slice(0, 5).forEach((feature: string) => {
          response += `• ${feature}\n`;
        });
        if (property.features.length > 5) {
          response += `• Plus ${property.features.length - 5} more features...\n`;
        }
        response += `\n`;
      }

      if (property.amenities && property.amenities.length > 0) {
        response += `🏢 *Amenities:*\n`;
        property.amenities.slice(0, 4).forEach((amenity: string) => {
          response += `• ${amenity}\n`;
        });
        if (property.amenities.length > 4) {
          response += `• Plus ${property.amenities.length - 4} more amenities...\n`;
        }
        response += `\n`;
      }

      // Description
      if (property.description) {
        const description = property.description.substring(0, 150);
        response += `📝 *Description:*\n${description}${description.length >= 150 ? '...' : ''}\n\n`;
      }

      // Address
      if (property.address) {
        response += `📮 *Address:* ${property.address}\n`;
      }

      // Images
      if (property.images && property.images.length > 0) {
        response += `📸 *Images:* ${property.images.length} photos available\n`;
      }

      // Match Score (if available)
      if (property.matchScore && property.matchScore > 0) {
        response += `🎯 *Match Score:* ${property.matchScore}/100\n`;
        if (property.matchReasons && property.matchReasons.length > 0) {
          response += `✅ *Match Reasons:* ${property.matchReasons.join(', ')}\n`;
        }
      }

      // Contact Information
      response += `\n📞 *For Inquiry & Viewing:*\n`;
      response += `• Contact us to schedule a viewing\n`;
      response += `• Property Reference: ${propertyId}\n`;
      response += `• Response Time: Within 1 hour\n\n`;

      return response;
    }
  }

  /**
   * Generate no results response
   * توليد استجابة عدم وجود نتائج
   */
  private generateNoResultsResponse(language: string): string {
    return language === 'ar'
      ? `عذراً، لم أجد عقارات تطابق معاييرك الحالية.\n\n` +
        `💡 يمكنني مساعدتك في:\n` +
        `• توسيع نطاق البحث\n` +
        `• اقتراح عقارات مشابهة\n` +
        `• تسجيل طلبك للبحث المستقبلي\n\n` +
        `هل تريد تعديل معايير البحث؟\n\n` +
        `*شركة إتجاه العقارية* 🏢`
      : `Sorry, I couldn't find properties matching your current criteria.\n\n` +
        `💡 I can help you with:\n` +
        `• Expanding the search criteria\n` +
        `• Suggesting similar properties\n` +
        `• Registering your request for future searches\n\n` +
        `Would you like to modify the search criteria?\n\n` +
        `*Etjahh Real Estate Company* 🏢`;
  }

  /**
   * Generate rule-based responses for common queries
   * توليد استجابات قائمة على القواعد للاستفسارات الشائعة
   */
  generateRuleBasedResponse(userMessage: string, language: string): string | null {
    const message = userMessage.toLowerCase();

    // Price inquiries
    if (message.includes('price') || message.includes('cost') || message.includes('سعر') || message.includes('تكلفة')) {
      return language === 'ar'
        ? `مرحباً بك في *شركة إتجاه العقارية* 🏢

أفهم أنك تسأل عن الأسعار. في إتجاه العقارية، نقدم أسعار تنافسية تختلف حسب:

📍 *الموقع*: الرياض، جدة، الدمام، مكة، المدينة
📐 *المساحة*: من 100 إلى 1000+ متر مربع
🏠 *نوع العقار*: شقق، فيلل، تاون هاوس، أراضي، مكاتب
💎 *مستوى التشطيب*: عادي، فاخر، سوبر لوكس
🎯 *الغرض*: سكني، تجاري، استثماري

💡 *للحصول على تقييم دقيق، أخبرني:*
• الموقع المطلوب؟
• المساحة المطلوبة؟
• نوع العقار؟
• الميزانية التقريبية؟
• الغرض من الشراء؟

*إتجاه العقارية - شريكك الموثوق في العقارات* 🏠✨`
        : `Welcome to *Etjahh Real Estate Company* 🏢

I understand you're asking about pricing. At Etjahh Real Estate, we offer competitive prices that vary based on:

📍 *Location*: Riyadh, Jeddah, Dammam, Mecca, Medina
📐 *Size*: From 100 to 1000+ sqm
🏠 *Property Type*: Apartments, Villas, Townhouses, Land, Offices
💎 *Finishing Level*: Standard, Luxury, Super Luxury
🎯 *Purpose*: Residential, Commercial, Investment

💡 *For an accurate estimate, tell me:*
• Preferred location?
• Required size?
• Property type?
• Approximate budget?
• Purchase purpose?

*Etjahh Real Estate - Your Trusted Real Estate Partner* 🏠✨`;
    }

    // Appointment inquiries
    if (message.includes('appointment') || message.includes('meeting') || message.includes('موعد') || message.includes('اجتماع')) {
      return language === 'ar'
        ? `بالطبع! يمكنني مساعدتك في حجز موعد.

📅 متى يناسبك؟
⏰ أوقاتنا المتاحة:
   • الأحد - الخميس: 9 صباحاً - 6 مساءً
   • السبت: 10 صباحاً - 4 مساءً

🏢 يمكن أن يكون الموعد:
   • في مكتبنا
   • في موقع العقار
   • عبر الفيديو

ما الذي تفضل؟

*شركة إتجاه العقارية* 🏢`
        : `Of course! I can help you schedule an appointment.

📅 When would be convenient for you?
⏰ Our available hours:
   • Sunday - Thursday: 9 AM - 6 PM
   • Saturday: 10 AM - 4 PM

🏢 The appointment can be:
   • At our office
   • At the property location
   • Via video call

What would you prefer?

*Etjahh Real Estate Company* 🏢`;
    }

    return null; // No rule-based response found
  }

  /**
   * Helper methods
   */
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
    return PROPERTY_TYPE_MAPPING[type] || type;
  }

  private getPropertyStatusArabic(status: string): string {
    return PROPERTY_STATUS_MAPPING[status] || status;
  }
}
