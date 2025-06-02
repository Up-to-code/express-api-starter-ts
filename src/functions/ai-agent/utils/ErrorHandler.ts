/**
 * إتجاه العقارية (Etjahh Real Estate) - Error Handler
 * معالج الأخطاء لشركة إتجاه العقارية
 */

import { logWithTimestamp } from '../../../utils/logger';
import { ErrorType } from '../types/AITypes';

/**
 * Custom Error Classes
 * فئات الأخطاء المخصصة
 */
export class AIAgentError extends Error {
  public readonly type: ErrorType;
  public readonly code: string;
  public readonly details?: any;
  public readonly timestamp: Date;

  constructor(
    message: string,
    type: ErrorType,
    code: string,
    details?: any
  ) {
    super(message);
    this.name = 'AIAgentError';
    this.type = type;
    this.code = code;
    this.details = details;
    this.timestamp = new Date();
  }
}

export class PropertySearchError extends AIAgentError {
  constructor(message: string, code: string = 'SEARCH_FAILED', details?: any) {
    super(message, ErrorType.DATABASE_ERROR, code, details);
    this.name = 'PropertySearchError';
  }
}

export class WhatsAppError extends AIAgentError {
  constructor(message: string, code: string = 'WHATSAPP_FAILED', details?: any) {
    super(message, ErrorType.WHATSAPP_ERROR, code, details);
    this.name = 'WhatsAppError';
  }
}

export class OpenAIError extends AIAgentError {
  constructor(message: string, code: string = 'OPENAI_FAILED', details?: any) {
    super(message, ErrorType.OPENAI_ERROR, code, details);
    this.name = 'OpenAIError';
  }
}

export class ValidationError extends AIAgentError {
  constructor(message: string, code: string = 'VALIDATION_FAILED', details?: any) {
    super(message, ErrorType.VALIDATION_ERROR, code, details);
    this.name = 'ValidationError';
  }
}

export class ConfigurationError extends AIAgentError {
  constructor(message: string, code: string = 'CONFIG_ERROR', details?: any) {
    super(message, ErrorType.CONFIGURATION_ERROR, code, details);
    this.name = 'ConfigurationError';
  }
}

/**
 * Error Handler Class
 * فئة معالج الأخطاء
 */
export class ErrorHandler {

  /**
   * Handle and format errors for user responses
   * معالجة وتنسيق الأخطاء لاستجابات المستخدم
   */
  static handleError(error: any, language: string = 'ar'): {
    userMessage: string;
    logMessage: string;
    shouldRetry: boolean;
    errorCode: string;
  } {
    let userMessage: string;
    let logMessage: string;
    let shouldRetry = false;
    let errorCode = 'UNKNOWN_ERROR';

    if (error instanceof AIAgentError) {
      errorCode = error.code;
      logMessage = `${error.name}: ${error.message} (Code: ${error.code})`;
      
      switch (error.type) {
        case ErrorType.DATABASE_ERROR:
          userMessage = language === 'ar'
            ? 'عذراً، حدث خطأ في قاعدة البيانات. يرجى المحاولة مرة أخرى.'
            : 'Sorry, a database error occurred. Please try again.';
          shouldRetry = true;
          break;

        case ErrorType.OPENAI_ERROR:
          userMessage = language === 'ar'
            ? 'عذراً، خدمة الذكاء الاصطناعي غير متاحة حالياً. سأحاول مساعدتك بطريقة أخرى.'
            : 'Sorry, AI service is currently unavailable. I\'ll try to help you another way.';
          shouldRetry = false;
          break;

        case ErrorType.WHATSAPP_ERROR:
          userMessage = language === 'ar'
            ? 'عذراً، حدث خطأ في إرسال الرسالة. يرجى المحاولة مرة أخرى.'
            : 'Sorry, there was an error sending the message. Please try again.';
          shouldRetry = true;
          break;

        case ErrorType.VALIDATION_ERROR:
          userMessage = language === 'ar'
            ? `عذراً، ${error.message}`
            : `Sorry, ${error.message}`;
          shouldRetry = false;
          break;

        case ErrorType.CONFIGURATION_ERROR:
          userMessage = language === 'ar'
            ? 'عذراً، هناك مشكلة في إعدادات النظام. يرجى المحاولة لاحقاً.'
            : 'Sorry, there\'s a system configuration issue. Please try again later.';
          shouldRetry = false;
          break;

        case ErrorType.NETWORK_ERROR:
          userMessage = language === 'ar'
            ? 'عذراً، حدث خطأ في الاتصال. يرجى التحقق من الاتصال والمحاولة مرة أخرى.'
            : 'Sorry, a connection error occurred. Please check your connection and try again.';
          shouldRetry = true;
          break;

        default:
          userMessage = language === 'ar'
            ? 'عذراً، حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.'
            : 'Sorry, an unexpected error occurred. Please try again.';
          shouldRetry = true;
      }
    } else {
      // Handle standard JavaScript errors
      logMessage = `Unhandled Error: ${error.message || error}`;
      
      if (error.name === 'TypeError') {
        userMessage = language === 'ar'
          ? 'عذراً، حدث خطأ في معالجة البيانات.'
          : 'Sorry, a data processing error occurred.';
        errorCode = 'TYPE_ERROR';
      } else if (error.name === 'NetworkError' || error.code === 'ENOTFOUND') {
        userMessage = language === 'ar'
          ? 'عذراً، حدث خطأ في الاتصال بالخدمة.'
          : 'Sorry, a service connection error occurred.';
        errorCode = 'NETWORK_ERROR';
        shouldRetry = true;
      } else {
        userMessage = language === 'ar'
          ? 'عذراً، حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.'
          : 'Sorry, an unexpected error occurred. Please try again.';
        errorCode = 'UNKNOWN_ERROR';
        shouldRetry = true;
      }
    }

    // Add company branding to user message
    userMessage += language === 'ar'
      ? '\n\n*شركة إتجاه العقارية* 🏢'
      : '\n\n*Etjahh Real Estate Company* 🏢';

    // Log the error
    logWithTimestamp(logMessage, 'error');

    return {
      userMessage,
      logMessage,
      shouldRetry,
      errorCode
    };
  }

