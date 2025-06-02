/**
 * إتجاه العقارية (Etjahh Real Estate) - Validation Utilities
 * أدوات التحقق لشركة إتجاه العقارية
 */

import { PropertySearchCriteria, WhatsAppConfig, OpenAIConfig } from '../types/AITypes';

/**
 * Validation Utilities Class
 * فئة أدوات التحقق
 */
export class ValidationUtils {

  /**
   * Validate property search criteria
   * التحقق من معايير البحث العقاري
   */
  static validateSearchCriteria(criteria: PropertySearchCriteria['criteria']): {
    isValid: boolean;
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Validate bedrooms
    if (criteria.bedrooms !== undefined) {
      if (criteria.bedrooms < 0 || criteria.bedrooms > 20) {
        errors.push('عدد غرف النوم يجب أن يكون بين 0 و 20');
      }
    }

    // Validate bathrooms
    if (criteria.bathrooms !== undefined) {
      if (criteria.bathrooms < 0 || criteria.bathrooms > 20) {
        errors.push('عدد دورات المياه يجب أن يكون بين 0 و 20');
      }
    }

    // Validate area
    if (criteria.area !== undefined) {
      if (criteria.area < 10 || criteria.area > 10000) {
        errors.push('المساحة يجب أن تكون بين 10 و 10000 متر مربع');
      }
    }

    // Validate price range
    if (criteria.price_range) {
      if (criteria.price_range.min < 0) {
        errors.push('الحد الأدنى للسعر لا يمكن أن يكون سالباً');
      }
      if (criteria.price_range.max < criteria.price_range.min) {
        errors.push('الحد الأقصى للسعر يجب أن يكون أكبر من الحد الأدنى');
      }
      if (criteria.price_range.max > 100000000) {
        warnings.push('السعر المطلوب مرتفع جداً، قد لا توجد نتائج');
      }
    }

    // Validate property type
    const validTypes = ['APARTMENT', 'VILLA', 'TOWNHOUSE', 'PENTHOUSE', 'STUDIO', 'OFFICE', 'SHOP', 'WAREHOUSE', 'LAND', 'BUILDING'];
    if (criteria.property_type && !validTypes.includes(criteria.property_type)) {
      errors.push(`نوع العقار غير صحيح. الأنواع المتاحة: ${validTypes.join(', ')}`);
    }

    // Validate features
    if (criteria.features && criteria.features.length > 10) {
      warnings.push('عدد كبير من المميزات المطلوبة، قد يقلل من النتائج');
    }

    // Check if criteria is too restrictive
    const criteriaCount = Object.keys(criteria).filter(key => criteria[key as keyof typeof criteria] !== undefined).length;
    if (criteriaCount > 6) {
      warnings.push('معايير البحث مقيدة جداً، قد تحتاج لتوسيع البحث');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Validate phone number format
   * التحقق من تنسيق رقم الهاتف
   */
  static validatePhoneNumber(phone: string): {
    isValid: boolean;
    formatted: string;
    errors: string[];
  } {
    const errors: string[] = [];
    let formatted = phone;

    // Remove all non-digit characters
    const digitsOnly = phone.replace(/\D/g, '');

    // Check if it's a Saudi number
    if (digitsOnly.startsWith('966')) {
      // International format
      if (digitsOnly.length === 12) {
        formatted = `+${digitsOnly}`;
      } else {
        errors.push('رقم الهاتف السعودي الدولي يجب أن يكون 12 رقماً');
      }
    } else if (digitsOnly.startsWith('05')) {
      // Local Saudi format
      if (digitsOnly.length === 10) {
        formatted = `+966${digitsOnly.substring(1)}`;
      } else {
        errors.push('رقم الهاتف السعودي المحلي يجب أن يكون 10 أرقام');
      }
    } else if (digitsOnly.startsWith('5')) {
      // Local without leading zero
      if (digitsOnly.length === 9) {
        formatted = `+966${digitsOnly}`;
      } else {
        errors.push('رقم الهاتف غير صحيح');
      }
    } else {
      errors.push('رقم الهاتف يجب أن يكون سعودياً');
    }

    return {
      isValid: errors.length === 0,
      formatted,
      errors
    };
  }

  /**
   * Validate WhatsApp configuration
   * التحقق من تكوين واتساب
   */
  static validateWhatsAppConfig(config: Partial<WhatsAppConfig>): {
    isValid: boolean;
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!config.accessToken) {
      errors.push('رمز الوصول لواتساب مطلوب');
    } else if (config.accessToken.length < 50) {
      warnings.push('رمز الوصول لواتساب قصير جداً');
    }

    if (!config.apiUrl) {
      errors.push('رابط API لواتساب مطلوب');
    } else if (!config.apiUrl.startsWith('https://')) {
      errors.push('رابط API يجب أن يبدأ بـ https://');
    }

    if (!config.phoneNumberId) {
      errors.push('معرف رقم الهاتف مطلوب');
    }

    if (!config.verifyToken) {
      warnings.push('رمز التحقق غير موجود');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Validate OpenAI configuration
   * التحقق من تكوين OpenAI
   */
  static validateOpenAIConfig(config: Partial<OpenAIConfig>): {
    isValid: boolean;
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!config.apiKey) {
      errors.push('مفتاح OpenAI API مطلوب');
    } else if (!config.apiKey.startsWith('sk-')) {
      errors.push('مفتاح OpenAI API غير صحيح');
    }

    if (!config.model) {
      warnings.push('نموذج OpenAI غير محدد، سيتم استخدام النموذج الافتراضي');
    }

    if (config.maxTokens !== undefined) {
      if (config.maxTokens < 10 || config.maxTokens > 4000) {
        warnings.push('عدد الرموز المميزة يجب أن يكون بين 10 و 4000');
      }
    }

    if (config.temperature !== undefined) {
      if (config.temperature < 0 || config.temperature > 2) {
        warnings.push('درجة الحرارة يجب أن تكون بين 0 و 2');
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Validate image URL
   * التحقق من رابط الصورة
   */
  static validateImageUrl(url: string): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    try {
      const urlObj = new URL(url);
      
      if (!['http:', 'https:'].includes(urlObj.protocol)) {
        errors.push('رابط الصورة يجب أن يبدأ بـ http أو https');
      }

      const validExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
      const pathname = urlObj.pathname.toLowerCase();
      
      if (!validExtensions.some(ext => pathname.endsWith(ext))) {
        errors.push('امتداد الصورة غير مدعوم. الامتدادات المدعومة: jpg, jpeg, png, gif, webp');
      }

    } catch (error) {
      errors.push('رابط الصورة غير صحيح');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate appointment data
   * التحقق من بيانات الموعد
   */
  static validateAppointmentData(data: {
    title?: string;
    scheduledAt?: Date;
    type?: string;
    clientPhone?: string;
  }): {
    isValid: boolean;
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!data.title || data.title.trim().length === 0) {
      errors.push('عنوان الموعد مطلوب');
    }

    if (!data.scheduledAt) {
      errors.push('تاريخ ووقت الموعد مطلوب');
    } else {
      const now = new Date();
      if (data.scheduledAt <= now) {
        errors.push('تاريخ الموعد يجب أن يكون في المستقبل');
      }

      // Check if it's a weekend (Friday or Saturday in Saudi Arabia)
      const dayOfWeek = data.scheduledAt.getDay();
      if (dayOfWeek === 5 || dayOfWeek === 6) {
        warnings.push('الموعد في نهاية الأسبوع، قد يحتاج لتأكيد إضافي');
      }

      // Check if it's outside business hours
      const hour = data.scheduledAt.getHours();
      if (hour < 9 || hour > 18) {
        warnings.push('الموعد خارج ساعات العمل الاعتيادية');
      }
    }

    const validTypes = ['viewing', 'meeting', 'consultation', 'evaluation'];
    if (data.type && !validTypes.includes(data.type)) {
      errors.push(`نوع الموعد غير صحيح. الأنواع المتاحة: ${validTypes.join(', ')}`);
    }

    if (data.clientPhone) {
      const phoneValidation = this.validatePhoneNumber(data.clientPhone);
      if (!phoneValidation.isValid) {
        errors.push(...phoneValidation.errors);
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Sanitize user input
   * تنظيف مدخلات المستخدم
   */
  static sanitizeInput(input: string): string {
    if (!input) return '';
    
    return input
      .trim()
      .replace(/[<>]/g, '') // Remove potential HTML tags
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/on\w+=/gi, '') // Remove event handlers
      .substring(0, 1000); // Limit length
  }

  /**
   * Validate environment variables
   * التحقق من متغيرات البيئة
   */
  static validateEnvironment(): {
    isValid: boolean;
    errors: string[];
    warnings: string[];
    missing: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];
    const missing: string[] = [];

    const requiredVars = [
      'DATABASE_URL',
      'JWT_SECRET'
    ];

    const optionalVars = [
      'OPENAI_API_KEY',
      'WHATSAPP_ACCESS_TOKEN',
      'WHATSAPP_API_URL',
      'UPLOADTHING_SECRET'
    ];

    // Check required variables
    requiredVars.forEach(varName => {
      if (!process.env[varName]) {
        missing.push(varName);
        errors.push(`متغير البيئة المطلوب غير موجود: ${varName}`);
      }
    });

    // Check optional variables
    optionalVars.forEach(varName => {
      if (!process.env[varName]) {
        warnings.push(`متغير البيئة الاختياري غير موجود: ${varName}`);
      }
    });

    // Validate DATABASE_URL format
    if (process.env.DATABASE_URL && !process.env.DATABASE_URL.startsWith('postgresql://')) {
      errors.push('DATABASE_URL يجب أن يبدأ بـ postgresql://');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      missing
    };
  }
}
