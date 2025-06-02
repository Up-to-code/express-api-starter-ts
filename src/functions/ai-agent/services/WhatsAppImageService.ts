/**
 * إتجاه العقارية (Etjahh Real Estate) - WhatsApp Image Service
 * خدمة إرسال الصور عبر واتساب لشركة إتجاه العقارية
 */

import { logWithTimestamp } from '../../../utils/logger';
import { WhatsAppMediaMessage, PropertyWithScore } from '../types/AITypes';

/**
 * WhatsApp Image Service Class
 * فئة خدمة إرسال الصور عبر واتساب
 */
export class WhatsAppImageService {
  private accessToken: string;
  private apiUrl: string;

  constructor() {
    this.accessToken = process.env.WHATSAPP_ACCESS_TOKEN || '';
    this.apiUrl = process.env.WHATSAPP_API_URL || '';
    
    if (!this.accessToken || !this.apiUrl) {
      logWithTimestamp('WhatsApp credentials not configured for image service', 'error');
    }
  }

  /**
   * Send single image via WhatsApp
   * إرسال صورة واحدة عبر واتساب
   */
  async sendImage(to: string, imageUrl: string, caption?: string): Promise<boolean> {
    try {
      if (!this.accessToken || !this.apiUrl) {
        logWithTimestamp('WhatsApp credentials not configured', 'error');
        return false;
      }

      const messageData: WhatsAppMediaMessage = {
        messaging_product: "whatsapp",
        to: to,
        type: "image",
        image: {
          link: imageUrl,
          caption: caption
        }
      };

      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(messageData)
      });

      if (response.ok) {
        logWithTimestamp(`Image sent successfully to ${to}`, 'info');
        return true;
      } else {
        const errorData = await response.text();
        logWithTimestamp(`Failed to send image: ${errorData}`, 'error');
        return false;
      }
    } catch (error: any) {
      logWithTimestamp(`Error sending WhatsApp image: ${error.message}`, 'error');
      return false;
    }
  }

  /**
   * Send multiple property images with captions
   * إرسال صور متعددة للعقار مع التسميات التوضيحية
   */
  async sendPropertyImages(
    to: string, 
    property: PropertyWithScore, 
    language: string = 'ar'
  ): Promise<boolean> {
    try {
      if (!property.images || property.images.length === 0) {
        logWithTimestamp(`No images available for property ${property.id}`, 'info');
        return false;
      }

      const maxImages = 3; // Limit to 3 images to avoid spam
      const imagesToSend = property.images.slice(0, maxImages);
      
      for (let i = 0; i < imagesToSend.length; i++) {
        const imageUrl = imagesToSend[i];
        
        // Create caption for each image
        const caption = this.createImageCaption(property, i + 1, imagesToSend.length, language);

        // Send image with delay between sends
        const success = await this.sendImage(to, imageUrl, caption);
        
        if (!success) {
          logWithTimestamp(`Failed to send image ${i + 1} for property ${property.id}`, 'error');
        }
        
        // Add delay between image sends to avoid rate limiting
        if (i < imagesToSend.length - 1) {
          await this.delay(1000);
        }
      }

      return true;
    } catch (error: any) {
      logWithTimestamp(`Error sending property images: ${error.message}`, 'error');
      return false;
    }
  }

  /**
   * Create image caption for property
   * إنشاء تسمية توضيحية لصورة العقار
   */
  private createImageCaption(
    property: PropertyWithScore, 
    imageNumber: number, 
    totalImages: number, 
    language: string
  ): string {
    const propertyId = property.id.slice(-8).toUpperCase();
    const price = this.formatPrice(property.price, property.currency, language);
    
    if (language === 'ar') {
      return `📸 صورة ${imageNumber} من ${totalImages} - ${property.titleAr || property.title}
🆔 رقم العقار: ${propertyId}
💰 ${price}
📍 ${property.cityAr || property.city}

*شركة إتجاه العقارية* 🏢`;
    } else {
      return `📸 Image ${imageNumber} of ${totalImages} - ${property.title}
🆔 Property ID: ${propertyId}
💰 ${price}
📍 ${property.city}

*Etjahh Real Estate Company* 🏢`;
    }
  }

  /**
   * Format price with currency
   * تنسيق السعر مع العملة
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
      // Fallback formatting
      return `${price.toLocaleString()} ${currency}`;
    }
  }

  /**
   * Delay utility function
   * دالة التأخير المساعدة
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Validate image URL
   * التحقق من صحة رابط الصورة
   */
  private isValidImageUrl(url: string): boolean {
    try {
      const urlObj = new URL(url);
      const validExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
      const pathname = urlObj.pathname.toLowerCase();
      return validExtensions.some(ext => pathname.endsWith(ext));
    } catch {
      return false;
    }
  }

  /**
   * Send property gallery with validation
   * إرسال معرض العقار مع التحقق
   */
  async sendPropertyGallery(
    to: string, 
    property: PropertyWithScore, 
    language: string = 'ar',
    maxImages: number = 3
  ): Promise<{ success: boolean; sentCount: number; errors: string[] }> {
    const result = {
      success: false,
      sentCount: 0,
      errors: [] as string[]
    };

    try {
      if (!property.images || property.images.length === 0) {
        result.errors.push('No images available for property');
        return result;
      }

      // Filter valid image URLs
      const validImages = property.images
        .filter(url => this.isValidImageUrl(url))
        .slice(0, maxImages);

      if (validImages.length === 0) {
        result.errors.push('No valid image URLs found');
        return result;
      }

      for (let i = 0; i < validImages.length; i++) {
        const imageUrl = validImages[i];
        const caption = this.createImageCaption(property, i + 1, validImages.length, language);

        try {
          const success = await this.sendImage(to, imageUrl, caption);
          
          if (success) {
            result.sentCount++;
          } else {
            result.errors.push(`Failed to send image ${i + 1}`);
          }
        } catch (error: any) {
          result.errors.push(`Error sending image ${i + 1}: ${error.message}`);
        }

        // Rate limiting delay
        if (i < validImages.length - 1) {
          await this.delay(1000);
        }
      }

      result.success = result.sentCount > 0;
      
      logWithTimestamp(
        `Property gallery sent: ${result.sentCount}/${validImages.length} images for property ${property.id}`,
        'info'
      );

      return result;
    } catch (error: any) {
      result.errors.push(`Gallery sending error: ${error.message}`);
      logWithTimestamp(`Error sending property gallery: ${error.message}`, 'error');
      return result;
    }
  }

  /**
   * Check service configuration
   * فحص تكوين الخدمة
   */
  isConfigured(): boolean {
    return !!(this.accessToken && this.apiUrl);
  }

  /**
   * Get service status
   * الحصول على حالة الخدمة
   */
  getStatus(): { configured: boolean; accessToken: boolean; apiUrl: boolean } {
    return {
      configured: this.isConfigured(),
      accessToken: !!this.accessToken,
      apiUrl: !!this.apiUrl
    };
  }
}