  /**
   * Create specific error instances
   * إنشاء حالات أخطاء محددة
   */
  static createPropertySearchError(message: string, details?: any): PropertySearchError {
    return new PropertySearchError(message, 'PROPERTY_SEARCH_FAILED', details);
  }

  static createWhatsAppError(message: string, details?: any): WhatsAppError {
    return new WhatsAppError(message, 'WHATSAPP_API_FAILED', details);
  }

  static createOpenAIError(message: string, details?: any): OpenAIError {
    return new OpenAIError(message, 'OPENAI_API_FAILED', details);
  }

  static createValidationError(message: string, details?: any): ValidationError {
    return new ValidationError(message, 'VALIDATION_FAILED', details);
  }

  static createConfigurationError(message: string, details?: any): ConfigurationError {
    return new ConfigurationError(message, 'CONFIGURATION_ERROR', details);
  }

  /**
   * Wrap async functions with error handling
   * تغليف الدوال غير المتزامنة بمعالجة الأخطاء
   */
  static async withErrorHandling<T>(
    operation: () => Promise<T>,
    context: string,
    language: string = 'ar'
  ): Promise<{ success: boolean; data?: T; error?: any }> {
    try {
      const data = await operation();
      return { success: true, data };
    } catch (error: any) {
      const handledError = this.handleError(error, language);
      logWithTimestamp(`Error in ${context}: ${handledError.logMessage}`, 'error');
      return { success: false, error: handledError };
    }
  }

  /**
   * Retry mechanism for failed operations
   * آلية إعادة المحاولة للعمليات الفاشلة
   */
  static async withRetry<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    delay: number = 1000,
    context: string = 'operation'
  ): Promise<T> {
    let lastError: any;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error: any) {
        lastError = error;
        
        if (attempt === maxRetries) {
          logWithTimestamp(
            `${context} failed after ${maxRetries} attempts: ${error.message}`,
            'error'
          );
          throw error;
        }

        logWithTimestamp(
          `${context} attempt ${attempt} failed, retrying in ${delay}ms: ${error.message}`,
          'warn'
        );

        await new Promise(resolve => setTimeout(resolve, delay));
        delay *= 2; // Exponential backoff
      }
    }

    throw lastError;
  }

  /**
   * Validate and sanitize error details for logging
   * التحقق من وتنظيف تفاصيل الأخطاء للتسجيل
   */
  static sanitizeErrorForLogging(error: any): any {
    if (!error) return null;

    const sanitized: any = {
      name: error.name || 'Unknown',
      message: error.message || 'No message',
      timestamp: new Date().toISOString()
    };

    // Add stack trace in development
    if (process.env.NODE_ENV === 'development' && error.stack) {
      sanitized.stack = error.stack;
    }

    // Add custom properties for AIAgentError
    if (error instanceof AIAgentError) {
      sanitized.type = error.type;
      sanitized.code = error.code;
      sanitized.details = error.details;
    }

    // Remove sensitive information
    if (sanitized.details) {
      delete sanitized.details.password;
      delete sanitized.details.token;
      delete sanitized.details.apiKey;
      delete sanitized.details.secret;
    }

    return sanitized;
  }

  /**
   * Generate error report for debugging
   * توليد تقرير الأخطاء للتصحيح
   */
  static generateErrorReport(error: any, context: string): {
    id: string;
    timestamp: string;
    context: string;
    error: any;
    environment: string;
    version: string;
  } {
    return {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString(),
      context,
      error: this.sanitizeErrorForLogging(error),
      environment: process.env.NODE_ENV || 'unknown',
      version: process.env.npm_package_version || '1.0.0'
    };
  }
}
