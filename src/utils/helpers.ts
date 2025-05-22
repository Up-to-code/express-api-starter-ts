/* eslint-disable @typescript-eslint/indent */
/**
 * Helper functions for the bot application
 */

/**
 * Check if text contains Arabic characters
 * @param {string} text - Text to check
 * @returns {boolean} Whether text contains Arabic characters
 */
export const containsArabic = (text: string): boolean => {
    const arabicPattern = /[\u0600-\u06FF]/;
    return arabicPattern.test(text);
  };
  
  /**
   * Check if text contains English characters
   * @param {string} text - Text to check
   * @returns {boolean} Whether text contains English characters
   */
  export const containsEnglish = (text: string): boolean => {
    const englishPattern = /[a-zA-Z]/;
    return englishPattern.test(text);
  };
  
  /**
   * Detect the primary language of a text
   * @param {string} text - Text to analyze
   * @returns {string} Detected language code ('ar', 'en', or 'unknown')
   */
  export const detectLanguage = (text: string): string => {
    const trimmedText = text.trim();
  
    if (!trimmedText) return 'unknown';
  
    const arabicCount = (trimmedText.match(/[\u0600-\u06FF]/g) || []).length;
    const englishCount = (trimmedText.match(/[a-zA-Z]/g) || []).length;
  
    if (arabicCount > englishCount) return 'ar';
    if (englishCount > arabicCount) return 'en';
    return 'unknown';
  };
  
  /**
   * Sanitize text by removing special characters and extra spaces
   * @param {string} text - Text to sanitize
   * @returns {string} Sanitized text
   */
  export const sanitizeText = (text: string): string => {
    return text
      .replace(/[^\w\s\u0600-\u06FF.?!]/g, '') // Keep alphanumeric, Arabic, spaces, and basic punctuation
      .replace(/\s+/g, ' ') // Replace multiple spaces with a single space
      .trim(); // Remove leading/trailing spaces
  };
  
  /**
   * Format a phone number to a standard format
   * @param {string} phone - Phone number to format
   * @returns {string} Formatted phone number
   */
  export const formatPhoneNumber = (phone: string): string => {
    // Remove all non-digit characters
    const digits = phone.replace(/\D/g, '');
  
    // Handle international format
    if (digits.startsWith('00')) {
      return '+' + digits.substring(2);
    }
  
    if (digits.startsWith('0')) {
      // Assume local number, add country code (adjust as needed)
      return '+966' + digits.substring(1);
    }
  
    if (digits.startsWith('966')) {
      return '+' + digits;
    }
  
    // If already in international format with +
    if (phone.startsWith('+')) {
      return phone;
    }
  
    // Default case - return as is with + prefix if it looks like a full number
    return digits.length > 10 ? '+' + digits : phone;
  };
  
  /**
   * Validate if a string is a valid phone number
   * @param {string} phone - Phone number to validate
   * @returns {boolean} Whether the phone number is valid
   */
  export const isValidPhoneNumber = (phone: string): boolean => {
    // Basic validation - adjust regex as needed for your requirements
    const phoneRegex = /^\+?[0-9]{10,15}$/;
    return phoneRegex.test(phone.replace(/\D/g, ''));
  };
  
  /**
   * Format a date to a readable string
   * @param {Date} date - Date to format
   * @returns {string} Formatted date string
   */
  export const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };
  
  /**
   * Calculate time elapsed since a given date
   * @param {Date} date - Start date
   * @returns {string} Human-readable time elapsed
   */
  export const timeElapsedSince = (date: Date): string => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.round(diffMs / 1000);
    const diffMin = Math.round(diffSec / 60);
    const diffHour = Math.round(diffMin / 60);
    const diffDay = Math.round(diffHour / 24);
  
    if (diffSec < 60) return `${diffSec} seconds ago`;
    if (diffMin < 60) return `${diffMin} minutes ago`;
    if (diffHour < 24) return `${diffHour} hours ago`;
    if (diffDay < 30) return `${diffDay} days ago`;
  
    return formatDate(date);
  };
  
  /**
   * Truncate text to a specified length with ellipsis
   * @param {string} text - Text to truncate
   * @param {number} maxLength - Maximum length
   * @returns {string} Truncated text
   */
  export const truncateText = (text: string, maxLength: number): string => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };
  
  /**
   * Extract keywords from text
   * @param {string} text - Text to extract keywords from
   * @param {number} minLength - Minimum keyword length
   * @returns {string[]} Array of keywords
   */
  export const extractKeywords = (text: string, minLength = 3): string[] => {
    // Remove special characters and convert to lowercase
    const cleanText = text.toLowerCase().replace(/[^\w\s\u0600-\u06FF]/g, '');
  
    // Split by whitespace and filter by length
    return cleanText
      .split(/\s+/)
      .filter((word) => word.length >= minLength)
      .filter((value, index, self) => self.indexOf(value) === index); // Remove duplicates
  };
  
  /**
   * Check if text contains a question
   * @param {string} text - Text to check
   * @returns {boolean} Whether the text contains a question
   */
  export const containsQuestion = (text: string): boolean => {
    // Check for question marks
    if (text.includes('?')) return true;
  
    // Check for common question words in English
    const englishQuestionWords = [
      'what',
      'when',
      'where',
      'which',
      'who',
      'whom',
      'whose',
      'why',
      'how',
      'can',
      'could',
      'would',
      'should',
      'is',
      'are',
      'do',
      'does',
      'did',
    ];
    const lowerText = text.toLowerCase();
  
    for (const word of englishQuestionWords) {
      if (lowerText.startsWith(word + ' ') || lowerText.includes(' ' + word + ' ')) {
        return true;
      }
    }
  
    // Check for common question words in Arabic
    const arabicQuestionWords = ['ماذا', 'متى', 'أين', 'من', 'لماذا', 'كيف', 'هل', 'أي', 'كم'];
  
    for (const word of arabicQuestionWords) {
      if (text.includes(word)) {
        return true;
      }
    }
  
    return false;
  };
  
  /**
   * Generate a random ID
   * @param {number} length - Length of the ID
   * @returns {string} Random ID
   */
  export const generateRandomId = (length = 10): string => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
  
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
  
    return result;
  };
  
  /**
   * Deep clone an object
   * @param {any} obj - Object to clone
   * @returns {any} Cloned object
   */
  export const deepClone = <T>(obj: T): T => {
    return JSON.parse(JSON.stringify(obj)) as T;
  };
  
  /**
   * Check if an object is empty
   * @param {object} obj - Object to check
   * @returns {boolean} Whether the object is empty
   */
  export const isEmptyObject = (obj: object): boolean => {
    return Object.keys(obj).length === 0;
  };
  
  /**
   * Sleep for a specified duration
   * @param {number} ms - Duration in milliseconds
   * @returns {Promise<void>} Promise that resolves after the duration
   */
  export const sleep = (ms: number): Promise<void> => {
    return new Promise<void>(resolve => setTimeout(resolve, ms));
  };
  